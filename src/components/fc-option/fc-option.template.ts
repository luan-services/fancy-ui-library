import { styles } from "./fc-option.styles";

export const template = document.createElement('template');

template.innerHTML = `
    <style>${styles}</style>
    
    <button part="container" class="fc-option" role="option">
        
        <span class="fc-option-text" part="text">
            <slot></slot>
        </span>

        <span class="fc-option-icon" part="icon" aria-hidden="true">
            <slot name="checked-icon">
				<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6.5 9 17.5 4 12.5"></polyline>
                </svg>
            </slot>
        </span>

    </button>
`;