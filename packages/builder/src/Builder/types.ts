import { IContractFunction } from "../Contract";

export type TSortedFunctions = Record<
  "code" | "modifiers" | "override",
  IContractFunction[]
>;

export interface IBuilder {
  getSource: () => string;
}
