// fc-option.styles.ts
export const styles = `
	:host {
		display: block;
		width: 100%;
		box-sizing: border-box;
	}

	button.fc-option {
		width: 100%;
		text-align: left;
		padding: 0.5rem 0.75rem;
		background: var(--fc-option-bg, #fff);
		border: none;
		border-radius: var(--fc-border-radius, 4px);
		color: var(--fc-text-color, #333);
		cursor: pointer;
		font: inherit;
	}

	button.fc-option:hover,
	button.fc-option[aria-selected="true"] {
		background: var(--fc-option-hover-bg, #f0f0f0);
	}
`;
