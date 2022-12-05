import fs from "fs";
import { assert } from "chai";

export enum ESnapshotType {
  EMPTY = "EmptyContract",
  PARENTS = "Parents",
  PARENTS_WITH_PARAMS = "ParentsWIthParams",
  USING = "Using",
  CONSTRUCTOR = "Constructor",
  CONSTRUCTOR_ARGS = "ConstructorArgs",
  ARGS = "Args",
  SIMPLE_FUNCTION = "SimpleFunction",
  OVERRIDE_FUNCTION = "OverrideFunction",
  FUNCTION_WITH_ARGS = "FunctionWithArgs",
  FUNCTION_WITH_MODIFIER = "FunctionWithModifier",
  FULL_CONTRACT = "FullContract",
  MODIFIER_FUNCTION = "ModifierFunction",
  EVENT = "Event",
  ENUM = "Enumeration",
}

export function assertToEqual(source: string, type: ESnapshotType) {
  const path = `${__dirname}/snapshots/${type}.sol`;
  if (fs.existsSync(path)) {
    const snapshot = fs.readFileSync(path, "utf-8");
    assert.equal(source.trim(), snapshot.trim());
  } else {
    throw new Error("Snapshot not found");
  }
}
