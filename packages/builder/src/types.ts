import { IBaseFunction, IParentContract } from "./Contract";

export interface IParentBlueprintWithParams extends IParentContract {
  params?: string;
}

export interface IBlueprintVariable {
  dataType: string;
  visibility: string;
  name: string;
  value?: string;
  mappingKeyType?: string;
  mappingValueType?: string;
}

export interface IBlueprintEnum {
  name: string;
  values: string;
}

export interface IBlueprintStructDefinition {
  name: string;
  type: string;
}

export interface IBlueprintStruct {
  name: string;
  definition: IBlueprintStructDefinition[];
}

export interface IBlueprintEventDefinition {
  name: string;
  type: string;
  indexed: boolean;
}

export interface IBlueprintEvent {
  name: string;
  definition: IBlueprintEventDefinition[];
}

export interface IBlueprintModifierFunctionArg {
  name: string;
  type: string;
}

export interface IBlueprintModifierFunction {
  name: string;
  args: IBlueprintModifierFunctionArg[];
  code: string;
}

export interface IBlueprintFunction extends IBaseFunction {
  code: string;
  modifiers: string[];
  overrides: string[];
}

export interface IBlueprintUsing extends IParentContract {
  usingFor: string;
}

export interface IBlueprint {
  name: string;
  parents?: IParentBlueprintWithParams[];
  constructorCode?: string;
  variables?: IBlueprintVariable[];
  enums?: IBlueprintEnum[];
  structs?: IBlueprintStruct[];
  events?: IBlueprintEvent[];
  modifiers?: IBlueprintModifierFunction[];
  functions?: IBlueprintFunction[];
  usings?: IBlueprintUsing[];
}
