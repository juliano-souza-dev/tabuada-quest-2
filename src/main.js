import { SceneRuntime } from "./runtime/SceneRuntime.js";
import { DevOverlay } from "./dev/DevOverlay.js";

const app = document.querySelector("#app");
const runtime = new SceneRuntime(app, { width: 390, height: 844 });
await runtime.load("./src/scenes/login.scene.json");

const dev = new DevOverlay(document.body, runtime);
dev.mount();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(console.warn);
}
