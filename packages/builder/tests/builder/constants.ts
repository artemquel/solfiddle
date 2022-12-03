import {
  IContract,
  IContractFunction,
  IFunctionArgument,
  IModifierFunction,
  IParent,
  IUsing,
} from "../../src/Contract";

export const parents: IParent[] = [
  {
    contract: { name: "ParentContract1", path: "path/to/parent/contract1.sol" },
    params: [],
  },
  {
    contract: { name: "ParentContract2", path: "path/to/parent/contract2.sol" },
    params: [],
  },
];

export const parentsWithParams: IParent[] = [
  {
    contract: { name: "ParentContract1", path: "path/to/parent/contract1.sol" },
    params: [15, 30],
  },
  {
    contract: { name: "ParentContract2", path: "path/to/parent/contract2.sol" },
    params: ["stringArg"],
  },
];

export const using: IUsing[] = [
  {
    library: {
      name: "LibraryContract1",
      path: "path/to/library/contract1.sol",
    },
    usingFor: "LibraryContract1.Type",
  },
  {
    library: {
      name: "LibraryContract2",
      path: "path/to/library/contract2.sol",
    },
    usingFor: "LibraryContract12.Type",
  },
];

export const constructorArgs: IFunctionArgument[] = [
  { type: "uint256", name: "numberValue" },
  { type: "bool", name: "isBool" },
];

export const simpleFunction: IContractFunction = {
  name: "simpleFunction",
  args: [],
  returns: [""],
  kind: "public",

  override: new Set([]),
  modifiers: [],
  code: ["uint256 a = 256;"],
  mutability: "pure",
  final: false,
};

export const overrideFunction: IContractFunction = {
  ...simpleFunction,
  override: new Set(["Test1"]),
};

export const functionWithArgs: IContractFunction = {
  ...simpleFunction,
  args: [
    { type: "uint256", name: "numberValue" },
    { type: "bool", name: "isBool" },
  ],
};

export const functionWithModifier: IContractFunction = {
  ...simpleFunction,
  modifiers: ["onlyOwner"],
};

export const modifier: IModifierFunction = {
  name: "isBigger",
  args: [
    { type: "uint256", name: "a" },
    { type: "uint256", name: "b" },
  ],
  code: ['require(a > b, "b less than a");', "_;"],
};

export const fullContract: Omit<
  IContract,
  | "addParent"
  | "addUsing"
  | "addOverride"
  | "addModifier"
  | "addConstructorArgument"
  | "addConstructorCode"
  | "addFunctionCode"
  | "setFunctionBody"
  | "addVariable"
  | "addModifierCode"
  | "setModifierCode"
> = {
  constructorArgs: [
    { type: "uint256", name: "uintValue" },
    { type: "bool", name: "blocked" },
  ],
  variables: ["uint256 totalAmount;", "bool blocked;", "address owner;"],
  constructorCode: [
    "this.totalAmount = uintValue * 100;",
    "this.blocked = blocked;",
    "this.owner = msg.sender;",
  ],
  functions: [
    {
      name: "isBlocked",
      args: [],
      returns: ["bool"],
      kind: "public",
      override: new Set([]),
      modifiers: [],
      code: ["return this.blocked;"],
      mutability: "view",
      final: false,
    },
    {
      name: "updateOwner",
      args: [{ type: "address", name: "newOwner" }],
      returns: ["address"],
      kind: "public",
      override: new Set([]),
      modifiers: ["onlyOwner"],
      code: ["this.owner = newOwner;", "return this.owner;"],
      mutability: "nonpayable",
      final: false,
    },
  ],
  imports: ["contracts/Contract.sol", "libs/Lib.sol"],
  name: "TestContract",
  parents: [
    {
      contract: {
        name: "Contract",
        path: "contracts/Contract.sol",
      },
      params: [],
    },
  ],
  using: [
    {
      library: {
        name: "Library",
        path: "libs/Lib.sol",
      },
      usingFor: "Library.Data",
    },
  ],
  modifiers: [
    {
      name: "onlyOwner",
      args: [],
      code: ["_;"],
    },
  ],
};
