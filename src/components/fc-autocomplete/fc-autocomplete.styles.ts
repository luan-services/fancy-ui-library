export const styles = `
	:host {
		display: block;
		position: relative;
		width: 100%;
		box-sizing: border-box;
    	font-family: var(--fc-font-family);
	}

	.fc-input {
		width: 100%;
		box-sizing: border-box;

		padding: var(--fc-autocomplete-padding);
		border-radius: var(--fc-autocomplete-radius);
		background: var(--fc-autocomplete-bg);
		color: var(--fc-autocomplete-fg);

		border: var(--fc-autocomplete-border-width) solid var(--fc-autocomplete-border);
		font-size: var(--fc-font-size-md);

		box-shadow: var(--fc-autocomplete-shadow);
		transition: border-color .15s ease, box-shadow .15s ease;
	}

	.fc-input::placeholder {
		color: var(--fc-autocomplete-placeholder);
	}

	.fc-input:hover {
		border-color: var(--fc-autocomplete-border-hover);
	}

	.fc-input:focus {
		border-color: var(--fc-autocomplete-border-focus);
		outline: none;
	}

	.fc-options {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 10;
		background: var(--fc-autocomplete-dropdown-bg, --fc-autocomplete-bg);
		border: var(--fc-autocomplete-border-width) solid var(--fc-autocomplete-border);
		border-radius: var(--fc-autocomplete-dropdown-radius);
		padding: var(--fc-autocomplete-dropdown-padding, --fc-autocomplete-padding);
		box-shadow: var(--fc-autocomplete-dropdown-shadow);
		max-height: var(--fc-autocomplete-dropdown-max-height, 240px);
		overflow-y: auto;
		box-sizing: border-box;
	}
`;
