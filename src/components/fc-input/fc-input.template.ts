import { styles } from "./fc-input.styles";

export const template = document.createElement('template');

template.innerHTML = `
	<style>${styles}</style>

	<div class="fc-input-wrapper">

		<!-- prefix slot here -->
		
		<input 
			id="fc-field" 
			class="fc-input-field" 
			part="input"
			type="text"
		/>

		<!-- password toggle button -->
		<button 
			id="btn-show-pass" 
			class="fc-password-toggle" 
			part="password-toggle" 
			type="button" 
			hidden 
			tabindex="-1"
			aria-label="Toggle password visibility"
			aria-pressed="false"
		>
			<svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
				<circle cx="12" cy="12" r="3"></circle>
			</svg>
			
			<svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
				<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
				<line x1="1" y1="1" x2="23" y2="23"></line>
			</svg>
		</button>

		<!-- suffix slot here -->
	</div>
`;