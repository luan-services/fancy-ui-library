import { FcCombobox } from "./fc-combobox";

export { FcCombobox };

export const defineCombobox = () => {
	if (!customElements.get("fc-combobox")) {
		customElements.define("fc-combobox", FcCombobox);
	}
	return FcCombobox;
};
