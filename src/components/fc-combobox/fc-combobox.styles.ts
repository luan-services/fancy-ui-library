// every element must have box-sizing border box as a pattern (element dimensions will be correctly set)
export const styles = `
	:host {
		display: block;
		position: relative;
		width: 100%;
		box-sizing: border-box;
    	font-family: var(--fc-font-family);
		max-width: var(--fc-combobox-max-width);
	}

	/* only show invalid style if the user has touched the field (blurred). the :invalid pseudo-class comes from 
	internals.setValidity() logic. */

	:host([touched]:invalid) .fc-input {
        background-color: var(--fc-combobox-bg-error);
        border-color: var(--fc-combobox-border-error);
    }

    :host([touched]:invalid) .fc-input:focus {
        box-shadow: 0 0 0 2px var(--fc-combobox-focus-ring-error);
    }

	.fc-input {
		width: 100%;
		box-sizing: border-box;

		padding: var(--fc-combobox-padding);
		border-radius: var(--fc-combobox-radius);
		background: var(--fc-combobox-bg);
		color: var(--fc-combobox-fg);

		border: var(--fc-combobox-border-width) solid var(--fc-combobox-border);
		font-size: var(--fc-font-size-md);

		box-shadow: var(--fc-combobox-shadow);
		transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	}

	.fc-input::placeholder {
		color: var(--fc-combobox-placeholder);
	}

	.fc-input:hover {
		border-color: var(--fc-combobox-border-hover);
	}

	.fc-input:focus {
		border-color: var(--fc-combobox-border-focus);
		outline: none;
		box-shadow: var(--fc-combobox-focus-ring);
	}

	.fc-options {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		z-index: 1000;
		background: var(--fc-combobox-dropdown-bg, var(--fc-combobox-bg));
		border: var(--fc-combobox-border-width) solid var(--fc-combobox-border);
		border-radius: var(--fc-combobox-dropdown-radius, var(--fc-combobox-radius));
		padding: var(--fc-combobox-dropdown-padding, calc(var(--fc-combobox-padding) - 5px));
		box-shadow: var(--fc-combobox-dropdown-shadow);
		max-height: var(--fc-combobox-dropdown-max-height, 240px);
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

	:host([disabled]) {
        cursor: not-allowed;
    }

	.fc-input:disabled {
		background: var(--fc-combobox-bg-disabled);
        cursor: not-allowed;
		box-shadow: none;
    }

	.fc-input:disabled::placeholder {
		color: var(--fc-combobox-placeholder-disabled);
    }

	.fc-input:disabled:hover {
		border-color: var(--fc-combobox-border);
	}

	.fc-input:disabled:focus {
		border-color: var(--fc-combobox-border);
	}
`;