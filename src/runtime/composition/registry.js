import { CompositionEngine } from "./CompositionEngine.js?v=20260929-2208";
import { OceanEffect } from "../OceanEffect.js?v=20260929-2208";

export function createCompositionEngine(runtime) {
  return new CompositionEngine(runtime, {
    ocean: OceanEffect
  });
}
