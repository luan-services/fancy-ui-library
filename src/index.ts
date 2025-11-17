/*  this index.ts will be the main source for the components, it must import each define method from each individual
component folder (index.ts), and re-exports it

it also creates a defineAll(); function, which lets the user define all components at once */
import "./styles";
import { defineAutoComplete } from "./components/fc-autocomplete/index";
import { defineOption } from "./components/fc-option";

export { defineAutoComplete, defineOption }

export const defineAll = () => {
    defineAutoComplete();
    defineOption();
}