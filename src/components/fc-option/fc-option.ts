import { template } from './fc-option.template'; // importing the base html and css for the componnet

export class FcOption extends HTMLElement {
	
	/* this is a static method that tells the browser which atributes should be 'watched', that means
	whenever 'value' or 'selected' changes, 'attributeChangedCallback' will be called. */
	static get observedAttributes() { 
		return ['value', 'label', 'selected'];
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
			<fc-option value="somethin">text_label</fc-option>

		this is just an example, the attributes here mostly won't be used by the final user, the main ideia is to let
		the parent decides when an option will be selected or not.
	*/


	public get value() { // return the value of 'value' or '' if doesn't exist
		return this.getAttribute('value') ?? '';
	}

	public set value(data: string) { 
		this.setAttribute('value', data);
	}

	get label() { // label is the inner text that are shown on the option element, 'value' is the hidden value
		return this.getAttribute('label') ?? this.textContent ?? '';
	}

	set label(val: string) {
		this.setAttribute('label', val);
		this.textContent = val; // update the innertext of the option element
	}

	public get selected() { // return true if the component has 'selected' attribute
		return this.hasAttribute('selected');
	}

	public set selected (isSelected: boolean) { 
		/* when this runs, it will update selected attribute, and attributeChangedCallback will be called,
		after that, name on attributeChangedCallback will be 'selected' and it will call updateSelection() function, which will 
		also change the aria-selected property */


		if (isSelected) { // if the setter is called and isSelected is true, adds the selection
			this.setAttribute('selected', 'true');
			return;
		}

		this.removeAttribute('selected'); // if not, remove it
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
					detail: { 
						value: this.value, 
						label: this.label 
					},
					bubbles: true, // bubbles lets this event goes up to its father (needs composed)
					composed: true // composed lets this event cross the shadow DOM
				}
			));
		});
	}

	/* this is the function that runs whenever an observed attribute is changed, note: this is called 
	by the browser itself, so you need to accept all these three props even if you will not be using it
	_ on it are for TypeScript to prevent the 'never used warning' */

	attributeChangedCallback(name: string, _oldVal: string, _newVal: string) {
		if (name === 'selected') { // guarantees the aria-selected to be correctly updated
			this.updateSelection(); 
		}
	}

	/* this is a helper method to update the aria-selected attribute */

	private updateSelection() {
		const button = this.shadowRoot!.querySelector('button');
		if (!button) {
			return;
		}
		button.setAttribute('aria-selected', this.selected ? 'true' : 'false');
	}

	setProps(props: Record<string, any>) { // props type defines an array with {string : anytype }
		
		for (const property in props) { // for each key in props

			const value = props[property] // gets its value
			
			
			// this block checks whether there is a getter, setter or private, variable for the property we are passing
			if (property in this) {
				// if so, call it and go to the next for iterator, ex: if the setter for 'options', this block calls it and append value to it
				(this as any)[property] = value;
				continue; 
			}

			/* this is another check, if we are here, our class does not have logic for the current property we are reading,
			we will paste it directly on the HTML tag, but only if it's text/number, we skip it if it is an Objects or Arrays,
			because it does not work properly in the html tag */
			if (['string', 'number', 'boolean'].includes(typeof value)) {
				this.setAttribute(property, String(value)); // if so, paste it as an HTML attribute
			}
		}
	}
}
