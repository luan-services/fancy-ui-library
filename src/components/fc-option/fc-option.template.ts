import { styles } from "./fc-option.styles";

export const template = document.createElement('template');

template.innerHTML = `
	<style>${styles}</style>
	<button part="base" class="fc-option" role="option">
		<slot></slot>
	</button>
`;
