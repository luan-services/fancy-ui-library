import { styles } from "./fc-input.styles";

export const template = document.createElement('template');

template.innerHTML = `
	<style>${styles}</style>

	<input 
		id="fc-field" 
		class="fc-input-field" 
		part="input"
		type="text"
	/>
`;