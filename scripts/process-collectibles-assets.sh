#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COLLECTIBLES_DIR="$ROOT_DIR/web/assets/collectibles"
ITEMS_DIR="$COLLECTIBLES_DIR/items"
MANIFEST_PATH="$ROOT_DIR/web/js/content/collectibles-assets.js"

mkdir -p "$ITEMS_DIR"

shopt -s nullglob
png_files=("$COLLECTIBLES_DIR"/*.png)

for source in "${png_files[@]}"; do
    filename="$(basename "$source")"
    stem="${filename%.png}"

    if [[ "$filename" == "colecionaveis-background.png" ]]; then
        cwebp -quiet -q 88 -m 6 "$source" -o "$COLLECTIBLES_DIR/colecionaveis-background.webp"
        rm -f "$source"
        continue
    fi

    temp_png="$(mktemp --suffix=.png)"
    convert "$source"         -resize '220x220>'         -background none         -gravity center         -extent 256x256         "$temp_png"

    cwebp -quiet -q 88 -alpha_q 100 -m 6 "$temp_png" -o "$ITEMS_DIR/$stem.webp"

    rm -f "$temp_png" "$source"
done

node - "$ITEMS_DIR" "$MANIFEST_PATH" <<'NODE'
const fs = require("node:fs");

const itemsDir = process.argv[2];
const manifestPath = process.argv[3];

const files = fs.readdirSync(itemsDir)
    .filter((name) => name.toLowerCase().endsWith(".webp"))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" }));

const entries = files.map((file, index) => {
    const match = file.match(/^(\d+)_/);
    const numericId = match ? Number(match[1]) : index + 1;

    if (!Number.isInteger(numericId) || numericId < 1 || numericId > 90) {
        throw new Error(`Asset fora do catálogo 1..90: ${file}`);
    }

    return {
        id: `collectible-${String(numericId).padStart(3, "0")}`,
        asset: `./assets/collectibles/items/${file}`
    };
});

const ids = entries.map((entry) => entry.id);
if (new Set(ids).size !== ids.length) {
    throw new Error("Há dois assets apontando para o mesmo collectible ID.");
}

const lines = entries.map(
    ({ id, asset }) => `        Object.freeze({ id: "${id}", asset: "${asset}" })`
);

const output = `(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    TQ.content = TQ.content || {};

    TQ.content.collectibleAssetManifest = Object.freeze([
${lines.join(",\n")}
    ]);
})(globalThis);
`;

fs.writeFileSync(manifestPath, output, "utf8");
NODE

echo "Colecionáveis processados: $(find "$ITEMS_DIR" -maxdepth 1 -type f -name '*.webp' | wc -l)"
