import { template } from './fc-autocomplete.template';
import { FcOption } from '../fc-option';

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

	get options() {

		// search at the shadow dom for the 'slot' element
		const slot:HTMLSlotElement | null = this.shadowRoot!.querySelector('slot'); /* doing only 'slot' will get the first slot element
			not a problem because autocomplete has only 1 slot element, if it did not, should have done 'slot:([slot_name])' */

		// get all elements inside the slot and filter only elements named <fc-option>
		const optionElements = slot!.assignedElements().filter(
			(el) => {
				return el.tagName === 'FC-OPTION' // the element tag name must be upper-case
			}
		);

		// return an array of objects with {label, value}
        return optionElements.map(opt => ({
            label: (opt as FcOption).label, 
            value: (opt as FcOption).value
        }));
    }

	
    set options(data: { label: string, value: string }[]) {
		
		// get already existing options and remove them (to prevent error if the user is trying to set options more than once)
        const oldOptions = this.querySelectorAll('fc-option');
        oldOptions.forEach(opt => opt.remove());

        // for each data param, make an option and append to the shadow DOM
        data.forEach((element) => {
            const optEl = document.createElement('fc-option');
            
            // setting the values to the option;
            optEl.setAttribute('value', element.value);
            optEl.setAttribute('label', element.label); 
            optEl.textContent = element.label;

            // Passo C: Injeta no Light DOM (dentro do <fc-autocomplete>)
            // Isso permite que o this.querySelectorAll('fc-option') do onInput as encontre.
            this.appendChild(optEl);
        });
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


		/* this listener is for when the user clicks outside the input so the dropdown can close this is a DOM event 
		listener, so it must be cleaned onDisconnectCallback (when the element is removed from the dom) to prevent memory leak */
		document.addEventListener('click', this.handleOutsideClick.bind(this) as EventListener);

		/* this listener is for when the user clicks outside the input so the dropdown can close  */
		this.addEventListener('focusout', this.handleFocusOut.bind(this) as EventListener);

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
	
	/* this is the cleaning up function, it'll be called when the element is REMOVED from the DOM, here, we want
	to clean (remove) any event listener that is binded to the DOM. */

	disconnectedCallback() {
		document.removeEventListener('click', this.handleOutsideClick);
		this.removeEventListener('focusout', this.handleFocusOut);
	}
	/** helper functions for the eventListeners */

	private onInput(e: Event) {
		//gets the element binded by the event listener that called this function (inputEl), and retrieve its value (text)
		const query = (e.target as HTMLInputElement).value.toLowerCase().trim();

		// get all option elements and makes an array
		const options = Array.from(this.querySelectorAll('fc-option')) as FcOption[];

		let hasMatch = false;

		options.forEach((option) => { 
			const label = (option.getAttribute('label') || option.textContent || '').toLowerCase(); // gets the label on the option

			const match = label.includes(query); // checks if the query is on the label name

			option.style.display = match ? 'block' : 'none'; // if so, show the option

			if (match) { // set hasMatch to true, to toggledropdown
				hasMatch = true;
			}

			const matchExactly = (query === label && query.length > 0); // checks if the query is exactly the option

			option.selected = matchExactly // if match exactly, set the option as selected, if not, remove selected attribute(query === label)
		});
		// toggles dropdown if match - true and the options quantity > 0
		this.toggleDropdown(hasMatch && query.length > 0);
	}
	
	// when an option is selected, calls this
	private onOptionSelect(e: CustomEvent) {
		const { value, label } = e.detail; // detail are the properties of the custom event from option

		this.inputEl.value = label; // updates the input text to the option text

		// get all option elements and makes an array
        const options = Array.from(this.querySelectorAll('fc-option')) as FcOption[];

		options.forEach((option) => {

			const selected = (option.value === value); // checks if the selected option is the current option
			option.selected = selected // if so, set the option as selected, if not, remove selected attribute(query === label)
        });

		this.toggleDropdown(false); // close dropdown

		this.dispatchEvent( // dispatch a new event for anything outside listen saying that the values are changed (to work with frameworks)
			new CustomEvent('fc-change', {
				detail: { value, label },
				bubbles: true,
				composed: true,
			})
		);
	}

	private handleOutsideClick(e: MouseEvent) { // will check whether the click was outside or inside the component, to close the dropdown
		if (!this.contains(e.target as Node)) {
			this.toggleDropdown(false);
		}
	}

	private handleFocusOut(e: FocusEvent) { // If the newly-focused element is outside the component, close
		if (!this.contains(e.relatedTarget as Node)) {
			this.toggleDropdown(false);
		}
	};

	private toggleDropdown(show: boolean) {
		if (!this.dropdownEl) {
			return;
		}
		this.dropdownEl.hidden = !show;
		this.inputEl.setAttribute('aria-expanded', show ? 'true' : 'false');
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

