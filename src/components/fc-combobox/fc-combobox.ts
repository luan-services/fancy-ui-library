import { template } from './fc-combobox.template';
import { FcOption } from '../fc-option'; // import just the FcOption TYPE definition
import { calculateBottomAvaliableSpace, calculateTopAvaliableSpace } from '../../utils/fc-elements.utils';
// v1.0.4

/* in this component, the properties 'label' doesn't exist as an ACTUAL attribute:

	LABEL is a plain text that can be either typed and will be set as 'label' attribute of this component's CHILD input, or
	it can be selected from an option and will be a mirror from the 'label' attribute of the CHILD fc-option

	placeholder - an actual custom attribute of <fc-combobox>, calling its setters will create an attribute on the main component

	name - an actual attribute of <fc-combobox> (used to define the element as part of a form if wanted to), calling its setters will create an attribute on the main component

	value - it is a mirror from the 'value' attribute of CHILD fc-option element, but it is not set as an attribute itself, you can use
	it to set an INITIAL _value, but any changes on the current selected value is stored on private _value property

	you can do <fc-combobox value="country-1"/> tho, thanks to it being an observedAttribute, if you do this, attributeChangecallback
	wil run and call FcCombobox.value setter.

	label - as said above, it is a mirror from this.inputEl label, it has no setter.

	hidden - is a built-in attribute for any HTMLElement, you don't need to getters and setters for it, you just can call 
	this.hidden = true/false

	disabled - on <fc-combobox> it is an actual custom attribute, because not every HTMLElement has disabled built it, but
	we also set inputEl.disabled = true -> here disabled is built-in, because every Input has 'disabled' by default

	options (set and get) - used to add <fc-option> elements inside the combobox with js
*/

/* the keyboard navigation in this component is specific for a combobox, if used in a select dropdown component for example, it would need
to be refactored.

in this case, whenever the user closes the dropdown, it resets the index to -1 and remove active from any option, when selecting an
option, it also does this, the only way a option not unactived is when the user inputs something (if the dropdown does not close)

this is the simpliest approach for a working combobox, other approaches would be too complicated since it is not as simple as a fc-select,
for example

*/

/* about value:
value setter here is used to let the FcCombobox to be 'controlled' on react. In react, on a commom component, like input, when you do:
<input value={state} onChange={...} />

it is not actually setting an attribute 'value', react will CALL input.value setter, that's how react do it with the @lit library,
it won't ever set any attribute, it just call the setter.

so, you can do:

<FcCombobox value={useState} onFcChange={(e)=>{}}/>

the briliant part: some setters, like set placeholder, actually creates an attribute with the name passed, so even on react if you do 
placeholder="a", it will do fc-combobox.placeholder = 'a'. and the internal logic will correctly add a placeholder attribute.
these are called reflecting properties, they sinchronize attributes.

'value' is a non-reflecting property, its setter does not create a 'value' attribute.

on the other hand, on vanilla, any attribute added, by doing <fc-combobox placeholder="a"/> will be an set as an actual attribute,
and if it is an observed attribute, attributeChangecallback will be called, and it might do something

*/

/* about validity

validity is sync on every input, when the user enters the field, currently validity only works for commom attribute constraints and it
syncs with form internals, later on, i'll add a custom validity setter.

validation alone does not trigger visual effects, it also relies on the 'touched' attribute, 'touched' is set on the first blur / 
on submit (whenever checkValidity() is called) thanks to onInvalid().

i.e: validation occurs always, visual effects only after first blur / submit. this is the same for fc-error text, it only shows up after
the 'touched' is set on the target element

there is also a custom setter (validate) to set a function that validates the input: user must send a function, when they return
a string (the error message) it is an error, if they return 'null', the input is valid

required, readonly and strict attributes are for validation

*/

