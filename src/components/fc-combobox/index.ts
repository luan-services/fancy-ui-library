import { FcComboBox } from "./fc-combobox";

export { FcComboBox };

export const defineComboBox = () => {
  if (!customElements.get("fc-combobox")) {
    customElements.define("fc-combobox", FcComboBox);
  }
  return FcComboBox;
};
