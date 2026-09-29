import { CompositionEngine } from "./CompositionEngine.js?v=20260929-2340";
import { OceanEffect } from "../OceanEffect.js?v=20260929-2340";
import { ShipEffect } from "../ShipEffect.js?v=20260929-2340";

export function createCompositionEngine(runtime) {
  return new CompositionEngine(runtime, {
    ocean: OceanEffect,
    ship: ShipEffect
  });
}
