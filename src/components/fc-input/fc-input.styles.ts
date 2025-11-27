// every element must have box-sizing border box as a pattern (element dimensions will be correctly set)
export const styles = `
	:host {
		display: block;
		width: 100%;
		box-sizing: border-box;
    	font-family: var(--fc-font-family);
		margin-bottom: var(--fc-input-margin-bottom, 10px);
	}

	:host([disabled]) {
		cursor: not-allowed;
		opacity: 0.7;
	}

	:host([hidden]) {
		display: none !important;
	}

	/* input element styling */
	.fc-input-field {
		width: 100%;
		box-sizing: border-box;
		padding: var(--fc-input-padding, 10px);
		border-radius: var(--fc-input-radius, 4px);
		background: var(--fc-input-bg, #ffffff);
		color: var(--fc-input-fg, #000000);
		border: var(--fc-input-border-width, 1px) solid var(--fc-input-border, #ccc);
		font-size: var(--fc-font-size-md, 1rem);
		box-shadow: var(--fc-input-shadow, none);
		transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
		font-family: inherit;
	}

	.fc-input-field::placeholder {
		color: var(--fc-input-placeholder-color, #999);
	}

	.fc-input-field:hover {
		border-color: var(--fc-input-border-hover, #666);
	}

	.fc-input-field:focus {
		border-color: var(--fc-input-border-focus, #333);
		outline: none;
		box-shadow: var(--fc-input-focus-ring, 0 0 0 2px rgba(0,0,0,0.1));
	}

	
	/* only show invalid style if the user has touched the field (blurred).
	   the :invalid pseudo-class comes from internals.setValidity() logic.
	*/
	:host([touched]:invalid) .fc-input-field {
		border-color: var(--fc-input-error-color, #dc2626);
		background-color: var(--fc-input-error-bg, #fff5f5);
	}

	:host([touched]:invalid) .fc-input-field:focus {
		box-shadow: 0 0 0 2px var(--fc-input-error-color-transparent, rgba(220, 38, 38, 0.2));
	}


	/* disabled state */
	.fc-input-field:disabled {
		background: var(--fc-input-disabled-bg, #f5f5f5);
		color: var(--fc-input-disabled-fg, #666);
		cursor: not-allowed;
		border-color: var(--fc-input-disabled-border, #ccc);
		box-shadow: none;
	}

	/* type specific adjustments */
	.fc-input-field[type="file"] {
		padding: calc(var(--fc-input-padding, 10px) * 0.7);
		cursor: pointer;
	}
	
	.fc-input-field[type="color"] {
		padding: 2px;
		height: 40px;
		cursor: pointer;
	}
`;