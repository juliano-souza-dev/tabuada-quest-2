(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const AVATARS = Object.freeze([
        Object.freeze({ id: "luna", label: "Luna" }),
        Object.freeze({ id: "maya", label: "Maya" }),
        Object.freeze({ id: "sofia", label: "Sofia" })
    ]);

    function renderProfileScreen({ state, status, onStateChange }) {
        let selectedAvatarId = AVATARS.some((item) => item.id === state.player.avatarId)
            ? state.player.avatarId
            : AVATARS[0].id;

        const screen = document.createElement("section");
        screen.className = "profile-setup-screen";
        screen.setAttribute("aria-label", "Criar perfil");

        const isNative = Boolean(status?.native);
        screen.innerHTML = `
            <form class="profile-setup-card">
                <p class="auth-eyebrow">${isNative ? "CONTA GOOGLE CONECTADA" : "MODO NAVEGADOR · TESTE LOCAL"}</p>
                <h1>Crie seu perfil</h1>
                <p class="auth-copy">
                    ${isNative
                        ? "Esse perfil será salvo no aparelho e sincronizado com sua conta."
                        : "No navegador, o perfil fica somente neste dispositivo e não exige login."}
                </p>

                <label class="profile-name-field">
                    <span>Nome do jogador</span>
                    <input
                        name="displayName"
                        type="text"
                        maxlength="24"
                        autocomplete="nickname"
                        placeholder="Digite seu nome"
                        required>
                </label>

                <fieldset class="profile-avatar-picker">
                    <legend>Escolha seu avatar</legend>
                    <div class="profile-avatar-grid">
                        ${AVATARS.map((avatar) => `
                            <button
                                type="button"
                                class="profile-avatar-option ${avatar.id === selectedAvatarId ? "is-selected" : ""}"
                                data-avatar-id="${avatar.id}"
                                aria-pressed="${avatar.id === selectedAvatarId}">
                                <img src="${TQ.content.assets.avatars[avatar.id]}" alt="">
                                <strong>${avatar.label}</strong>
                            </button>
                        `).join("")}
                    </div>
                </fieldset>

                <div class="profile-form-error" role="alert" hidden></div>
                <button class="auth-primary-button" type="submit">Criar perfil e jogar</button>
            </form>
        `;

        const error = screen.querySelector(".profile-form-error");

        screen.addEventListener("click", (event) => {
            const avatarButton = event.target.closest("[data-avatar-id]");
            if (!avatarButton) return;
            selectedAvatarId = avatarButton.dataset.avatarId;
            screen.querySelectorAll("[data-avatar-id]").forEach((item) => {
                const selected = item.dataset.avatarId === selectedAvatarId;
                item.classList.toggle("is-selected", selected);
                item.setAttribute("aria-pressed", String(selected));
            });
        });

        screen.querySelector("form").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const displayName = String(formData.get("displayName") || "").trim();

            if (displayName.length < 2) {
                error.textContent = "Digite um nome com pelo menos 2 caracteres.";
                error.hidden = false;
                return;
            }

            const allowedAvatarIds = AVATARS.map((item) => item.id);
            const playerId = isNative && typeof status?.uid === "string" && status.uid
                ? status.uid
                : "browser-local-player";
            const freshState = TQ.domain.playerState.createFreshProfile(
                displayName,
                selectedAvatarId,
                playerId,
                allowedAvatarIds
            );

            onStateChange(freshState);
            if (isNative) {
                TQ.persistence.localStorage.requestSync();
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.profileSetup = Object.freeze({ renderProfileScreen });
})(globalThis);
