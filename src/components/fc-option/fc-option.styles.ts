// every element must have box-sizing border box as a pattern (element dimensions will be correctly set)
export const styles = `
	:host {
		display: block;
		width: 100%;
		box-sizing: border-box;
    	font-family: var(--fc-font-family);
	}

	:host([hidden]) {
        display: none !important;
    }

	:host([disabled]) {
        cursor: not-allowed;
    }
		
		
	button.fc-option {
		width: 100%;
		box-sizing: border-box;
		text-align: left;
		background: var(--fc-option-bg);
		color: var(--fc-option-fg);
		padding: var(--fc-option-padding);
		border-radius: var(--fc-option-radius);
		border: none;
		font: inherit;
		cursor: pointer;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	button.fc-option:hover {
		background: var(--fc-option-bg-hover);
		transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
	}

	button.fc-option[data-active="true"] { 
        background: var(--fc-option-bg-active);
    }

	button.fc-option:disabled {
		color: var(--fc-option-fg-disabled);
		background: var(--fc-option-bg-disabled);
		pointer-events: none; // this prevents disabled attribute on button to move focus out of the fc-combobox
		box-shadow: none;
	}

    button.fc-option:disabled:hover {
		background: var(--fc-option-bg-disabled);
	}

	button.fc-option[aria-selected="true"] {
		background: var(--fc-option-bg-selected);
		color: var(--fc-option-fg-selected);
	}

`;
