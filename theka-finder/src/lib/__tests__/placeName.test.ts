import test from "node:test";
import assert from "node:assert/strict";
import { isPlaceLabelNotBusiness as isLabel } from "../placeName";

test("bare neighbourhood names are labels, not businesses", () => {
  for (const n of ["Colaba", "Sewri", "colaba", "'Jogeshwari'", "Bandra"]) {
    assert.equal(isLabel(n), true, n);
  }
});

test("real businesses containing a place name are kept", () => {
  for (const n of [
    "Mumbai Wine Shop",
    "BrewDog Mumbai Bandra",
    "The Finch Mumbai",
    "Colaba Social",
    "Sewri Wines",
    // A real shop that happens to include its own address.
    "Chincholi wine Malad west,mumbai",
  ]) {
    assert.equal(isLabel(n), false, `should keep: ${n}`);
  }
});

test("non-Latin names are kept", () => {
  // Marathi and Hindi shop names must survive; an earlier normalisation
  // stripped them to nothing and dropped every one.
  for (const n of ["वाईन शॉप", "मद्य दुकान", "คนติดหนังไทย"]) {
    assert.equal(isLabel(n), false, `should keep: ${n}`);
  }
});

test("empty names are rejected", () => {
  assert.equal(isLabel(""), true);
  assert.equal(isLabel("   "), true);
});
