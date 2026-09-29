import { CompositionEngine } from "./CompositionEngine.js?v=20260929-2358";
import { OceanEffect } from "../OceanEffect.js?v=20260929-2358";
import { ShipEffect } from "../ShipEffect.js?v=20260929-2358";

export function createCompositionEngine(runtime) {
  return new CompositionEngine(runtime, {
    ocean: OceanEffect,
    ship: ShipEffect
  });
}
