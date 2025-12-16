import { styles } from "./fc-label.styles";

export const template = document.createElement('template');

template.innerHTML = `
    <style>${styles}</style>
    <div class="fc-label-text" part="text">
        <slot></slot>
    </div>
`;