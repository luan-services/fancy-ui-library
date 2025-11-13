import { template } from './fc-option.template'; // importing the base html and css for the componnet

export class FcOption extends HTMLElement {
	
	/* this is a static method that tells the browser which atributes should be 'watched', that means
	whenever 'value' or 'selected' changes, 'attributeChangedCallback' will be called. */
	static get observedAttributes() { 
		return ['value', 'selected'];
	}

	/* this is the class constructor, whenever you create a new element on js or at the dom, this will be called */
	constructor() { 
		super(); // calls HTMLElement class constructor too, after that, runs the following code V
		const shadow = this.attachShadow({ mode: 'open' }); // creates a shadow DOM
		shadow.appendChild(
			template.content.cloneNode(true) // clone our html and css template and append it to the shadow DOM
		); 
	}

	/* defines getter and setter methods for newly created properties, which are 'value' and 'selected'.
		when they are defined, they work in thwo ways inside a HTMLElement Class, you can either do:
			const component = _select the component here_ 
			component.value = 'something'
		or
			<fc-option value="somethin"></fc-option>

		this is just an example, the attributes here mostly won't be used by the final user, the main ideia is to let
		the parent decides when an option will be selected or not.
	*/


	public get value() { // return the value of 'value' or '' if doesn't exist
		return this.getAttribute('value') ?? '';
	}

	public set value(data: string) { 
		this.setAttribute('value', data);
	}

	public get selected() { // return true if the component has 'selected' attribute
		return this.hasAttribute('selected');
	}

	public set selected (isSelected: boolean) {

		if (isSelected) { // if the component is already selected, removes the selection
			this.setAttribute('selected', '');
			this.updateSelection(); // updates aria-selected label
			return;
		}

		this.removeAttribute('selected'); // if not selected, now it is
		this.updateSelection(); // also updates aria-selected label
	}

	/* this is the function that runs whenever an observed attribute is changed, note: this is called 
	by the browser itself, so you need to accept all these three props even if you will not be using it
	_ on it are for TypeScript to prevent the 'never used warning' */

	attributeChangedCallback(name: string, _oldVal: string, _newVal: string) {
		if (name === 'selected') { // guarantees the aria-selected to be correctly updated
			this.updateSelection(); 
		}
	}

	/* this is the function that will be called when the element is inserted in the DOM */

	connectedCallback() {
		/* this is the most powerful option for framework compatibility, by default events from web components
	 	with with shadow DOM, cannot be heard by anything outside it.
		
		so, to its father <fc-autocomplete> to know when a option is clicked, the user must set an click event listener,
		after that the father will now it was clicked, will know its value, and will change its 'selected' value (calling
		set selected, yes the father will call it).

		ie: fc-option function is only tell it was clicked and prepare getters and setters, fc-autcomplete will hear it, and
		use logic to set their methods.
		it can also call their methods when the user type the exact 'value' of the option.
		*/

		this.shadowRoot!.querySelector('button')!.addEventListener('click', () => {
			
			this.dispatchEvent(new CustomEvent('fc-option-select', 
				{
					detail: { value: this.value },
					bubbles: true, // bubbles lets this event goes up to its father (needs composed)
					composed: true // composed lets this event cross the shadow DOM
				}
			));
		});
	}

	/* this is a helper method to update the aria-selected attribute */

	updateSelection() {
		const button = this.shadowRoot!.querySelector('button');
		if (!button) {
			return;
		}
		button.setAttribute('aria-selected', this.selected ? 'true' : 'false');
	}
}
