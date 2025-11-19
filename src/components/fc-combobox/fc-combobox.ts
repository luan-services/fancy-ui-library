import { template } from './fc-combobox.template';
import { FcOption } from '../fc-option';


/* in this component, the properties 'label' and 'value' doesn't exist as ACTUAL attributes:

	VALUE is a mirror from the 'value' attribute of CHILD fc-option element
	LABEL is a plain text that can be either typed and will be set as 'label' attribute of this component's CHILD input, or
	it can be selected from an option and will be a mirror from the 'label' attribute of the CHILD fc-option

	placeholder - an actual attribute of <fc-combobox>
	name - an actual attribute of <fc-combobox> (used to define the element as part of a form if wanted to)

	value - as said above, it is a mirror, but it also will be the formElement value
	label - as said above, another mirror

	options (set and get) - used to add <fc-option> elements inside the combobox with js
*/

export class FcComboBox extends HTMLElement {
	
	/* this is a static method that tells the browser which atributes should be 'watched', that means whenever 'name' 
	or 'placeholder' attributes are set by the user like <fc-combobox name="a">, 'attributeChangedCallback' will be called. */
	static get observedAttributes() {
		return ['placeholder', 'name'];
	}

	/* these are declared attributes, that later on will receive both elements from the shadowRoot with 
	shadowRoot.getElemeentById(), so we can edit these element
	*/
	private inputEl!: HTMLInputElement;
	private dropdownEl!: HTMLElement;
	private optionValue: string = ''; // references the current selected option value
	
	// this signals the browser this custom element (<fc-combobox>) should participate in forms, allowing its value to be submitted along with the form data.
	static formAssociated = true; 
	// this is an reference that provides methods and properties for custom elements to access form control features
	private internals: ElementInternals;


	/* this is the class constructor, whenever you create a new element on js or at the dom, this will be called */
	constructor() {
		super(); // calls HTMLElement class constructor too, after that, runs the following code V
		const shadow = this.attachShadow({ mode: 'open' }); // creates a shadow DOM
		shadow.appendChild(
			template.content.cloneNode(true) // clone our html and css template and append it to the shadow DOM
		); 

		// attatch iternals functions to the reference to use the form control features with 'this.internals.*'
		this.internals = this.attachInternals(); 

		/* about 'bind(this)':
		o .bind(this) "amarra" o contexto. Ele garante que, quando a funcao onInput rodar, o this na função onInput continue sendo a 
		instância da classe FcComboBox (o elemento <fc-combobox>), sem isso, o 'this' lá dentro estaria se 
		referindo ao elemento <Input>, isso eh importante pq a função onInput procura elementos <options> dentro de this,
		
		options fica dentro de <fc-combobox>, se não houvesse bind(this), ele iria procurar <options> dentro do <input>,
		que está dentro de <fc-combobox>, e não acharia nada

		ou seja, durante o constructor, precisamos bindar qualquer funcao que criamos aqui que use event listeners. o bind precisa
		ser feito aqui, pois se for feito direto no connectCallback de construcao do listener, toda vez uma instancia nova da funcao
		seria criada, causando memory leak, para resolver, ao construir uma instancia do componente, pegamos todas as funcoes que
		estao em listeners e bindamos o componentes a eles por aqui v
		*/

		this.onInput = this.onInput.bind(this);
		this.onOptionSelect = this.onOptionSelect.bind(this);
		this.onOutsideClick = this.onOutsideClick.bind(this);
		this.onFocusOut = this.onFocusOut.bind(this);
		this.onFocus = this.onFocus.bind(this);

	}

	/* defines getter and setter methods for attributes and also for properties
		
		setting attributes work in two ways inside a HTMLElement Class, you can either do:
			const component = _select the component here_ 
			component.value = 'something'
		or
			<fc-option value="somethin">text_label</fc-option>

		this is just an example, the attributes here mostly won't be used by the final user, the main ideia is to let
		the parent decides when an option will be selected or not.

		NOTE: that some getters and setters here are not for attributes, for example: set options is designed to set
		a list of <fc-option> elements inside the shadowDOM without actually doing it by html

		the actual rule is: every attribute of <fc-combobox> should have a getter and setter, but not all getters and setters
		are used to manipulate the <fc-combobox> attributes.
	*/

	/* value is a getter only, you cannot set an initial value, you can only do it by typing or clicking on an option
	*/
	get value() {
		return this.optionValue;
	}