/* about acessibility 

aria-describedby, aria-details, aria-labelledby: shouldn't be mapped down to the input, when set, the browser knows it is set on 
the inner inputEl, thanks to delegatesFocus that passes the focus to it.
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
delegatesFocus: true ensures that whenever I click ANYWHERE inside <fc-input> the focus will be passed to the first child element of it,
which means the focus will stay in <input> element. this is great for custom input web components.

aria-label: same as above, but you can pass it down via observedAttributes if you want

aria-invalid, aria-disabled, aria-required: whenever a state is set (by user or by inner logic), we should update form INTERNALS aria
only, like: this.internals.ariaSomething = true

other arias: other aria properties are added directly to the element template because they do not need to be custom and does not change 

*/

/* about delegatesFocus: true
on <fc-combobox>, specifically, delegatesFocus: true has another role: 
before adding it, whenever the user click inside the dropdown but not on an option, the browser would try to move the focus to 
the div, it'd fail and the focus would go back to 'body', this way, onFocusout would be called, and since body is not inside 
<fc-combobox> toggleDropdown would close the div.

now, with delegate, focus, clicks inside the dropdown but not on an option will delegate the focus back to the input element inside
<fc-combobox> (the first child element) preventing the onFocusOut to launch, that means, onDropdownClick listener is not needed anymore
*/



export class FcCombobox extends HTMLElement {
	
	/* this is a static method that tells the browser which atributes should be 'watched', that means whenever 'name' 
	or 'placeholder' attributes are set by the user like <fc-combobox name="a">, 'attributeChangedCallback' will be called. */
	static get observedAttributes() {
		return ['placeholder', 'name', 'value', 'disabled', 'required', 'readonly', 'strict'];
	}

	/* these are declared attributes, that later on will receive both elements from the shadowRoot with 
	shadowRoot.getElemeentById(), so we can edit these element
	*/
	private inputEl!: HTMLInputElement;
	private dropdownEl!: HTMLElement;
	
	// this signals the browser this custom element (<fc-combobox>) should participate in forms, allowing its value to be submitted along with the form data.
	static formAssociated = true; 
	// this is an reference that provides methods and properties for custom elements to access form control features
	private internals: ElementInternals;

	// references the current selected option's value
	private _value: string = '';

	// tracks the current index of the active option (for keyboard navgation)
    private activeIndex: number = -1;

    /* this will store user's custom validation function for <fc-input> (if exists) 
    validatorFunction should have a logic that either returns a string (the error message) or null, if it returns null after
    calculations, the input passed user's validation, if returns a string, it is an error. */
	private _validatorFunction: ((value: string) => string | null) | null = null;

