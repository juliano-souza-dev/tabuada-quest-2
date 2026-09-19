(() => {
    const status = document.querySelector("#runtime-status");

    if (!status) {
        return;
    }

    const runningInsideAndroid =
        /Android/i.test(navigator.userAgent) &&
        window.location.protocol === "file:";

    status.textContent = runningInsideAndroid ? "Android / WebView" : "Navegador";
})();
