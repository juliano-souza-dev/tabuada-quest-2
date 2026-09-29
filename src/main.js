import { SceneRuntime } from "./runtime/SceneRuntime.js?v=20260929-2238";

const app = document.querySelector("#app");
const runtime = new SceneRuntime(app, { width: 390, height: 844 });
await runtime.load("./src/scenes/login.scene.json?v=20260929-2238");

// PROD policy: never keep stale Service Workers or Cache Storage.
if ("serviceWorker" in navigator) {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => registration.unregister()));
}
if ("caches" in window) {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
}
