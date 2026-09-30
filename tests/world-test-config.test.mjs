import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config=JSON.parse(await readFile(new URL("../src/world/world-test.world.json",import.meta.url),"utf8"));

test("world prototype has finite positive dimensions",()=>{
  assert.ok(Number.isFinite(config.width)&&config.width>390);
  assert.ok(Number.isFinite(config.height)&&config.height>844);
});

test("world entities have unique ids and stay inside world bounds",()=>{
  const seen=new Set();
  for(const entity of config.entities||[]){
    assert.ok(entity.id);
    assert.equal(seen.has(entity.id),false,"duplicate entity id: "+entity.id);
    seen.add(entity.id);
    assert.ok(entity.x>=0&&entity.x<=config.width,"x outside world: "+entity.id);
    assert.ok(entity.y>=0&&entity.y<=config.height,"y outside world: "+entity.id);
  }
});

test("location entities point to scene files",()=>{
  for(const entity of (config.entities||[]).filter(item=>item.type==="location")){
    assert.ok(String(entity.scene||"").endsWith(".scene.json"),"missing scene for "+entity.id);
  }
});