	get label() {
		return this.inputEl?.value ?? '';
	}

	/* value and label must coexist together, so it needs only one setter that sets both
	*/
	set current(data: {value: string, label: string}) {
		if (!data || !data.label || !data.value) {
			return;
		}

		if (!this.inputEl) {
			requestAnimationFrame(() => (this.current = data));
			return;
		}

		this.inputEl.value = data.label;
		this.optionValue = data.value;
		this.internals.setFormValue(data.value); // update the form 'value' property: <fc-combobox value=""> to our selected value
		
		const options = Array.from(this.querySelectorAll('fc-option')) as FcOption[];

		options.forEach(option => {
			const isSelected = option.value === data.value;
			option.selected = isSelected;
		});

		this.toggleDropdown(false);
		
		this.dispatchEvent(
			new CustomEvent('fc-change', {
				detail: { 
					value: data.value, 
					label: data.label 
				},
				bubbles: true,
				composed: true,
			})
		);
	}

	get placeholder() {
		return this.getAttribute("placeholder") ?? "";
	}

	set placeholder(val: string) {
		this.setAttribute("placeholder", val);
	}

	get name() {
		return this.getAttribute('name') ?? '';
	}

	set name(val: string) {
		this.setAttribute('name', val);
	}

	get options() {
		// search at the shadow dom for the 'slot' element
		const slot:HTMLSlotElement | null = this.shadowRoot!.querySelector('slot'); 
		/* doing only 'slot' will get the first slot element
			not a problem because combobox has only 1 slot element, if it did not, should have done 'slot:([slot_name])' */

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

            // Passo C: Injeta no Light DOM (dentro do <fc-combobox>)
            // Isso permite que o this.querySelectorAll('fc-option') do onInput as encontre.
            this.appendChild(optEl);
        });
	}

	/* this is the function that will be called when the element is inserted in the DOM */

	connectedCallback() {
		// first of all, search for the elements inside the component
		this.inputEl = this.shadowRoot!.getElementById('fc-input') as HTMLInputElement;
		this.dropdownEl = this.shadowRoot!.getElementById('fc-options') as HTMLElement;

		/* if the attributes below exists (if it was applied by the user (via js or directly with prop="")), apply the properties
		to the respective children inside the shadow DOM */

		if (this.hasAttribute('placeholder')) { // applying the placeholder text to the input
			this.inputEl.placeholder = this.getAttribute('placeholder')!;
		}

		/* if 'name' exists, this component will be considered a form part, so it'll set the form 
		'value' property: <fc-combobox value="">, do it only once when the component is created
		*/
		if (this.hasAttribute('name')) {
			/* it will be '' if no option is selected on mount (default) (this.value means calling get value()) */
			this.internals.setFormValue(this.value); 
		}

		/* this functions add an input event listener to the input element, whenever the users type anything,
		our 'oninput' function will be called.
		*/
		this.inputEl.addEventListener('input', this.onInput);

		/* this functions add an 'fc-option-select' event listener to our element, fc-option-select is a custom event
		created inside the <option> element, that launches whenever the users click on the option
		so, when this happens, onOptionSelect function will be called.
		*/
		this.addEventListener('fc-option-select', this.onOptionSelect as EventListener);

		/* this listener is for when the user clicks outside the input so the dropdown can close this is a DOM event 
		listener, so it must be cleaned onDisconnectCallback (when the element is removed from the dom) to prevent memory leak */
		document.addEventListener('click', this.onOutsideClick as EventListener);

		/* this listener is for when the user clicks outside the input so the dropdown can close  */
		this.addEventListener('focusout', this.onFocusOut as EventListener);

		// this listener is for when the user clicks on the input again (and it already had text)
		this.inputEl.addEventListener('focus', this.onFocus);
	}

	/* this is the function that runs whenever an observed attribute is changed (via JS), note: this is called 
	by the browser itself, so you need to accept all these three props even if you will not be using it
	_ on it are for TypeScript to prevent the 'never used warning' */

	attributeChangedCallback(name: string, _old: string, newVal: string) {
		if (name === 'placeholder' && this.inputEl) {
			this.inputEl.placeholder = newVal;
		} 

		/* in this case, same as on the connectedCallback, if 'name' is set by js (cbFruits.name = "a"), the function bellow will 
		set form value and the component will be considered a form part */
		if (name === 'name') {
			// update the form 'value' property: <fc-combobox value="">
			// it will be '' if no option is selected on mount (default) (this.value means calling get value())
			this.internals.setFormValue(this.value);
		}
	}
	
	/* this is the cleaning up function, it'll be called when the element is REMOVED from the DOM, here, we want
	to clean (remove) any event listener that is binded to the DOM. */

	disconnectedCallback() {
		document.removeEventListener('click', this.onOutsideClick);
	}

	/** helper functions for the eventListeners */

	private onInput(e: Event) {
		//gets the element binded by the event listener that called this function (inputEl), and retrieve its value (text)
		const rawQuery = (e.target as HTMLInputElement).value;
		const query = rawQuery.toLowerCase().trim();

		// get all option elements and makes an array
		const options = Array.from(this.querySelectorAll('fc-option')) as FcOption[];

		let hasMatch = false;
		let matchExactlyValue = ''; // attribute to store the value of an option if the option matches exactly the query

		options.forEach((option) => { 
			const rawLabel = (option.getAttribute('label') || option.textContent || '');
			const label = rawLabel.toLowerCase(); // gets the label on the option

			const match = label.includes(query); // checks if the query is on the label name
			option.style.display = match ? 'block' : 'none'; // if so, show the option

			if (match) { // set hasMatch to true, to toggledropdown
				hasMatch = true;
			}

			const matchExactly = (rawQuery === rawLabel && query.length > 0); // checks if the query is exactly the option

			if (matchExactly) { // if match exactly, set the option as selected, if not, remove selected attribute(query === label)
				matchExactlyValue = option.value;
				option.selected = true;
				return;
			}

			option.selected = false;
		});
		
		this.optionValue = matchExactlyValue; // updates the value property of <fc-combobox>
		this.internals.setFormValue(matchExactlyValue); // also update the form 'value' property: <fc-combobox value="">

		this.dispatchEvent( // dispatch a new event for anything outside listen saying that the values are changed (to work with frameworks)
			new CustomEvent('fc-change', 
			{
				detail: { 
					value: matchExactlyValue, 
					label: rawQuery
				},
				bubbles: true,
				composed: true,
			}
		));

		// toggles dropdown if match - true and the options quantity > 0
		this.toggleDropdown(hasMatch && query.length > 0);
	}
	
	// when an option is selected, calls this
	private onOptionSelect(e: CustomEvent) {
		const { value, label } = e.detail; // detail are the properties of the custom event from option

		this.inputEl.value = label; // updates the input text to the option text
		this.optionValue = value; // updates the value property of <fc-combobox>
		this.internals.setFormValue(value); // also update the form 'value' property: <fc-combobox value="">

		// get all option elements and makes an array
        const options = Array.from(this.querySelectorAll('fc-option')) as FcOption[];

		options.forEach((option) => {
			const selected = (option.value === value); // checks if the selected option is the current option
			option.selected = selected // if so, set the option as selected, if not, remove selected attribute(query === label)
			option.style.display = selected ? 'block' : 'none'; // if so, show the option
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

	private onOutsideClick(e: MouseEvent) { // will check whether the click was outside or inside the component, to close the dropdown
		if (!this.contains(e.target as Node)) {
			this.toggleDropdown(false);
		}
	}

	private onFocusOut(e: FocusEvent) { // If the newly-focused element is outside the component, close
		if (!this.contains(e.relatedTarget as Node)) {
			this.toggleDropdown(false);
		}
	};

	private onFocus(e: FocusEvent) {
		/*
		const query = this.inputEl.value.toLowerCase().trim();
		const options = Array.from(this.querySelectorAll('fc-option'));
		const hasMatch = options.some((option) => {
			const label = (option.getAttribute('label') || option.textContent || '').toLowerCase();
			return label.includes(query);
		});
		this.toggleDropdown(hasMatch && query.length > 0);
		*/
		this.toggleDropdown(true);
	};

	private toggleDropdown(show: boolean) {
		if (!this.dropdownEl) {
			return;
		};

		const dropdown = this.dropdownEl;

		// if it should be open
		if (show) {
			dropdown.hidden = false;
			this.setAttribute('open', 'true');
			this.inputEl.setAttribute("aria-expanded", "true");
			return;
		}

		this.dropdownEl.hidden = true;
		this.removeAttribute('open');
		this.inputEl.setAttribute("aria-expanded", "false");

	}
	
	public setProps(props: Record<string, any>) { // props type defines an array with {string : anytype }
		
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

