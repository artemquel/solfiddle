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

export interface IBaseModifierFunction {
  name: string;
  args: IFunctionArgument[];
}

export interface IModifierFunction extends IBaseModifierFunction {
  code: string[];
}

export interface IEventProperty extends IFunctionArgument {
  indexed?: boolean;
}

export interface IEvent {
  name: string;
  properties: IEventProperty[];
}

export interface IEnum {
  name: string;
  options: string[];
}

export interface IStruct {
  name: string;
  fields: IFunctionArgument[];
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
  modifiers: IModifierFunction[];
  events: IEvent[];
  enumerations: IEnum[];
  structs: IStruct[];

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
  addModifierCode: (code: string, baseModifier: IBaseModifierFunction) => void;
  setModifierCode: (
    code: string[],
    baseModifier: IBaseModifierFunction
  ) => void;
  addEvent: (event: IEvent) => void;
  addEnumeration: (enumeration: IEnum) => void;
  addStruct: (struct: IStruct) => void;
}