	/* this is the class constructor, whenever you create a new element on js or at the dom, this will be called */
	constructor() {
		super(); // calls HTMLElement class constructor too, after that, runs the following code V
		const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true}); // creates a shadow DOM
		shadow.appendChild(
			template.content.cloneNode(true) // clone our html and css template and append it to the shadow DOM
		); 

		// attatch iternals functions to the reference to use the form control features with 'this.internals.*'
		this.internals = this.attachInternals(); 

		/* search for the elements inside shadowDOM by class and assign them to their properties */
		this.inputEl = shadow.querySelector('.fc-input') as HTMLInputElement;
        this.dropdownEl = shadow.querySelector('.fc-options') as HTMLElement;

		/* assigning random ids to the elements to prevent bugs if there is one or more ID */

		const randomId = Math.random().toString(36).substring(2, 9);

		const inputId = `fc-input-${randomId}`;
		const dropdownId = `fc-options-${randomId}`;

		this.inputEl.id = inputId;
		this.dropdownEl.id = dropdownId;
		this.inputEl.setAttribute('aria-controls', dropdownId);

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
		this.onChange = this.onChange.bind(this);
		this.onOptionSelect = this.onOptionSelect.bind(this);
		this.onOutsideClick = this.onOutsideClick.bind(this);
		this.onFocusOut = this.onFocusOut.bind(this);
		this.onFocus = this.onFocus.bind(this);

		/* exclusive function for react see below */
		this.onSlotChange = this.onSlotChange.bind(this);

		/* bind the keydown function for keyboard navigation */
        this.onKeyDown = this.onKeyDown.bind(this);

		
        /* this bind the onBlur and onInvalid function to this context, it is used to set 'touched' attribute to this element and to inputEl 
        on blur, so the CSS invalid properties will start working*/
		this.onBlur = this.onBlur.bind(this);
        this.onInvalid = this.onInvalid.bind(this);
	}

	
	/* this is the public validity API (getters), <form> elements automatically know when their children are
    valid or not, but the user (and specially our <fc-error> element) needs and api to check the validity status of our component */
	
	public get validity() { 
        return this.internals.validity; 
    }

	public get validationMessage() { 
        return this.internals.validationMessage; 
    }

	public get willValidate() { 
        return this.internals.willValidate; 
    }

	public checkValidity() { 
        return this.internals.checkValidity(); 
    }

	public reportValidity() { 
        return this.internals.reportValidity(); 
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

	public get placeholder() {
		return this.getAttribute("placeholder") ?? "";
	}

	public set placeholder(val: string) {
		this.setAttribute("placeholder", val);
	}

	public get name() {
		return this.getAttribute('name') ?? '';
	}

	public set name(val: string) {
		this.setAttribute('name', val);
	}

	public get disabled() {
		return this.hasAttribute('disabled');
	}

	public set disabled(val: boolean) {
		if (val) {
			this.setAttribute('disabled', 'true');
			return;
		} 
		
		this.removeAttribute('disabled');
	}

	/* value must also have a setter to work on react, it'll reflect the options value, an invalid value can also be passed
	*/
	public get value() {
		return this._value;
	}

	public set value(newValue: string) {
        // prevent infinite loops if the value is the same
        if (this._value === newValue) {
			return;
		}

        this._value = newValue;
        this.internals.setFormValue(newValue);

		if (!this.inputEl) { // prevents crash if inputEl does not exist yet
			return;
		}

        // sync the UI (find the option and select it)
        const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;

		options.forEach((option) => {
			const selected = (option.value === newValue); // checks if the selected option is the current option
			option.selected = selected // if so, set the option as selected by calling set selected from child fc-option, if not, remove selected attribute(query === label)
			option.hidden = !selected // if so, show the option
			option.active = false; // now it is needed to remove active status from all options when a option is selected

			if (selected) {
            	this.inputEl.value = option.label;
        	}
        });

		// if no matching option found from value, updates 'value' to it		
		if (this.inputEl.value === '') {
			this.inputEl.value = newValue;
		};

		this.syncValidity();
    }

	public get label() {
		return this.inputEl?.value ?? '';
	}

	public get options() {
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
	
    public set options(data: { label: string, value: string, disabled?: boolean }[]) {
		
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

			if (element.disabled) {
				optEl.setAttribute('disabled', '');
			}

            // injects on Light DOM (inside do <fc-combobox>), this is not good for SEO because all options text won't be ready until js runs
            this.appendChild(optEl);
        });

		this.syncValidity();
	}
	
	/* these are attributes to set how validation should work */

	public get required() { 
		return this.hasAttribute('required'); 
	}

    public set required(val: boolean) {
        if (val) {
            this.setAttribute('required', 'true');
            return;
        }
        this.removeAttribute('required');
    }

    public get readonly() { 
		return this.hasAttribute('readonly'); 
	}

    public set readonly(val: boolean) {
        if (val) {
            this.setAttribute('readonly', 'true');
            return;
        }
        this.removeAttribute('readonly');
    }

    public get strict() { 
		return this.hasAttribute('strict'); 
	}

    public set strict(val: boolean) {
        if (val) {
            this.setAttribute('strict', '');
            return;
        }
        this.removeAttribute('strict');
    }

	public get validator() { 
		return this._validatorFunction; 
	}
	
    public set validator(func: ((value: string) => string | null) | null) {
        this._validatorFunction = func;
        this.syncValidity();
    }

	/* this is the function that will be called when the element is inserted in the DOM */

	connectedCallback() {

		/* this component is considered a form part, it'll set this components '_value' as a formValue, so on the form you will see 
		a field {name: 'fc-combobox name property', value: "fc-combobox value property"} if 'name' property is not set, browser is 
		smart enought and won't set the  form field if it is the case  it will still have a formValue for the formRestore and formReset 
		callbacks to work tho */
		this.internals.setFormValue(this.value); 

		/* if the attributes below exists (if it was applied by the user (via js or directly with prop="")), apply the properties
		to the respective children inside the shadow DOM */

		if (this.hasAttribute('placeholder')) { // applying the placeholder text to the input
			this.inputEl.placeholder = this.getAttribute('placeholder')!;
		}

		if (this.hasAttribute('disabled')) {
			/* applying 'disabled' to the input if <fc-combobox> has 'disabled*/
			this.inputEl.disabled = true;
			this.internals.ariaDisabled = 'true';
		}
		
		/* pass down readonly constraint to the inner inputEl */
		if (this.hasAttribute('readonly')) {
            this.inputEl.readOnly = true;
        }
		/* sets aria required if exist */
        if (this.hasAttribute('required')) {
            this.internals.ariaRequired = 'true';
			this.inputEl.required = true;
        }

		/* this functions add an input event listener to the input element, whenever the users type anything,
		our 'oninput' function will be called. */
		this.inputEl.addEventListener('input', this.onInput);

		/* this functions add an input event listener to the input element, whenever the users type anything,
		our 'onChange' function will be called. */
		this.inputEl.addEventListener('change', this.onChange);

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

		/* this listener is for when the user clicks on the input again (and it already had text) */
		this.inputEl.addEventListener('focus', this.onFocus);

		this.inputEl.addEventListener('blur', this.onBlur);

		/* this listener fires when a form wrapped around this input is submited (anytime checkValidity() is called) */
		this.addEventListener('invalid', this.onInvalid);


		/* this listeners is for react-only, rendering elements on react is a bit different, sometimes, it might render
		<fc-combobox> BEFORE <fc-option>, so when it first runs, it might miss the <fc-options>'s and not initialize it correctly 

		this is a case where fc-combobox
		
		ie: this must be done for every created slot for react to work, since we have only 1, we do 'slot', but it could be 
		'slot[name="label"]'
		*/

		const slot = this.shadowRoot!.querySelector('slot');
		slot?.addEventListener('slotchange', this.onSlotChange);

		/* creates the keydown listener to handle keyboard navigation */
        this.inputEl.addEventListener('keydown', this.onKeyDown);

		/* doing inital validating if the element starts with any 'value' */
		this.syncValidity();
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

		if (name === 'value') {
            // when user writes <fc-combobox value="x">, we call our JS setter
            this.value = newVal; 
        }

		if (name === 'disabled' && this.inputEl) {
			const isDisabled = this.hasAttribute('disabled');
			this.inputEl.disabled = isDisabled; // if disabled changes to true, pass it to the child input
			this.internals.ariaDisabled = isDisabled ? 'true' : 'false';
			// if we are disabling ensure the dropdown closes
			if (isDisabled) {
				this.toggleDropdown(false);
			}
		}

		if (name === 'required' && this.inputEl) {
			const isRequired = this.hasAttribute('required');
			this.internals.ariaRequired = isRequired ? 'true' : 'false';
			this.inputEl.required = isRequired;
			this.syncValidity();
		}

		if (name === 'readonly' && this.inputEl) {
			this.inputEl.readOnly = this.hasAttribute('readonly');
		}

		if (name === 'strict' && this.inputEl) {
			this.syncValidity();
		}

	}
	
	/* this is the cleaning up function, it'll be called when the element is REMOVED from the DOM, here, we want
	to clean (remove) any event listener that is binded to the DOM. */

	disconnectedCallback() {
		document.removeEventListener('click', this.onOutsideClick);
	}

	/* the callbacks below are exclusive of when using this component as a form component, both are callbacks that
	runs whenever the user do some form actions */

	/* if there is a button type="reset" on the form, and the user clicks it, this function will be run */
	formResetCallback() {

		this._value = '';
		
		if (this.inputEl) {
			this.inputEl.value = '';
		}

		this.internals.setFormValue('');

		const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;
		options.forEach(option => {
			option.selected = false;
			option.hidden = false;
		});

		this.toggleDropdown(false);

		/* removes touched attribute and reset validity on form reset */
		this.removeAttribute('touched'); 
        this.syncValidity();

        /* dispatch an fc-reset event to let fc-error knows when the element status has been reseted by a form button */
        this.dispatchEvent(new CustomEvent('fc-reset', { 
            bubbles: true, 
            composed: true 
        }));
	}

	/* this runs whenever the user click on return on the page and them go back to the form page again,
	it also runs when the user click on the default browser autocomplete (we disabled it) */
	formStateRestoreCallback(state: string | File | FormData | null, mode: 'restore' | 'autocomplete') {
		// 'state' is the value the user previously saved setFormValue
		const restoredValue = state as string;

		if (restoredValue) { // if there was a value, add it again and update the option label
			this._value = restoredValue;
			this.internals.setFormValue(restoredValue);

			const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;

			options.forEach(option => {
				if (option.value === restoredValue && this.inputEl) {
					this.inputEl.value = option.label;
					option.selected = true;
				}
			});
			this.syncValidity();
		};
	}

	/** helper functions for the eventListeners */

	private onInput(e: Event) {
		//gets the element binded by the event listener that called this function (inputEl), and retrieve its value (text)
		const rawQuery = (e.target as HTMLInputElement).value;
		const query = rawQuery.toLowerCase().trim();

		// get all option elements and makes an array
		const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;

		// if query is empty, show all options and close
		if (query.length === 0) { 
			options.forEach(opt => {
				opt.hidden = false;
				opt.selected = false;
				opt.active = false;
			});


			this._value = '';
			this.internals.setFormValue(''); 
			this.inputEl.removeAttribute('aria-activedescendant');
			this.toggleDropdown(true);
			this.syncValidity();

			this.dispatchEvent( // dispatch a new event for anything outside listen saying that the values are changed (to work with frameworks)
				new CustomEvent('fc-input', 
				{
					detail: { 
						value: rawQuery, 
						label: rawQuery
					},
					bubbles: true,
					composed: true,
				}
			));

			return; 
		}

		let hasMatch = false;

		let finalValue = ''; // attribute to store the value of an option if the option matches exactly the query

		options.forEach((option) => { 
			const rawLabel = (option.getAttribute('label') || option.textContent || '');
			const label = rawLabel.toLowerCase(); // gets the label on the option

			const match = label.includes(query); // checks if the query is on the label name
			option.hidden = !match // if so, show the option

			if (match) { // set hasMatch to true, to toggledropdown
				hasMatch = true;
			}

			const matchExactly = (rawQuery === rawLabel && query.length > 0); // checks if the query is exactly the option

			if (matchExactly && !option.disabled) { // if match exactly, set the option as selected, if not, remove selected attribute (query === label)
				finalValue = option.value;
				option.selected = true; // auto select the option
				return;
			}

			option.selected = false;
		});

		if (finalValue == '') { // guarantees the final value to be the user input if there is no matching value
			finalValue = rawQuery
		};

		this._value = finalValue; // updates the value property of <fc-combobox>
		this.internals.setFormValue(finalValue); // also update the form 'value' property: <fc-combobox value="">
		this.syncValidity();

		this.dispatchEvent( // dispatch a new event for anything outside listen saying that the values are changed (to work with frameworks)
			new CustomEvent('fc-input', 
			{
				detail: { 
					value: finalValue, 
					label: rawQuery
				},
				bubbles: true,
				composed: true,
			}
		));

		// toggles dropdown if match - true and the options quantity > 0
		this.toggleDropdown(hasMatch);
	}
	
	private onChange(e: Event) {
        e.stopPropagation(); // Prevent the native input 'change' from bubbling up
        
        this.dispatchEvent(new CustomEvent('fc-change', { 
            detail: { 
                value: this._value, 
                label: this.inputEl.value
            },
            bubbles: true, 
            composed: true 
        }));
    }

	// when an option is selected, calls this
	private onOptionSelect(e: CustomEvent) {
		const { value, label } = e.detail; // detail are the properties of the custom event from option

		//prevent selecting option if disabled
		 if (this.disabled) {
			return;
		 }

		this.inputEl.value = label; // updates the input text to the option text
		this._value = value; // updates the value property of <fc-combobox>
		this.internals.setFormValue(value); // also update the form 'value' property: <fc-combobox value="">

		// get all option elements and makes an array
        const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;

		options.forEach((option) => {
			const selected = (option.value === value); // checks if the selected option is the current option
			option.selected = selected // if so, set the option as selected by calling set selected from child fc-option, if not, remove selected attribute(query === label)
			option.hidden = !selected // if so, show the option
			option.active = false; // now it is needed to remove active status from all options when a option is selected
        });

		this.toggleDropdown(false); // close dropdown
		this.syncValidity();
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
		// do not open if disabled
		if (this.disabled) {
			return;
		}

		const query = this.inputEl.value.toLowerCase().trim();
		const options = Array.from(this.querySelectorAll('fc-option'));

		const match = options.some((option) => {
			const label = (option.getAttribute('label') || option.textContent || '').toLowerCase();
			return label.includes(query);
		});

		this.toggleDropdown(match);
	};

	// specif function for react to ensure <fc-combobox> value property will be correctly added to the <fc-option> that was added later
	private onSlotChange() {
		// if there is no value set internally, we don't need to sync anything
        if (!this._value) {
			return;
		}

        const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;
        let foundMatch = false;

        options.forEach((option) => {
            const selected = (option.value === this._value); // checks if the selected option is the current option

			option.selected = selected // if so, set the option as selected by calling set selected from child fc-option, if not, remove selected attribute(query === label)
			option.hidden = !selected // if so, show the option
			option.active = false; // now it is needed to remove active status from all options when a option is selected

            // if it is the selected one, update the visible Input Text to match this option's label
            // this fixes the issue where the input might hold a "stale" label or raw value
            if (selected) {
                this.inputEl.value = option.label;
                foundMatch = true;
            }
        });

        if (!foundMatch && this.inputEl.value === '') {
            this.inputEl.value = this._value;
        }

		this.syncValidity();
	};

	/* this is the function that runs whenever the press any keyboard key */

	private onKeyDown(e: KeyboardEvent) {
		// if <fc-combobox> is disabled, return
        if (this.disabled) {
			return;
		}

        const options = this.getVisibleOptions();
        
        // if there is no available <fc-option> return
        if (options.length === 0) {
			return;
		}

        if (e.key === 'ArrowDown') {
            e.preventDefault(); 
            this.toggleDropdown(true); 
            
            // if at end (length - 1), go to 0. else, go next
            const nextIndex = this.activeIndex >= options.length - 1 ? 0 : this.activeIndex + 1;
            this.setActiveOption(nextIndex, options);
        } 
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.toggleDropdown(true);

            // if at start (0) or no selection (-1), go to end. else, go prev
            const prevIndex = this.activeIndex <= 0 ? options.length - 1 : this.activeIndex - 1;
            this.setActiveOption(prevIndex, options);
        } 
        else if (e.key === 'Enter') {
            e.preventDefault(); 
            
            if (this.activeIndex > -1 && options[this.activeIndex]) {
                const target = options[this.activeIndex];
                this.selectOption(target);
            }
        } 
        else if (e.key === 'Escape') {
            e.preventDefault();
            this.toggleDropdown(false);
        }
        else if (e.key === 'Tab') {
            this.toggleDropdown(false);
        }
    }

	private onBlur() {
        this.setAttribute('touched', '');
    }

    private onInvalid(e: Event) {
        this.setAttribute('touched', '');
    }

    /* this is a helper to set the active option on onKeyDown method */
    private setActiveOption(index: number, visibleOptions: FcOption[]) {
        // Remove active from all
        this.querySelectorAll('fc-option').forEach(opt => (opt as FcOption).active = false);

        this.activeIndex = index;
        const target = visibleOptions[index];
        
        if (target) {
            target.active = true;
			this.inputEl.setAttribute('aria-activedescendant', target.id); // adding active descendant attribute for screen readers 
            target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			return;
        }

		// if no target, clear the attribute
        this.inputEl.removeAttribute('aria-activedescendant');
    }

    /* this is a helper to get all valid options on onKeyDown method */
    private getVisibleOptions(): FcOption[] {
        return Array.from(this.querySelectorAll('fc-option')).filter(
			opt => !(opt as FcOption).hidden && !(opt as FcOption).disabled) as FcOption[];
    }

    /* this is a helper to select the active option on onKeyDown method */
    private selectOption(option: FcOption) {
        const value = option.value;
        const label = option.label;

        this.inputEl.value = label;
        this._value = value;
        this.internals.setFormValue(value);

        const allOptions = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;
        allOptions.forEach((opt) => {
            const selected = (opt.value === value);
            opt.selected = selected;
            opt.hidden = !selected;
            opt.active = false; // clear active state on select
        });

        this.toggleDropdown(false);
		this.syncValidity();
        this.dispatchEvent(
            new CustomEvent('fc-change', {
                detail: { value, label },
                bubbles: true, composed: true,
            })
        );
    }

	private toggleDropdown(show: boolean) {
		if (!this.dropdownEl) {
			return;
		};

		if (this.disabled && show) { // prevents dropdown toggle if <fc-combobox> has 'disabled' attribute
			return;
		}

		const dropdown = this.dropdownEl;
		// if it should be open
		if (show) {

			/* calculates available space for dropdown */
			const spaceBelow = calculateBottomAvaliableSpace(this.inputEl);
			const spaceAbove = calculateTopAvaliableSpace(this.inputEl);
			console.log(spaceAbove, spaceBelow);
			dropdown.hidden = false;
			this.setAttribute('open', 'true');
			this.inputEl.setAttribute("aria-expanded", "true");

			/* if bottom space is not enought for dropdown size AND top space has more space, opens to top */
			const shouldOpenUp = (spaceBelow < dropdown.clientHeight) && (spaceAbove > spaceBelow);
			dropdown.classList.toggle('opens-up', shouldOpenUp);

			return;
		}

		this.dropdownEl.hidden = true;
		this.removeAttribute('open');
		this.inputEl.setAttribute("aria-expanded", "false");

		// reset active option and index when closing
        this.activeIndex = -1;
        this.querySelectorAll('fc-option').forEach(opt => (opt as FcOption).active = false);
		// remove the active option id from aria-activedescendant attribute
		this.inputEl.removeAttribute('aria-activedescendant');

	}

	private syncValidity() {
        if (!this.inputEl) {
			return;
		}

        /* first check required constraint */
		if (!this.inputEl.validity.valid) {
				this.internals.setValidity(
					this.inputEl.validity,
					this.inputEl.validationMessage,
					this.inputEl
				);
				return;
		}

        // if strict is true, and there is a value, that value MUST match one of the options
        if (this.strict && this._value) {
            const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;
			
            let match = false;
            
			options.forEach(option => {
				if (option.value === this._value) {
					match = true;
				}
			});

            if (!match) {
                this.internals.setValidity(
                    { customError: true },
                    "Please select a valid option from the list.",
                    this.inputEl
                );
                return;
            }
        }

        // custom validator function (user defined)
        if (this._validatorFunction) {
            const customErrorMessage = this._validatorFunction(this._value);
            if (customErrorMessage) {
                this.internals.setValidity(
                    { customError: true }, 
                    customErrorMessage, 
                    this.inputEl
                );
                return;
            }
        }

        // 4. Valid
        this.internals.setValidity({});
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