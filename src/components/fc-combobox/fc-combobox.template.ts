import { styles } from './fc-combobox.styles'; // import all the css styles from the stylesheeet

export const template = document.createElement('template'); // create a new component template that will be put in the shadow DOM

/* inside this template, class here can be only controlled by the DEV, more specifically, by the styles at the fc-autcomplete.styles.ts 
   file, if a user do .fc-label it wont work, they need to do .fc-label::part(label) 
*/

template.innerHTML = `
	<style>${styles}</style>

	<input 
		id="fc-input" 
		class="fc-input"
		type="text" 
		role="combobox"
		aria-autocomplete="list"
		aria-expanded="false"
		aria-owns="fc-options"
		part="input"
		autocomplete="off"
	/>

	<div 
		id="fc-options" 
		part="options" 
		class="fc-options" 
		hidden
	>
		<slot></slot>
	</div>
	
`;