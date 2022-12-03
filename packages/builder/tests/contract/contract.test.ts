import { assert } from "chai";
import {
  Contract,
  IBaseFunction,
  IContract,
  IFunctionArgument,
  IParent,
  IUsing,
} from "../../src/Contract";

describe("Contract", () => {
  let contract: IContract;

  beforeEach(() => {
    contract = new Contract(" 4trash[Name]");
  });

  it("Should set correct contract name", () => {
    assert.equal(contract.name, "TrashName");
  });
  describe("parents, imports, using", () => {
    const parent: IParent = {
      contract: { name: "SomeParent", path: "path/to/parent/contract.sol" },
      params: ["param1", "param2"],
    };

    const using: IUsing = {
      library: { name: "PerfectLib", path: "path/to/perfect/lib.sol" },
      usingFor: "PerfectLib.PerfectHelper",
    };

    describe("addParent", () => {
      it("Should return array with added parent", () => {
        contract.addParent(parent.contract, parent.params);

        assert.deepEqual(contract.parents, [parent]);
      });

      it("Should add contracts with same name only once", () => {
        contract.addParent(parent.contract, parent.params);

        assert.deepEqual(contract.parents, [parent]);
      });
    });

    describe("addUsing", () => {
      it("Should return array with added using", () => {
        contract.addUsing(using.library, using.usingFor);

        assert.deepEqual(contract.using, [using]);
      });
    });

    describe("imports getter", () => {
      it("Should return array with paths of added parents and using", () => {
        contract.addParent(parent.contract, parent.params);
        contract.addUsing(using.library, using.usingFor);

        assert.deepEqual(contract.imports, [
          parent.contract.path,
          using.library.path,
        ]);
      });
    });
  });

  describe("addConstructorArgument", () => {
    const constructorArgs: IFunctionArgument[] = [
      { type: "uint256", name: "count" },
      { type: "bool", name: "isActive" },
    ];

    it("should return added constructor arguments", () => {
      contract.addConstructorArgument(constructorArgs[0]);
      contract.addConstructorArgument(constructorArgs[1]);

      assert.deepEqual(contract.constructorArgs, constructorArgs);
    });
  });

  describe("addVariable", () => {
    const variable = "uint256 number;";

    it("should return correct set of variables", () => {
      contract.addVariable(variable);

      assert.deepEqual(contract.variables, [variable]);
    });
  });

  describe("functions", () => {
    const baseFunction: IBaseFunction = {
      name: "mul",
      args: [
        { type: "uint256", name: "a" },
        { type: "uint256", name: "b" },
      ],
      returns: ["uint256"],
      kind: "public",
      mutability: "nonpayable",
    };

    describe("addFunctionCode", () => {
      it("should return array with added function with body", () => {
        contract.addFunctionCode("uint256 c = a * b;", baseFunction, "payable");
        contract.addFunctionCode("return c;", baseFunction);

        assert.deepEqual(contract.functions, [
          {
            ...baseFunction,
            override: new Set<string>(),
            modifiers: [],
            code: ["uint256 c = a * b;", "return c;"],
            final: false,
            mutability: "payable",
          },
        ]);
      });
    });

    describe("addModifier", () => {
      it("should return array with added function with modifier", () => {
        contract.addModifier("onlyOwner", baseFunction);

        assert.deepEqual(contract.functions, [
          {
            ...baseFunction,
            override: new Set<string>(),
            modifiers: ["onlyOwner"],
            code: [],
            final: false,
            mutability: baseFunction.mutability,
          },
        ]);
      });
    });

    describe("addOverride", () => {
      it("should return array with added function with override", () => {
        contract.addOverride("SomeParent", baseFunction);

        assert.deepEqual(contract.functions, [
          {
            ...baseFunction,
            override: new Set<string>(["SomeParent"]),
            modifiers: [],
            code: [],
            final: false,
            mutability: baseFunction.mutability,
          },
        ]);
      });
    });

    describe("setFunctionBody", () => {
      it("should return array with added function with body and set final to true", () => {
        contract.setFunctionBody(
          ["uint256 c = a * b;", "return c;"],
          baseFunction
        );
        assert.deepEqual(contract.functions, [
          {
            ...baseFunction,
            override: new Set<string>(),
            modifiers: [],
            code: ["uint256 c = a * b;", "return c;"],
            final: true,
            mutability: "nonpayable",
          },
        ]);
      });
    });
  });
});
