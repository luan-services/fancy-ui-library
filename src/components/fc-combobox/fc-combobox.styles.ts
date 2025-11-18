export const styles = `
	:host {
		display: block;
		position: relative;
		width: 100%;
		box-sizing: border-box;
    	font-family: var(--fc-font-family);
		max-width: var(--fc-combobox-max-width);
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
	}

	.fc-options {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 10;
		background: var(--fc-combobox-dropdown-bg, var(--fc-combobox-bg));
		border: var(--fc-combobox-border-width) solid var(--fc-combobox-border);
		border-radius: var(--fc-combobox-dropdown-radius, var(--fc-combobox-radius));
		padding: var(--fc-combobox-dropdown-padding, calc(var(--fc-combobox-padding) - 5px));
		box-shadow: var(--fc-combobox-dropdown-shadow);
		max-height: var(--fc-combobox-dropdown-max-height, 240px);
		overflow-y: auto;
		box-sizing: border-box;

		/* css for animation */
		overflow: hidden;
		height: 0;
		opacity: 0;
		transform: translateY(-4px) scale(0.97);
		transform-origin: top center;
		pointer-events: none;
	}

	.fc-options[data-state="open"] {
		animation: fc-dropdown-open 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		pointer-events: auto;
	}

	.fc-options[data-state="closing"] {
		animation: fc-dropdown-close 0.15s ease forwards;
	}

		@keyframes fc-dropdown-open {
		from {
			height: 0;
			opacity: 0;
			transform: translateY(-4px) scale(0.95);
		}
		to {
			height: var(--fc-height);
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes fc-dropdown-close {
		from {
			height: var(--fc-height);
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		to {
			height: 0;
			opacity: 0;
			transform: translateY(-4px) scale(0.95);
		}
	}
`;
