(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const MAX_ZIP_BYTES = 80 * 1024 * 1024;
    const MAX_ENTRY_COUNT = 150;
    const MAX_ENTRY_BYTES = 30 * 1024 * 1024;
    const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

    const GROUPS = Object.freeze({
        header: Object.freeze({ id: "header", label: "Header" }),
        scene: Object.freeze({ id: "scene", label: "Cenário" }),
        buttons: Object.freeze({ id: "buttons", label: "UI Buttons" }),
        mixed: Object.freeze({ id: "mixed", label: "Misto" })
    });

    const IMAGE_MIME = Object.freeze({
        webp: "image/webp",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        avif: "image/avif"
    });

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
    }

    function extOf(name) {
        const match = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
        return match ? match[1] : "";
    }

    function mimeFromName(name) {
        return IMAGE_MIME[extOf(name)] || "application/octet-stream";
    }

    function isImagePath(path) {
        return Boolean(IMAGE_MIME[extOf(path)]);
    }

    function readU16(view, offset) {
        return view.getUint16(offset, true);
    }

    function readU32(view, offset) {
        return view.getUint32(offset, true);
    }

    function findEndOfCentralDirectory(bytes) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const minimum = Math.max(0, bytes.byteLength - 65557);
        for (let offset = bytes.byteLength - 22; offset >= minimum; offset -= 1) {
            if (readU32(view, offset) === 0x06054b50) return offset;
        }
        return -1;
    }

    async function inflateRaw(bytes) {
        if (typeof root.DecompressionStream !== "function") {
            throw new Error("Este navegador não oferece descompactação ZIP compatível.");
        }
        const stream = new Blob([bytes])
            .stream()
            .pipeThrough(new root.DecompressionStream("deflate-raw"));
        return new Uint8Array(await new Response(stream).arrayBuffer());
    }

    function safeEntryPath(name) {
        const normalized = String(name || "").replace(/\\/g, "/").replace(/^\/+/, "");
        if (!normalized || normalized.includes("../") || normalized.startsWith("../")) {
            throw new Error("O ZIP contém um caminho inválido.");
        }
        return normalized;
    }

    async function extractImages(file) {
        if (!(file instanceof Blob)) throw new Error("Selecione um arquivo ZIP.");
        if (file.size > MAX_ZIP_BYTES) {
            throw new Error("ZIP muito grande. Limite: 80 MB.");
        }

        const bytes = new Uint8Array(await file.arrayBuffer());
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const eocd = findEndOfCentralDirectory(bytes);
        if (eocd < 0) throw new Error("Não encontrei a estrutura central do ZIP.");

        const totalEntries = readU16(view, eocd + 10);
        const centralSize = readU32(view, eocd + 12);
        const centralOffset = readU32(view, eocd + 16);

        if (totalEntries > MAX_ENTRY_COUNT) {
            throw new Error("O ZIP possui arquivos demais. Limite: " + MAX_ENTRY_COUNT + ".");
        }
        if (centralOffset + centralSize > bytes.byteLength) {
            throw new Error("ZIP inválido ou incompleto.");
        }

        const decoder = new TextDecoder("utf-8");
        const entries = [];
        let expandedTotal = 0;
        let cursor = centralOffset;

        for (let index = 0; index < totalEntries; index += 1) {
            if (cursor + 46 > bytes.byteLength || readU32(view, cursor) !== 0x02014b50) {
                throw new Error("Diretório central do ZIP inválido.");
            }

            const flags = readU16(view, cursor + 8);
            const method = readU16(view, cursor + 10);
            const compressedSize = readU32(view, cursor + 20);
            const uncompressedSize = readU32(view, cursor + 24);
            const nameLength = readU16(view, cursor + 28);
            const extraLength = readU16(view, cursor + 30);
            const commentLength = readU16(view, cursor + 32);
            const localOffset = readU32(view, cursor + 42);
            const nameStart = cursor + 46;
            const nameEnd = nameStart + nameLength;

            if (nameEnd > bytes.byteLength) throw new Error("Nome de arquivo inválido no ZIP.");
            const path = safeEntryPath(decoder.decode(bytes.subarray(nameStart, nameEnd)));
            cursor = nameEnd + extraLength + commentLength;

            if (path.endsWith("/") || !isImagePath(path)) continue;
            if (flags & 0x1) throw new Error("ZIP protegido por senha não é suportado.");
            if (uncompressedSize > MAX_ENTRY_BYTES) {
                throw new Error(path + " excede o limite de 30 MB descompactado.");
            }

            expandedTotal += uncompressedSize;
            if (expandedTotal > MAX_TOTAL_BYTES) {
                throw new Error("Conteúdo descompactado excede 200 MB.");
            }

            if (localOffset + 30 > bytes.byteLength || readU32(view, localOffset) !== 0x04034b50) {
                throw new Error("Cabeçalho local inválido para " + path + ".");
            }

            const localNameLength = readU16(view, localOffset + 26);
            const localExtraLength = readU16(view, localOffset + 28);
            const dataStart = localOffset + 30 + localNameLength + localExtraLength;
            const dataEnd = dataStart + compressedSize;
            if (dataEnd > bytes.byteLength) throw new Error(path + " está incompleto.");

            const compressed = bytes.subarray(dataStart, dataEnd);
            let output;
            if (method === 0) {
                output = new Uint8Array(compressed);
            } else if (method === 8) {
                output = await inflateRaw(compressed);
            } else {
                throw new Error(path + " usa um método de compressão não suportado (" + method + ").");
            }

            if (uncompressedSize && output.byteLength !== uncompressedSize) {
                throw new Error(path + " não foi descompactado corretamente.");
            }

            const name = path.split("/").pop() || path;
            const mimeType = mimeFromName(name);
            const blob = new Blob([output], { type: mimeType });
            const imageFile = typeof File === "function"
                ? new File([blob], name, { type: mimeType })
                : Object.assign(blob, { name });

            entries.push(Object.freeze({
                path,
                name,
                mimeType,
                size: output.byteLength,
                file: imageFile
            }));
        }

        if (!entries.length) {
            throw new Error("O ZIP não contém imagens compatíveis.");
        }

        return entries;
    }

    function groupSlots(slots, groupId) {
        const group = GROUPS[groupId] ? groupId : "mixed";
        const list = Array.isArray(slots) ? slots : [];

        if (group === "header") return list.filter((slot) => slot.group === "header");
        if (group === "buttons") return list.filter((slot) => slot.group === "buttons");
        if (group === "scene") {
            return list.filter((slot) => String(slot.group || "").startsWith("background-"));
        }
        return list;
    }

    function firstFree(slots, used, predicate) {
        const slot = slots.find((item) => !used.has(item.id) && predicate(item));
        return slot?.id || null;
    }

    function exact(slots, used, id) {
        const slot = slots.find((item) => item.id === id && !used.has(item.id));
        return slot?.id || null;
    }

    function classifyOne(entry, slots, groupId, used) {
        const token = normalize(entry.path + " " + entry.name);

        const headerGuess = () => {
            if (/\b(nivel|level|badge)\b/.test(token)) return exact(slots, used, "home.header.level-plate");
            if (/\blogo\b/.test(token)) return exact(slots, used, "home.header.logo");
            if (/\b(avatar|rosto|face|profile|perfil)\b/.test(token)) return exact(slots, used, "home.header.avatar");
            if (/\b(frame|moldura|header|placa|plate)\b/.test(token)) return exact(slots, used, "home.header.frame");
            return null;
        };

        const buttonGuess = () => {
            const map = [
                [/(jogar|play)/, "home.button.play"],
                [/(tripulacao|crew)/, "home.button.crew"],
                [/(estaleiro|shipyard)/, "home.button.shipyard"],
                [/(regiao|regions?)/, "home.button.regions"],
                [/(loja|shop|store)/, "home.button.shop"],
                [/(itens?|items?|bau|chest)/, "home.button.items"],
                [/(recompensa|daily|reward)/, "home.button.daily-reward"],
                [/(colecion|collectible|collection)/, "home.button.collectibles"]
            ];
            for (const [pattern, id] of map) {
                if (pattern.test(token)) return exact(slots, used, id);
            }
            return null;
        };

        const sceneGuess = () => {
            if (/\b(oceano|ocean|sea|mar|water)\b/.test(token)) {
                return firstFree(slots, used, (slot) => slot.group === "background-ocean");
            }
            if (/\b(pier|cais|dock|doca|wharf)\b/.test(token)) {
                return firstFree(slots, used, (slot) => slot.group === "background-pier");
            }
            if (/\b(nuvem|cloud)\b/.test(token)) {
                return firstFree(slots, used, (slot) => slot.group === "background-clouds");
            }
            if (/\b(navio|ship|barco|boat)\b/.test(token)) {
                return firstFree(slots, used, (slot) => slot.group === "background-ships");
            }
            if (/\b(ilha|island)\b/.test(token)) {
                return firstFree(slots, used, (slot) => slot.group === "background-islands");
            }
            if (/\b(avatar completo|avatar full|character|personagem|hero)\b/.test(token)) {
                return exact(slots, used, "home.character.avatar-full");
            }
            return firstFree(slots, used, (slot) => slot.group === "background-scenery");
        };

        if (groupId === "header") return headerGuess();
        if (groupId === "buttons") return buttonGuess();
        if (groupId === "scene") return sceneGuess();

        return headerGuess() || buttonGuess() || sceneGuess();
    }

    function suggestAssignments(entries, allSlots, groupId) {
        const slots = groupSlots(allSlots, groupId);
        const used = new Set();

        return (entries || []).map((entry) => {
            const slotId = classifyOne(entry, slots, groupId, used);
            if (slotId) used.add(slotId);
            return {
                entry,
                included: true,
                slotId,
                confidence: slotId ? "suggested" : "review"
            };
        });
    }

    function validateAssignments(options = {}) {
        const assignments = Array.isArray(options.assignments) ? options.assignments : [];
        const slots = Array.isArray(options.slots) ? options.slots : [];
        const groupId = GROUPS[options.groupId] ? options.groupId : "mixed";
        const limits = options.limits && typeof options.limits === "object" ? options.limits : {};
        const occupied = new Set(options.occupiedSlotIds || []);
        const errors = [];
        const warnings = [];
        const seen = new Set();
        const selected = assignments.filter((item) => item?.included);

        if (!selected.length) errors.push("Selecione pelo menos um asset.");

        selected.forEach((item) => {
            if (!item.slotId) {
                errors.push(item.entry?.name + ": escolha um destino.");
                return;
            }
            if (!slots.some((slot) => slot.id === item.slotId)) {
                errors.push(item.entry?.name + ": destino inválido para este pacote.");
                return;
            }
            if (seen.has(item.slotId)) {
                errors.push("Dois assets estão apontando para " + item.slotId + ".");
                return;
            }
            seen.add(item.slotId);
            occupied.add(item.slotId);
        });

        const relevant = groupSlots(slots, groupId);

        relevant
            .filter((slot) => slot.required)
            .forEach((slot) => {
                if (!occupied.has(slot.id)) {
                    errors.push(slot.label + " é obrigatório.");
                }
            });

        if (groupId === "scene" || groupId === "mixed") {
            Object.entries(limits).forEach(([group, limit]) => {
                const groupSlotsList = slots.filter((slot) => slot.group === group);
                if (!groupSlotsList.length) return;
                const count = groupSlotsList.filter((slot) => occupied.has(slot.id)).length;
                const min = Number(limit?.min);
                const max = Number(limit?.max);
                if (Number.isFinite(min) && count < min) {
                    errors.push((limit.label || group) + ": mínimo " + min + ".");
                }
                if (Number.isFinite(max) && count > max) {
                    errors.push((limit.label || group) + ": máximo " + max + ".");
                }
            });
        }

        assignments
            .filter((item) => item?.included && !item.slotId)
            .forEach((item) => warnings.push(item.entry?.name + " precisa de revisão."));

        return Object.freeze({
            valid: errors.length === 0,
            errors: Object.freeze(errors),
            warnings: Object.freeze(warnings),
            selectedCount: selected.length
        });
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.zipImporter = Object.freeze({
        GROUPS,
        MAX_ZIP_BYTES,
        MAX_ENTRY_COUNT,
        MAX_ENTRY_BYTES,
        MAX_TOTAL_BYTES,
        normalize,
        mimeFromName,
        isImagePath,
        extractImages,
        groupSlots,
        suggestAssignments,
        validateAssignments
    });
})(globalThis);
