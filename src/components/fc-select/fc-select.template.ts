import { styles } from './fc-select.styles'; // import all the css styles from the stylesheeet

export const template = document.createElement('template'); // create a new component template that will be put in the shadow DOM

template.innerHTML = `
    <style>${styles}</style>

    <input 
        class="fc-input"
        type="text" 
        role="combobox"
        aria-autocomplete="none" 
        aria-expanded="false"
        aria-haspopup="listbox"
        aria-controls="fc-options"
        part="input"
        autocomplete="off"
        readonly
    />

    <svg class="fc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>

    <div 
        part="options" 
        class="fc-options" 
        role="listbox"
        hidden
    >
        <slot></slot>
    </div>
`;