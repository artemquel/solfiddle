import { IBuilder, TSortedFunctions } from "./types";
import {
  IContract,
  IContractFunction,
  IFunctionArgument,
  IModifierFunction,
  IParent,
  TValue,
} from "../Contract";

import { mapValues, Lines, formatLines, spaceBetween } from "./utils";

const SOLIDITY_VERSION = "0.8.9";

export class Builder implements IBuilder {
  constructor(private readonly _contract: IContract) {}

  getSource() {
    const fns = mapValues(this.sortedFunctions(), (fns) =>
      fns.map((fn) => this.printFunction(fn))
    );

    const hasOverrides = fns.override.some((l) => l.length > 0);

    return formatLines(
      ...spaceBetween(
        [`pragma solidity ^${SOLIDITY_VERSION};`],

        this._contract.imports.map((p) => `import "${p}";`),

        [
          [
            `contract ${this._contract.name}`,
            ...this.printInheritance(),
            "{",
          ].join(" "),

          spaceBetween(
            this.printUsingFor(),
            this._contract.variables,
            this.printConstructor(),
            ...this._contract.modifiers.map(this.printModifierFunction),
            ...fns.code,
            ...fns.modifiers,
            hasOverrides
              ? [
                  `// The following functions are overrides required by Solidity.`,
                ]
              : [],
            ...fns.override
          ),

          `}`,
        ]
      )
    );
  }

  private printUsingFor(): string[] {
    return this._contract.using.map(
      (u) => `using ${u.library.name} for ${u.usingFor};`
    );
  }

  private printInheritance(): [] | [string] {
    if (this._contract.parents.length > 0) {
      return [
        "is " + this._contract.parents.map((p) => p.contract.name).join(", "),
      ];
    } else {
      return [];
    }
  }

  private printParentConstructor({ contract, params }: IParent): [] | [string] {
    const fn = contract.name;
    if (params.length > 0) {
      return [fn + "(" + params.map(this.printValue).join(", ") + ")"];
    } else {
      return [];
    }
  }

  private printArgument(arg: IFunctionArgument): string {
    return arg.type + " " + arg.name;
  }

  private printFunction2(
    kindedName: string,
    args: string[],
    modifiers: string[],
    code: Lines[]
  ): Lines[] {
    const fn = [];

    const headingLength = [kindedName, ...args, ...modifiers]
      .map((s) => s.length)
      .reduce((a, b) => a + b);

    const braces = code.length > 0 ? "{" : "{}";

    if (headingLength <= 72) {
      fn.push(
        [`${kindedName}(${args.join(", ")})`, ...modifiers, braces].join(" ")
      );
    } else {
      fn.push(`${kindedName}(${args.join(", ")})`, modifiers, braces);
    }

    if (code.length > 0) {
      fn.push(code, "}");
    }

    return fn;
  }

  private printConstructor(): Lines[] {
    const hasParentParams = this._contract.parents.some(
      (p) => p.params.length > 0
    );
    const hasConstructorCode = this._contract.constructorCode.length > 0;
    const parentsWithInitializers = this._contract.parents.filter(
      (parent) => !["Initializable"].includes(parent.contract.name)
    );
    if (hasParentParams || hasConstructorCode) {
      const parents = parentsWithInitializers.flatMap((p) =>
        this.printParentConstructor(p)
      );
      const args = this._contract.constructorArgs.map(this.printArgument);

      return this.printFunction2(
        "constructor",
        args,
        parents,
        this._contract.constructorCode
      );
    } else {
      return [];
    }
  }

  private sortedFunctions(): TSortedFunctions {
    const fns: TSortedFunctions = { code: [], modifiers: [], override: [] };

    for (const fn of this._contract.functions) {
      if (fn.code.length > 0) {
        fns.code.push(fn);
      } else if (fn.modifiers.length > 0) {
        fns.modifiers.push(fn);
      } else {
        fns.override.push(fn);
      }
    }

    return fns;
  }

  private printValue(value: TValue): string {
    if (typeof value === "object") {
      if ("lit" in value) {
        return value.lit;
      } else if ("note" in value) {
        return `${this.printValue(value.value)} /* ${value.note} */`;
      } else {
        throw Error("Unknown value type");
      }
    } else if (typeof value === "number") {
      if (Number.isSafeInteger(value)) {
        return value.toFixed(0);
      } else {
        throw new Error(`Number not representable (${value})`);
      }
    } else {
      return JSON.stringify(value);
    }
  }

  private printModifierFunction(modifier: IModifierFunction): Lines[] {
    const fn = [];
    fn.push(
      `modifier ${modifier.name}(${modifier.args
        .map((arg) => `${arg.type} ${arg.name}`)
        .join(", ")}){`
    );

    fn.push(modifier.code);

    fn.push("}");

    return fn;
  }

  private printFunction(fn: IContractFunction): Lines[] {
    if (
      fn.override.size <= 1 &&
      fn.modifiers.length === 0 &&
      fn.code.length === 0 &&
      !fn.final
    ) {
      return [];
    }

    const modifiers: string[] = [fn.kind, ...fn.modifiers];

    if (fn.mutability !== "nonpayable") {
      modifiers.splice(1, 0, fn.mutability);
    }

    if (fn.override.size === 1) {
      modifiers.push(`override`);
    } else if (fn.override.size > 1) {
      modifiers.push(`override(${[...fn.override].join(", ")})`);
    }

    if (fn.returns?.length) {
      modifiers.push(`returns (${fn.returns.join(", ")})`);
    }

    const code = [...fn.code];

    if (fn.override.size > 0 && !fn.final) {
      const superCall = `super.${fn.name}(${fn.args
        .map((a) => a.name)
        .join(", ")});`;
      code.push(fn.returns?.length ? "return " + superCall : superCall);
    }

    if (modifiers.length + fn.code.length > 1) {
      return this.printFunction2(
        "function " + fn.name,
        fn.args.map(this.printArgument),
        modifiers,
        code
      );
    } else {
      return [];
    }
  }
}
