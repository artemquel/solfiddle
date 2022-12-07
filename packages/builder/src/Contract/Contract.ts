import {
  IBaseFunction,
  IContractFunction,
  IFunctionArgument,
  IFunctionMutability,
  IParent,
  IParentContract,
  IUsing,
  TValue,
  IContract,
  mutabilityRank,
  IModifierFunction,
  IBaseModifierFunction,
  IEvent,
  IEnum,
  IStruct,
} from "./types";

export class Contract implements IContract {
  private readonly _name: string = "";
  private readonly _parentMap: Map<string, IParent> = new Map<
    string,
    IParent
  >();
  private readonly _using: IUsing[] = [];
  private readonly _functionMap: Map<string, IContractFunction> = new Map();
  private readonly _variableSet: Set<string> = new Set();
  private readonly _constructorCode: string[] = [];
  private readonly _constructorArgs: IFunctionArgument[] = [];
  private readonly _modifierMap: Map<string, IModifierFunction> = new Map();
  private readonly _eventMap: Map<string, IEvent> = new Map();
  private readonly _enumerationMap: Map<string, IEnum> = new Map();
  private readonly _structMap: Map<string, IStruct> = new Map();

  constructor(name: string) {
    this._name = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/^[^a-zA-Z$_]+/, "")
      .replace(/^(.)/, (c) => c.toUpperCase())
      .replace(/[^\w$]+(.?)/g, (_, c) => c.toUpperCase());
  }

  get name() {
    return this._name;
  }

  get parents() {
    return [...this._parentMap.values()].sort((a, b) => {
      if (a.contract.name === "Initializable") {
        return -1;
      } else if (b.contract.name === "Initializable") {
        return 1;
      } else {
        return 0;
      }
    });
  }

  get imports() {
    return [
      ...[...this._parentMap.values()].map((p) => p.contract.path),
      ...this._using.map((u) => u.library.path),
    ];
  }

  get using() {
    return this._using;
  }

  get functions() {
    return [...this._functionMap.values()];
  }

  get variables(): string[] {
    return [...this._variableSet];
  }

  get constructorCode() {
    return this._constructorCode;
  }

  get constructorArgs() {
    return this._constructorArgs;
  }

  get modifiers() {
    return [...this._modifierMap.values()];
  }

  get events() {
    return [...this._eventMap.values()];
  }

  get enumerations() {
    return [...this._enumerationMap.values()];
  }

  get structs() {
    return [...this._structMap.values()];
  }

  addParent(contract: IParentContract, params: TValue[] = []) {
    this._parentMap.set(contract.name, { contract, params });
  }

  addUsing(library: IParentContract, usingFor: string) {
    this._using.push({ library, usingFor });
  }

  addConstructorArgument(arg: IFunctionArgument) {
    this._constructorArgs.push(arg);
  }

  addConstructorCode(code: string) {
    this._constructorCode.push(code);
  }

  addModifier(modifier: string, baseFn: IBaseFunction) {
    const fn = this.addFunction(baseFn);
    fn.modifiers.push(modifier);
  }

  addOverride(
    parent: string,
    baseFn: IBaseFunction,
    mutability?: IFunctionMutability
  ) {
    const fn = this.addFunction(baseFn);
    fn.override.add(parent);
    if (mutability) {
      fn.mutability =
        mutabilityRank[
          Math.max(
            mutabilityRank.indexOf(fn.mutability),
            mutabilityRank.indexOf(mutability)
          )
        ];
    }
  }

  addFunctionCode(
    code: string,
    baseFn: IBaseFunction,
    mutability?: IFunctionMutability
  ) {
    const fn = this.addFunction(baseFn);
    if (fn.final) {
      throw new Error(`Function ${baseFn.name} is already finalized`);
    }
    fn.code.push(code);
    if (mutability) {
      fn.mutability =
        mutabilityRank[
          Math.max(
            mutabilityRank.indexOf(fn.mutability),
            mutabilityRank.indexOf(mutability)
          )
        ];
    }
  }

  setFunctionBody(
    code: string[],
    baseFn: IBaseFunction,
    mutability?: IFunctionMutability
  ) {
    const fn = this.addFunction(baseFn);
    if (fn.code.length > 0) {
      throw new Error(`Function ${baseFn.name} has additional code`);
    }
    fn.code.push(...code);
    fn.final = true;
    if (mutability) {
      fn.mutability = mutability;
    }
  }

  addVariable(code: string) {
    this._variableSet.add(code);
  }

  addModifierCode(code: string, baseModifier: IBaseModifierFunction) {
    const fn = this.addModifierFunction(baseModifier);
    fn.code.push(code);
  }

  setModifierCode(code: string[], baseModifier: IBaseModifierFunction) {
    const fn = this.addModifierFunction(baseModifier);
    if (fn.code.length > 0) {
      throw new Error(`Modifier ${baseModifier.name} has additional code`);
    }
    fn.code.push(...code);
  }

  addEvent(event: IEvent) {
    this._eventMap.set(event.name, event);
  }

  addEnumeration(enumeration: IEnum) {
    this._enumerationMap.set(enumeration.name, enumeration);
  }

  addStruct(struct: IStruct) {
    this._structMap.set(struct.name, struct);
  }

  private addModifierFunction(
    baseModifier: IBaseModifierFunction
  ): IModifierFunction {
    const signature = [
      baseModifier.name,
      "(",
      ...baseModifier.args.map((a) => a.name),
      ")",
    ].join("");

    if (this._functionMap.get(signature)) {
      throw new Error("A function with this signature is already defined");
    }

    const got = this._modifierMap.get(signature);
    if (got !== undefined) {
      return got;
    } else {
      const fn: IModifierFunction = {
        ...baseModifier,
        code: [],
      };
      this._modifierMap.set(signature, fn);
      return fn;
    }
  }

  private addFunction(baseFn: IBaseFunction): IContractFunction {
    const signature = [
      baseFn.name,
      "(",
      ...baseFn.args.map((a) => a.name),
      ")",
    ].join("");

    if (this._modifierMap.get(signature)) {
      throw new Error("A function with this signature is already defined");
    }

    const got = this._functionMap.get(signature);
    if (got !== undefined) {
      return got;
    } else {
      const fn: IContractFunction = {
        override: new Set<string>(),
        modifiers: [],
        code: [],
        mutability: "nonpayable",
        final: false,
        ...baseFn,
      };
      this._functionMap.set(signature, fn);
      return fn;
    }
  }
}
