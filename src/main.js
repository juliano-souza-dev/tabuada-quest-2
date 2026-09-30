import { SceneRuntime } from "./runtime/SceneRuntime.js?v=20260930-0020";
import { SceneResolver } from "./runtime/SceneResolver.js?v=20260930-0020";
import { installAuthRuntime } from "./runtime/auth/AuthRuntimeBridge.js?v=20260930-0020";

const app = document.querySelector("#app");
const resolver = await SceneResolver.load("./src/config/scene-catalog.json?v=20260930-0020");
const resolved = resolver.resolve("login");

const runtime = new SceneRuntime(app, { width: 390, height: 844 });
const services = await installAuthRuntime(runtime, {
  configUrl: "./src/config/firebase-public.json?v=20260930-0020"
});
await runtime.load(resolved.scene.path);

globalThis.TabuadaQuest = {
  ...(globalThis.TabuadaQuest || {}),
  runtime,
  auth: services.auth,
  playerState: services.playerState,
  getAccessStatus: services.getStatus
};

// PROD policy: never keep stale Service Workers or Cache Storage.
if ("serviceWorker" in navigator) {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => registration.unregister()));
}
if ("caches" in window) {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
}
