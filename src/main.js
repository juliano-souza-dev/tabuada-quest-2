import { SceneRuntime } from "./runtime/SceneRuntime.js?v=20260930-0012";
import { SceneResolver } from "./runtime/SceneResolver.js?v=20260930-0012";

const app = document.querySelector("#app");
const resolver = await SceneResolver.load("./src/config/scene-catalog.json?v=20260930-0012");
const resolved = resolver.resolve("login");

const runtime = new SceneRuntime(app, { width: 390, height: 844 });
await runtime.load(resolved.scene.path);

// PROD policy: never keep stale Service Workers or Cache Storage.
if ("serviceWorker" in navigator) {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => registration.unregister()));
}
if ("caches" in window) {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
}
