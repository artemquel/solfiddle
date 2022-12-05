import { Contract } from "../../src/Contract";
import { IBuilder } from "../../src/Builder/types";
import { createSandbox, SinonSandbox } from "sinon";
import { Builder } from "../../src/Builder";
import {
  constructorArgs,
  event,
  fullContract,
  functionWithArgs,
  functionWithModifier,
  modifier,
  overrideFunction,
  parents,
  parentsWithParams,
  simpleFunction,
  using,
} from "./constants";
import { assertToEqual, ESnapshotType } from "./helpers";

describe("Builder", () => {
  let sandbox: SinonSandbox;
  let contract: Contract;
  let builder: IBuilder;

  beforeEach(() => {
    sandbox = createSandbox();

    contract = new Contract("TestContract");
    builder = new Builder(contract);
  });

  describe("getSource", () => {
    describe("Empty contract", () => {
      it("should return source of empty contract", () => {
        const source = builder.getSource();
        assertToEqual(source, ESnapshotType.EMPTY);
      });
    });

    describe("Parents", () => {
      it("should return source with parents", () => {
        sandbox.stub(contract, "parents").get(() => parents);
        sandbox
          .stub(contract, "imports")
          .get(() => parents.map(({ contract }) => contract.path));

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.PARENTS);
      });

      it("should return source with parents with constructor params", () => {
        sandbox.stub(contract, "parents").get(() => parentsWithParams);
        sandbox
          .stub(contract, "imports")
          .get(() => parents.map(({ contract }) => contract.path));

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.PARENTS_WITH_PARAMS);
      });
    });

    describe("Using", () => {
      it("should return contract with using", () => {
        sandbox.stub(contract, "using").get(() => using);
        sandbox
          .stub(contract, "imports")
          .get(() => using.map(({ library }) => library.path));

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.USING);
      });
    });

    describe("Constructor", () => {
      it("should return contract with constructor with code", () => {
        sandbox
          .stub(contract, "constructorCode")
          .get(() => ["uint256 value = 256;"]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.CONSTRUCTOR);
      });

      it("should return contract with constructor with code and arguments", () => {
        sandbox.stub(contract, "constructorArgs").get(() => constructorArgs);
        sandbox
          .stub(contract, "constructorCode")
          .get(() => ["uint256 value = numberValue;"]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.CONSTRUCTOR_ARGS);
      });
    });

    describe("Variables", () => {
      it("should return contract with variables", () => {
        sandbox
          .stub(contract, "variables")
          .get(() => ["uint256 value1 = 15;", "bool isActive = true;"]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.ARGS);
      });
    });

    describe("Functions", () => {
      it("should return contract with simple function", () => {
        sandbox.stub(contract, "functions").get(() => [simpleFunction]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.SIMPLE_FUNCTION);
      });

      it("should return contract with override function", () => {
        sandbox.stub(contract, "functions").get(() => [overrideFunction]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.OVERRIDE_FUNCTION);
      });

      it("should return contract with function with args", () => {
        sandbox.stub(contract, "functions").get(() => [functionWithArgs]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.FUNCTION_WITH_ARGS);
      });

      it("should return contract with function with modifier", () => {
        sandbox.stub(contract, "functions").get(() => [functionWithModifier]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.FUNCTION_WITH_MODIFIER);
      });
    });

    describe("Modifiers", () => {
      it("should return contract with modifier functions", () => {
        sandbox.stub(contract, "modifiers").get(() => [modifier]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.MODIFIER_FUNCTION);
      });
    });

    describe("Events", () => {
      it("should return contract with events", () => {
        sandbox.stub(contract, "events").get(() => [event]);

        const source = builder.getSource();

        assertToEqual(source, ESnapshotType.EVENT);
      });
    });

    describe("Whole contract", () => {
      it("should return correct contract", () => {
        const {
          constructorArgs,
          constructorCode,
          using,
          parents,
          variables,
          name,
          imports,
          functions,
          modifiers,
          events,
        } = fullContract;
        sandbox.stub(contract, "constructorArgs").get(() => constructorArgs);
        sandbox.stub(contract, "constructorCode").get(() => constructorCode);
        sandbox.stub(contract, "using").get(() => using);
        sandbox.stub(contract, "parents").get(() => parents);
        sandbox.stub(contract, "variables").get(() => variables);
        sandbox.stub(contract, "name").get(() => name);
        sandbox.stub(contract, "imports").get(() => imports);
        sandbox.stub(contract, "functions").get(() => functions);
        sandbox.stub(contract, "modifiers").get(() => modifiers);
        sandbox.stub(contract, "events").get(() => events);

        const source = builder.getSource();
        console.log(source);
        assertToEqual(source, ESnapshotType.FULL_CONTRACT);
      });
    });
  });
});
