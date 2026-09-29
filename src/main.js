import { SceneRuntime } from "./runtime/SceneRuntime.js?v=20260929-2257";
import { DevOverlay } from "./dev/DevOverlay.js?v=20260929-2257";

const app = document.querySelector("#app");
const runtime = new SceneRuntime(app, { width: 390, height: 844 }, { editorEnabled: true });
await runtime.load("./src/scenes/login.scene.json?v=20260929-2257");

const dev = new DevOverlay(document.body, runtime);
dev.mount();

// DEV policy: never register a Service Worker and purge old caches/registrations.
// Every reload must request the current repository deployment.
if ("serviceWorker" in navigator) {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => registration.unregister()));
}
if ("caches" in window) {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
}
