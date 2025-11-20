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
		transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	button.fc-option:hover {
		background: var(--fc-option-bg-hover);
	}

	button.fc-option:disabled {
		color: var(--fc-option-disabled-fg);
		background: var(--fc-option-disabled-bg);
        cursor: not-allowed;
		box-shadow: none;
	}

    button.fc-option:disabled:hover {
		background: var(--fc-option-disabled-bg);
	};

	button.fc-option[aria-selected="true"] {
		background: var(--fc-option-bg-selected);
		color: var(--fc-option-fg-selected);
	}

`;
