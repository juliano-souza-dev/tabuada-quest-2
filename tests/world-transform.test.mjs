import test from "node:test";
import assert from "node:assert/strict";
import { transformMatrix, transformVector, inverseVector } from "../src/world/WorldTransform.mjs";

const close=(actual,expected,epsilon=1e-9)=>assert.ok(Math.abs(actual-expected)<=epsilon,`${actual} != ${expected}`);

test("identity transform preserves vectors",()=>{
  const matrix=transformMatrix();
  assert.deepEqual(transformVector(matrix,12,-7),{x:12,y:-7});
});

test("inverseVector reverses rotation, skew and scale",()=>{
  const matrix=transformMatrix(37,12,-8,1.4,.75);
  const source={x:123.5,y:-44.25};
  const transformed=transformVector(matrix,source.x,source.y);
  const restored=inverseVector(matrix,transformed.x,transformed.y);
  close(restored.x,source.x);
  close(restored.y,source.y);
});

test("scale is normalized to a positive safe minimum",()=>{
  const matrix=transformMatrix(0,0,0,0,-2);
  close(matrix.a,.01);
  close(matrix.d,2);
});

test("singular inverse fails safely",()=>{
  assert.deepEqual(inverseVector({a:1,b:2,c:2,d:4},10,20),{x:0,y:0});
});
