/*  this index.ts will be the main source for the components, it must import each define method from each individual
component folder (index.ts), and re-exports it

it also creates a defineAll(); function, which lets the user define all components at once */
import "./styles";
import { FcCombobox, defineCombobox } from "./components/fc-combobox/index";
import { FcOption, defineOption } from "./components/fc-option/index";

export { 
    FcCombobox, // these are the types that are being exported so the users can use it on TypeScript
    defineCombobox, 
    FcOption,
    defineOption
}

export const defineAll = () => {
    defineCombobox();
    defineOption();
}