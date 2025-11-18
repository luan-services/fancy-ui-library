export const styles = `
	:host {
		display: block;
    	font-family: var(--fc-font-family);
	}

	button.fc-option {
		width: 100%;
		text-align: left;
		background: var(--fc-option-bg);
		color: var(--fc-option-fg);
		padding: var(--fc-option-padding);
		border-radius: var(--fc-option-radius);
		border: none;
		font: inherit;
		cursor: pointer;
		transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
	}

	button.fc-option:hover {
		background: var(--fc-option-bg-hover);
	}

	button.fc-option[aria-selected="true"] {
		background: var(--fc-option-bg-selected);
		color: var(--fc-option-fg-selected);
	}
`;
