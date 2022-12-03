export type TValue =
  | string
  | number
  | { lit: string }
  | { note: string; value: TValue };

export interface IParent {
  contract: IParentContract;
  params: TValue[];
}

export interface IParentContract {
  name: string;
  path: string;
}

export interface IUsing {
  library: IParentContract;
  usingFor: string;
}

export interface IBaseFunction {
  name: string;
  args: IFunctionArgument[];
  returns?: string[];
  kind: IFunctionKind;
  mutability?: IFunctionMutability;
}

export interface IContractFunction extends IBaseFunction {
  override: Set<string>;
  modifiers: string[];
  code: string[];
  mutability: IFunctionMutability;
  final: boolean;
}

export interface IFunctionArgument {
  type: string;
  name: string;
}

export type IFunctionKind = "internal" | "public";
export type IFunctionMutability = typeof mutabilityRank[number];
export const mutabilityRank = [
  "pure",
  "view",
  "nonpayable",
  "payable",
] as const;

export interface IContract {
  name: string;
  parents: IParent[];
  imports: string[];
  using: IUsing[];
  functions: IContractFunction[];
  variables: string[];
  constructorCode: string[];
  constructorArgs: IFunctionArgument[];

  addParent: (contract: IParentContract, params: TValue[]) => void;
  addUsing: (library: IParentContract, usingFor: string) => void;
  addOverride: (
    parent: string,
    baseFn: IBaseFunction,
    mutability?: IFunctionMutability
  ) => void;
  addModifier: (modifier: string, baseFn: IBaseFunction) => void;
  addConstructorArgument: (arg: IFunctionArgument) => void;
  addConstructorCode: (code: string) => void;
  addFunctionCode: (
    code: string,
    baseFn: IBaseFunction,
    mutability?: IFunctionMutability
  ) => void;
  setFunctionBody: (
    code: string[],
    baseFn: IBaseFunction,
    mutability?: IFunctionMutability
  ) => void;
  addVariable: (code: string) => void;
}
