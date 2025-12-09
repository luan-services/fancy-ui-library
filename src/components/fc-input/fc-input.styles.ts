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

	/* only show invalid style if the user has touched the field (blurred). the :invalid pseudo-class comes from 
	internals.setValidity() logic. */

	:host([touched]:invalid) .fc-input-field {
		background: var(--fc-input-bg-error);
		border-color: var(--fc-input-border-error);
	}

	:host([touched]:invalid) .fc-input-field:focus {
		box-shadow: 0 0 0 2px var(--fc-input-focus-ring-error);
	}

	.fc-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
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

		-webkit-appearance: none;
		appearance: none;
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

	.fc-input-field:disabled {
		background: var(--fc-input-bg-disabled);
		cursor: not-allowed;
		box-shadow: none;
	}

	.fc-input-field:disabled::placeholder {
		color: var(--fc-input-placeholder-disabled);
    }

	.fc-input-field:disabled:hover {
		border-color: var(--fc-input-border);
	}

	.fc-input-field:disabled:focus {
		border-color: var(--fc-input-border);
	}
		
	/* FILE type specific CSS */

	.fc-input-field[type="file"] {
		padding: calc(var(--fc-input-padding));
		cursor: pointer;
		display: flex; 
    	align-items: center;
		border-color: var(--fc-input-file-border);
		transition: border-color 0.15s ease-in-out, color 0.15s ease-in-out;
	}

	.fc-input-field[type="file"]:focus {
		border-color: var(--fc-input-border-focus);
		outline: none;
		box-shadow: var(--fc-input-focus-ring);
	}

	/* target the button inside type="file" */

	.fc-input-field::file-selector-button {
		padding: 4px 10px;
		border-radius: var(--fc-input-radius);
		background: var(--fc-input-btn-bg);
		color: var(--fc-input-file-btn-fg);
		border: 1px solid var(--fc-input-file-border);
		cursor: pointer;
		font-family: inherit;
		transition: background-color 0.15s ease;
	}

	/* legacy browsers */
	.fc-input-field::-webkit-file-upload-button {
		margin-right: 12px;
		padding: 4px 10px;
		border-radius: var(--fc-input-radius);
		background: var(--fc-input-file-btn-bg);
		color: var(--fc-input-file-btn-fg);
		border: 1px solid var(--fc-input-file-border);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.9em;
	}

	/* Hover effects for the button */

	.fc-input-field::file-selector-button:hover {
		background: var(--fc-input-file-btn-bg-hover); 
	}


	.fc-input-field::-webkit-file-upload-button:hover {
		background: var(--fc-input-file-btn-bg-hover);
	}

	/* PASSWORD type specific CSS */

	/* when password toggle is visible, add padding to input so text doesn't overlap icon */
	:host([type="password"]) .fc-input-field {
		padding-right: 40px; 
	}

	.fc-password-toggle {
		position: absolute;
		right: 8px; /* position inside the input */
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fc-input-password-icon-color);
		transition: color 0.15s ease-in-out;
		z-index: 2; /* above input */
	}
	
	.fc-password-toggle[hidden] {
        display: none !important;
    }

	.fc-password-toggle:hover {
		color: var(--fc-input-password-icon-color-hover);
	}
	
	.fc-password-toggle svg {
		width: 20px;
		height: 20px;
	}

	.fc-password-toggle svg[hidden] {
        display: none !important;
    }

`;