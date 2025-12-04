export const styles = `
    :host {
        display: block;
        width: 100%;
		box-sizing: border-box;
        contain: content;
        max-width: var(--fc-error-max-width);
    }

    :host([hidden]) {
        display: none !important;
    }

    .fc-error-text {
        color: var(--fc-error-fg);
        font-family: var(--fc-font-family, inherit);
        font-size: var(--fc-error-font-size);
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;