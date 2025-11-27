// every element must have box-sizing border box as a pattern (element dimensions will be correctly set)
export const styles = `
	:host {
		display: block;
		width: 100%;
		box-sizing: border-box;
    	font-family: var(--fc-font-family);
		max-width: var(--fc-input-max-width);
	}

	:host([disabled]) {
		cursor: not-allowed;
	}

	:host([hidden]) {
		display: none !important;
	}

	.fc-input-field {
		width: 100%;
		box-sizing: border-box;

		padding: var(--fc-input-padding);
		border-radius: var(--fc-input-radius);
		background: var(--fc-input-bg);
		color: var(--fc-input-fg);

		border: var(--fc-input-border-width) solid var(--fc-input-border);

		font-size: var(--fc-font-size-md);

		box-shadow: var(--fc-input-shadow);
		transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
		font-family: inherit;
	}

	.fc-input-field::placeholder {
		color: var(--fc-input-placeholder);
	}

	.fc-input-field:hover {
		border-color: var(--fc-input-border-hover);
	}

	.fc-input-field:focus {
		border-color: var(--fc-input-border-focus);
		outline: none;
		box-shadow: var(--fc-input-focus-ring);
	}
	
	/* only show invalid style if the user has touched the field (blurred). the :invalid pseudo-class comes from 
	internals.setValidity() logic. */

	:host([touched]:invalid) .fc-input-field {
		background-color: var(--fc-input-error-bg);
		border-color: var(--fc-input-error-color);
	}

	:host([touched]:invalid) .fc-input-field:focus {
		box-shadow: 0 0 0 2px var(--fc-input-error-focus-ring, rgba(220, 38, 38, 0.2));
	}

	.fc-input-field:disabled {
		background: var(--fc-input-disabled-bg);
		cursor: not-allowed;
		box-shadow: none;
	}

	.fc-input-field:disabled::placeholder {
		color: var(--fc-input-disabled-placeholder);
    }

	/* type especif css */

	.fc-input-field[type="file"] {
		padding: calc(var(--fc-input-padding) * 0.7);
		cursor: pointer;
	}
`;