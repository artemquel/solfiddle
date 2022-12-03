import {
  IBlueprint,
  IBlueprintEnum,
  IBlueprintEvent,
  IBlueprintModifierFunction,
  IBlueprintStruct,
  IBlueprintVariable,
} from "./types";

import { Contract, IContract } from "./Contract";

const SPACE_COUNT = 4;

export const getBuilder = (blueprint: IBlueprint): IContract => {
  const builder = new Contract(blueprint.name);

  // Apply parents
  blueprint.parents
    .filter(({ name, path }) => name && path)
    .forEach((parent) => {
      parent.params?.trim().length
        ? builder.addParent(
            parent,
            parent.params?.split(",").map((param) => param.trim()) || null
          )
        : builder.addParent(parent);
    });

  // Apply enums
  blueprint.enums
    .filter(({ name, values }) => name && values)
    .forEach((item) => {
      builder.addVariable(enumToString(item));
    });

  // Apply structs
  blueprint.structs
    .filter(
      ({ name, definition: [firstDefinition] }) =>
        name &&
        firstDefinition &&
        firstDefinition.name.trim().length &&
        firstDefinition.type.trim().length
    )
    .forEach((item) => {
      builder.addVariable(structToString(item));
    });

  // Apply variables
  blueprint.variables
    .filter(({ dataType, name }) => dataType && name)
    .forEach((item) => {
      builder.addVariable(variableToString(item));
    });

  // Apply events
  blueprint.events
    .filter(
      ({ name, definition: [firstDefinition] }) =>
        name &&
        firstDefinition &&
        firstDefinition.name.trim().length &&
        firstDefinition.type.trim().length
    )
    .forEach((item) => {
      builder.addVariable(eventToString(item));
    });

  // Apply constructor code
  if (blueprint.constructorCode) {
    blueprint.constructorCode
      .split("\n")
      .forEach((line) => builder.addConstructorCode(line));
  }

  // Apply modifiers
  blueprint.modifiers
    .filter(({ name, code }) => name && code)
    .forEach((item) => builder.addVariable(modifierToString(item)));

  //Apply functions
  blueprint.functions
    .filter(({ name }) => name)
    .forEach(({ code, modifiers, overrides, ...baseFunction }) => {
      code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !!line)
        .forEach((line) => builder.addFunctionCode(line, baseFunction));
      modifiers?.forEach((modifier) =>
        builder.addModifier(modifier, baseFunction)
      );
      overrides?.forEach((parent) => builder.addOverride(parent, baseFunction));
    });

  //Apply usings
  blueprint.usings
    .filter(({ name, path, usingFor }) => name && path && usingFor)
    .forEach(({ name, path, usingFor }) =>
      builder.addUsing({ name, path }, usingFor)
    );

  return builder;
};

const spacing = (count: number) => " ".repeat(count * SPACE_COUNT);

export const modifierToString = (modifier: IBlueprintModifierFunction) =>
  `modifier ${modifier.name}(${modifier.args
    .map((arg) => `${arg.type} ${arg.name}`)
    .join(", ")}) {\n${spacing(2)}${modifier.code
    .split("\n")
    .join(`\n${spacing(2)}`)}\n${spacing(2)}_;\n${spacing(1)}}`;

export const variableToString = (variable: IBlueprintVariable): string => {
  if (variable.dataType === "mapping") {
    return `${variable.dataType} (${variable.mappingKeyType}=>${variable.mappingValueType}) ${variable.visibility} ${variable.name};`;
  } else {
    return `${variable.dataType} ${variable.visibility} ${variable.name}${
      variable.value ? ` = ${variable.value};` : ";"
    }`;
  }
};

export const enumToString = (enumItem: IBlueprintEnum) =>
  `enum ${enumItem.name}{ ${enumItem.values} }\n`;

export const eventToString = (eventItem: IBlueprintEvent) =>
  `event ${eventItem.name}(${eventItem.definition
    .filter(({ name, type }) => name && type)
    .map(
      ({ name, type, indexed }) => `${type} ${indexed ? "indexed " : ""}${name}`
    )
    .join(", ")});`;

export const structToString = (structItem: IBlueprintStruct) =>
  `struct ${structItem.name}{\n        ${structItem.definition
    .filter(({ name, type }) => name && type)
    .map(({ name, type }) => `${type} ${name};`)
    .join("\n        ")}
    }\n`;
