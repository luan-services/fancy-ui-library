import { template } from './fc-autocomplete.template';

export class FcAutoComplete extends HTMLElement {
	
	/* this is a static method that tells the browser which atributes should be 'watched', that means
	whenever 'value' or 'selected' changes, 'attributeChangedCallback' will be called. */
	static get observedAttributes() {
		return ['placeholder', 'name', 'value'];
	}

	/* these are declared attributes, that later on will receive both elements from the shadowRoot with 
	shadowRoot.getElemeentById(), so we can edit these element
	*/
	private inputEl!: HTMLInputElement;
	private dropdownEl!: HTMLElement;

	/* this is the class constructor, whenever you create a new element on js or at the dom, this will be called */
	constructor() {
		super(); // calls HTMLElement class constructor too, after that, runs the following code V
		const shadow = this.attachShadow({ mode: 'open' }); // creates a shadow DOM
		shadow.appendChild(
			template.content.cloneNode(true) // clone our html and css template and append it to the shadow DOM
		); 
	}

	/* this is the function that will be called when the element is inserted in the DOM */

	connectedCallback() {
		// first of all, search for the elements inside the component
		this.inputEl = this.shadowRoot!.getElementById('fc-input') as HTMLInputElement;
		this.dropdownEl = this.shadowRoot!.getElementById('fc-options') as HTMLElement;

		// apply all properties to them (if the user has set it (via js or directly with prop=""))

		if (this.hasAttribute('placeholder')) { // applying the placeholder text to the input
			this.inputEl.placeholder = this.getAttribute('placeholder')!;
		}

		/* this functions add an input event listener to the input element, whenever the users type anything,
		our 'oninput' function will be called.

		about 'bind(this)':
		o .bind(this) "amarra" o contexto. Ele garante que, quando onInput rodar, o this na função onInput continue sendo a 
		instância da classe FcAutoComplete (o elemento <fc-autocomplete>), sem isso, o 'this' lá dentro estaria se 
		referindo ao elemento <Input>, isso é importante pq a função onInput procura elementos <options> dentro de this,
		
		options fica dentro de <fc-autocomplete>, se não houvesse bind(this), ele iria procurar <options> dentro do <input>,
		que está dentro de <fc-autocomplete>, e não acharia nada
		*/
		this.inputEl.addEventListener('input', this.onInput.bind(this));

		/* this functions add an 'fc-option-select' event listener to our element, fc-option-select is a custom event
		created inside the <option> element, that launches whenever the users click on the option
		so, when this happens, onOptionSelect function will be called.

		.bind(this) is the same here
		*/
		this.addEventListener('fc-option-select', this.onOptionSelect.bind(this) as EventListener);


		// this listener is for when the user clicks outside the input so the dropdown can close
		this.inputEl.addEventListener('blur', () => {
            setTimeout(() => { // we add this delay
                this.toggleDropdown(false);
            }, 200);
        });

		// this listener is for when the user clicks on the input again (and it already had text)
		this.inputEl.addEventListener('focus', () => {
			const query = this.inputEl.value.toLowerCase().trim();
			const options = Array.from(this.querySelectorAll('fc-option'));
			const hasMatch = options.some((option) => {
				const label = (option.getAttribute('label') || option.textContent || '').toLowerCase();
				return label.includes(query);
			});
			this.toggleDropdown(hasMatch && query.length > 0);
		});
	}

	/* this is the function that runs whenever an observed attribute is changed (via JS), note: this is called 
	by the browser itself, so you need to accept all these three props even if you will not be using it
	_ on it are for TypeScript to prevent the 'never used warning' */

	attributeChangedCallback(name: string, _old: string, newVal: string) {
		if (name === 'placeholder' && this.inputEl) {
			this.inputEl.placeholder = newVal;
		} 
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

	get value() {
		return this.inputEl?.value ?? '';
	}

	set value(val: string) {
		if (this.inputEl) this.inputEl.value = val;
	}

	
	/** helper functions for the eventListeners */

	private onInput(e: Event) {
		//gets the element binded by the event listener that called this function (inputEl), and retrieve its value (text)
		const query = (e.target as HTMLInputElement).value.toLowerCase().trim();

		// get all option elements and makes an array
		const options = Array.from(this.querySelectorAll('fc-option')); 

		let hasMatch = false;

		options.forEach((option) => { 
			const label = (option.getAttribute('label') || option.textContent || '').toLowerCase(); // gets the label on the option

			const match = label.includes(query); // checks if it matches the input text

			(option as HTMLElement).style.display = match ? 'block' : 'none'; // if so, show the option

			if (match) { // set hasMatch to true, to toggledropdown
				hasMatch = true;
			}
		});
		// toggles dropdown if match - true and the options quantity > 0
		this.toggleDropdown(hasMatch && query.length > 0);
	}

	// when an option is selected, calls this
	private onOptionSelect(e: CustomEvent) {
		const { value, label } = e.detail; // detail are the properties of the custom event from option

		this.inputEl.value = label; // updates the input text to the option text
		this.toggleDropdown(false); // close dropdown

		this.dispatchEvent( // dispatch a new event for anything outside listen saying that the values are changed (to work with frameworks)
			new CustomEvent('fc-change', {
				detail: { value, label },
				bubbles: true,
				composed: true,
			})
		);
	}

	private toggleDropdown(show: boolean) {
		if (!this.dropdownEl) {
			return;
		}
		this.dropdownEl.hidden = !show;
		this.inputEl.setAttribute('aria-expanded', show ? 'true' : 'false');
	}

	
	// setProps function that lets the user updates any props via setProps({value: 'x'})
	setProps(props: Record<string, any>) {
		Object.entries(props).forEach(([key, val]) => {
			if (key in this) {
				(this as any)[key] = val;
				return;
			}
			this.setAttribute(key, val);
		});
	}
}
