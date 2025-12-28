export const styles = `
    :host {
        display: block;
        position: relative;
        width: 100%;
        box-sizing: border-box;
        font-family: var(--fc-font-family);
        max-width: var(--fc-select-max-width);
        cursor: pointer; 
    }

    
    .fc-input {
        width: 100%;
        box-sizing: border-box;
        padding: var(--fc-select-padding);
        padding-right: 36px; /* space for dropdown icon */
        border-radius: var(--fc-select-radius);
        background: var(--fc-select-bg);
        color: var(--fc-select-fg);
        border: var(--fc-select-border-width) solid var(--fc-select-border);
        font-size: var(--fc-font-size-md);
        box-shadow: var(--fc-select-shadow);
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        
        cursor: pointer; 
        caret-color: transparent; 
        user-select: none;
    }

    
    :host([touched]:invalid) .fc-input {
        background-color: var(--fc-select-bg-error);
        border-color: var(--fc-select-border-error);
    }

    :host([touched]:invalid) .fc-input:focus {
        box-shadow: 0 0 0 2px var(--fc-select-focus-ring-error);
    }

    .fc-input::placeholder {
        color: var(--fc-select-placeholder);
    }

    .fc-input:hover {
        border-color: var(--fc-select-border-hover);
    }

    .fc-input:focus {
        border-color: var(--fc-select-border-focus);
        outline: none;
        box-shadow: var(--fc-select-focus-ring);
    }

    .fc-input-chevron-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: var(--fc-select-dropdown-icon-width);
        height: var(--fc-select-dropdown-icon-height);
        pointer-events: none;
        color: var(--fc-select-fg);
        transition: transform 0.2s ease;
        align-items: center;
		justify-content: center;
        color: inherit; 
    }
    
    :host([open]) .fc-input-chevron-icon {
        transform: translateY(-50%) rotate(180deg);
    }

	.fc-input-chevron-icon svg {
		width: var(--fc-select-dropdown-icon-width);
		height: var(--fc-select-dropdown-icon-height);
    }

	slot[name="chevron-icon"]::slotted(*) {
		width: var(--fc-select-dropdown-icon-width);
		height: var(--fc-select-dropdown-icon-height);
        object-fit: contain;
	}

    :host([disabled]) {
        cursor: not-allowed;
    }

    .fc-input:disabled {
        background: var(--fc-select-bg-disabled);
        cursor: not-allowed;
        box-shadow: none;
        color: var(--fc-select-placeholder-disabled);
    }

    :host([disabled]) .fc-input-icon {
        color: var(--fc-select-placeholder-disabled);
    }

    .fc-options {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        z-index: 1000;
        background: var(--fc-select-dropdown-bg, var(--fc-select-bg));
        border: var(--fc-select-border-width) solid var(--fc-select-border);
        border-radius: var(--fc-select-dropdown-radius, var(--fc-select-radius));
        padding: var(--fc-select-dropdown-padding, calc(var(--fc-select-padding) - 5px));
        box-shadow: var(--fc-select-dropdown-shadow);
        max-height: var(--fc-select-dropdown-max-height, 240px);
        overflow-y: auto;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .fc-options.opens-up {
        top: auto;
        bottom: calc(100% + 6px);
    }
    
    .fc-options[hidden] {
        display: none !important;
    }
`;