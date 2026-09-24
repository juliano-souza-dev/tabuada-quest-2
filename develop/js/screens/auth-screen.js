(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function authMessage(code) {
        const messages = {
            firebase_not_configured: "O Firebase não está configurado neste APK.",
            google_web_client_id_missing: "O Google Sign-In não está configurado neste APK.",
            google_sign_in_cancelled_or_failed: "O login foi cancelado ou não pôde ser concluído.",
            firebase_google_sign_in_failed: "O Google autenticou, mas o Firebase recusou a sessão.",
            google_credential_invalid: "A credencial recebida do Google é inválida.",
            google_token_parse_failed: "Não foi possível validar a credencial do Google.",
            restore_failed: "Não foi possível consultar seu progresso na nuvem.",
            auth_required: "Sua sessão expirou. Entre novamente."
        };
        return messages[code] || "";
    }

    function renderAuthScreen({
        status,
        busy = false,
        restoring = false,
        errorCode = "",
        onGoogleSignIn,
        onRetryRestore,
        onSignOut
    }) {
        const screen = document.createElement("section");
        screen.className = "auth-screen";
        screen.setAttribute("aria-label", "Entrar no Tabuada Quest");

        const authenticated = Boolean(status?.authenticated);
        const message = authMessage(errorCode);

        screen.innerHTML = `
            <div class="auth-card">
                <div class="auth-brand-mark" aria-hidden="true">☠️</div>
                <p class="auth-eyebrow">TABUADA QUEST 2</p>
                <h1>${authenticated ? "Buscando seu progresso" : "Entre para começar"}</h1>
                <p class="auth-copy">
                    ${authenticated
                        ? "Sua conta Google está conectada. Vamos verificar se já existe um perfil salvo antes de continuar."
                        : "No aplicativo, o perfil fica ligado à sua conta para manter o progresso sincronizado."}
                </p>

                ${message ? `<div class="auth-alert" role="alert">${message}</div>` : ""}

                ${authenticated && restoring ? `
                    <div class="auth-loading" role="status">
                        <span class="auth-spinner" aria-hidden="true"></span>
                        <strong>Sincronizando...</strong>
                    </div>
                ` : ""}

                ${!authenticated ? `
                    <button class="auth-google-button" type="button" data-action="google" ${busy ? "disabled" : ""}>
                        <span class="google-g" aria-hidden="true">G</span>
                        <span>${busy ? "Abrindo Google..." : "Entrar com Google"}</span>
                    </button>
                ` : ""}

                ${authenticated && !restoring && errorCode ? `
                    <button class="auth-primary-button" type="button" data-action="retry">Tentar sincronizar novamente</button>
                    <button class="auth-text-button" type="button" data-action="sign-out">Trocar conta</button>
                ` : ""}

                <small class="auth-footnote">O modo navegador continua disponível para desenvolvimento e testes locais.</small>
            </div>
        `;

        screen.addEventListener("click", (event) => {
            const button = event.target.closest("[data-action]");
            if (!button || button.disabled) return;
            if (button.dataset.action === "google") onGoogleSignIn?.();
            if (button.dataset.action === "retry") onRetryRestore?.();
            if (button.dataset.action === "sign-out") onSignOut?.();
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.auth = Object.freeze({ renderAuthScreen });
})(globalThis);
