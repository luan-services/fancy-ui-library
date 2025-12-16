export const styles = `
    :host {
        display: block;
        width: 100%;
        box-sizing: border-box;
        font-family: var(--fc-font-family, inherit);
        font-size: var(--fc-label-font-size);
        font-weight: var(--fc-label-font-weight);
        color: var(--fc-label-fg);
        cursor: pointer;
        line-height: 1.5;
    }

    :host([hidden]) {
        display: none !important;
    }

    .fc-label-text {
        display: flex;
        align-items: center;
    }
`;