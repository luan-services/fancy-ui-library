import { template } from './fc-input.template'; // importing the base html and css for the componnet
// v1.0.3

/* avaliable types on <fc-input>:
text email number password file 

available properties:
'min' 'max' 'step': only for type = number
'minlength' 'maxlength' 'pattern' for any type (expect file)

about validity

validity is sync on every input, when the user enters the field, currently validity only works for commom attribute constraints and it
syncs with form internals, later on, i'll add a custom validity setter.

validation alone does not trigger visual effects, it also relies on the 'touched' attribute, 'touched' is set on the first blur / 
on submit (whenever checkValidity() is called) thanks to onInvalid().

i.e: validation occurs always, visual effects only after first blur / submit. this is the same for fc-error text, it only shows up after
the 'touched' is set on the target element

there is also a custom setter (validate) to set a function that validates the input: user must send a function, when they return
a string (the error message) it is an error, if they return 'null', the input is valid

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

/*
    _value (value setter and getter) here is the only attribute that is controled, which means it is different from other attributes,
    it is designed to let the FcInput to be 'controlled' on react. In react, on a commom component, like input, when you do:
    <input value={state} onChange={...} />

    it is not actually setting an attribute 'value', react will CALL input.value setter, that's how react do it with the @lit library,
    it won't ever set any attribute, it just call the setter. It might make a loop if they pass an useState to the value property on react

    so, you can do:

    <FcInput value={useState} onFcChange={(e)=>{}}/>

    the briliant part: some setters, like set placeholder, actually creates an attribute with the name passed, so even on react if you do 
    placeholder="a", it will do fc-combobox.placeholder = 'a'. and the internal logic will correctly add a placeholder attribute.
    these are called reflecting properties, they sinchronize attributes.

    'value' is a non-reflecting property, its setter does not create a 'value' attribute. It is set this way so it won't create a loop 
    when using it on react.

    on the other hand, on vanilla, any attribute added, by doing <fc-combobox placeholder="a"/> will be an set as an actual attribute,
    and if it is an observed attribute, attributeChangecallback will be called, and it might do something

*/
export class FcInput extends HTMLElement {
	
    /* this is a static method that tells the browser which atributes should be 'watched', that means whenever any
    attributes are set by the user like <fc-input name="a">, 'attributeChangedCallback' will be called. */
	static get observedAttributes() {
		return [
            'value', 'placeholder', 'disabled', 'name', 'type', 'required', 'readonly', 'min', 'max', 'step', 
            'minlength', 'maxlength', 'pattern'
		];
	}

    /* these is a declared attribute, that will store a reference to the input element inside the shadow
    DOM, so we can edit it later
	*/
	private inputEl!: HTMLInputElement;

    /* these are references to the password toggle button and their icons, only available on type="password" */
    private passwordBtnEl!: HTMLButtonElement;
	private fcPassEnableIcon!: SVGElement;
	private fcPassDisableIcon!: SVGElement;

    /* this will store the <fc-input> value when calling the setter, for react compatibility */
    private _value: string = '';
    
    /* this will store user's custom validation function for <fc-input> (if exists) 
    validatorFunction should have a logic that either returns a string (the error message) or null, if it returns null after
    calculations, the input passed user's validation, if returns a string, it is an error.
    */
    private _validatorFunction: ((value: string) => string | null) | null = null;
	
    // this signals the browser this custom element (<fc-combobox>) should participate in forms, allowing its value to be submitted along with the form data.
	static formAssociated = true; 
    // this is an reference that provides methods and properties for custom elements to access form control features
	private internals: ElementInternals;
    // this sets a private property that is immutable, it shows what kind of input types the user can set
	private readonly ALLOWED_TYPES = ['text', 'email', 'number', 'password', 'file', 'url'];

    /* this is the class constructor, whenever you create a new element on js or at the dom, this will be called */
	constructor() {
		super(); // calls HTMLElement class constructor too, after that, runs the following code V
		const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true }); // creates a shadow DOM, delegate focus guarantee focus will be passed to inner inputEl and aria labels will work
		shadow.appendChild(
            template.content.cloneNode(true) // clone our html and css template and append it to the shadow DOM
        );		

		this.internals = this.attachInternals(); 

        /* first of all, search for the elements inside the component and bind it to the respective property */
		this.inputEl = this.shadowRoot!.querySelector('.fc-input-field') as HTMLInputElement;
        this.passwordBtnEl = this.shadowRoot!.querySelector('.fc-password-toggle') as HTMLButtonElement;
		this.fcPassEnableIcon = this.shadowRoot!.querySelector('.icon-eye') as SVGElement;
		this.fcPassDisableIcon = this.shadowRoot!.querySelector('.icon-eye-off') as SVGElement;
        
		/* assigning random ids to the elements to prevent bugs if there is one or more ID */

        const randomId = Math.random().toString(36).substring(2, 9);

		const inputId = `fc-input-${randomId}`;
		const passwordBtnId = `fc-pass-btn-${randomId}`;

		this.inputEl.id = inputId;
		this.passwordBtnEl.id = passwordBtnId;
        this.passwordBtnEl.setAttribute('aria-controls', inputId);

        /* binding all functions (from listeners) to the current instance of this component */
		this.onInput = this.onInput.bind(this);
		this.onChange = this.onChange.bind(this);

        /* this bind the onBlur function to this context, it is used to set 'touched' attribute to this element and to inputEl 
        on blur, so the CSS invalid properties will start working*/
		this.onBlur = this.onBlur.bind(this);

        /* this bind the onTogglePassword function to this context, it is used to toggle the password icon */
		this.onTogglePassword = this.onTogglePassword.bind(this);

        /* this binds the onOnvalid function to this context */
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
			const component = _select the component here_ -> component.value = 'something'
		or
			<fc-option value="somethin">text_label</fc-option>

        how it works:

        <fc-input placeholder="a"> -> connectCallback(inner_func_will: set placeholder as the inputEl placeholder) -> 
        attributeChangecallback(inner_func_will: tries the same)

        <fc-input> -> connectCallback(inner_func_will: do nothing because element were already initializated) ->  
        fc-input.placeholder = "a" -> setter will be called -> 
        setter(inner_func_will: this.setAttribute('placeholder', val)) (will do <fc-input placeholder="a">) -> 
        attributeChangecallback(inner_func_will: set placeholder as the inputEl placeholder)

        attributechangeCallback is always called when an atribute ('placeholder') is an observed attribute.

		NOTE: that some getters and setters here are not for attributes, for example: value here just update the inner
        value attribute of inner InputEl, it is used for react to make the input a 'controlled' element.

		the actual rule is: every attribute of <fc-input> should have a getter and setter, but not all getters and setters
		are used to manipulate <fc-input> attributes.
	*/

	public get value() { // returns the private _value attribute, just like optionValue on <fc-combobox>
        return this._value;
    }

	public set value(val: string) { 
		if (this.type === 'file') { // before setting a initial value, checks if it is a file type input
            return; 
        }

		if (this.inputEl) { // if inputEl doesn't exist yet, value will be stored on the private _value attribute, for react compatibility 
			this.inputEl.value = val; // if not, update inner inputEl value
			this.syncValidity(); // and also validate and synchrozine it
		}

		this._value = val; // sets private _value attribute, just like optionValue on <fc-combobox>
		this.internals.setFormValue(val); // also updates formValue so forms can check <fc-input> value
	}

	public get files(): FileList | null { // function to files if the input has any attached
        return this.inputEl?.files ?? null; 
    }

	public get placeholder() { 
        return this.getAttribute('placeholder') ?? ''; 
    
    }

	public set placeholder(val: string) { 
        this.setAttribute('placeholder', val); 
    }

	public get type() { 
        return this.getAttribute('type') ?? 'text'; 
    }

	public set type(val: string) {
		if (this.ALLOWED_TYPES.includes(val)) {
            this.setAttribute('type', val);
            return;
        }
        // if the type set by the user is not allowed when calling set type, fall back to 'text'
        this.setAttribute('type', 'text');
	}

    /*name is used to define the element as part of a form if wanted to, calling its setters will create an attribute 
    on the main component */
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

    /* getters and setters for user's the validator function */

    public get validator() {
        return this._validatorFunction;
    }

    public set validator(func: ((value: string) => string | null) | null) {
        this._validatorFunction = func;
        
        // re-validate immediately when the logic changes, if the field is already filled, this will show/hide errors instantly.
        this.syncValidity();
    }

	/* the getters and setters bellow are used to define validator attributes on <fc-input> that will be later 
    reflect on the child inputEl */

	public get min() {
        return this.getAttribute('min') ?? '';
    }

	public set min(val: string) {
        this.setAttribute('min', val);
    }


	public get max() {
        return this.getAttribute('max') ?? '';
    }

	public set max(val: string) {
        this.setAttribute('max', val);
    }


	public get step() {
        return this.getAttribute('step') ?? '';
    }

	public set step(val: string) {
        this.setAttribute('step', val);
    }


	public get minLength() {
        return Number(this.getAttribute('minlength')) || -1;
    }

	public set minLength(val: number) {
        this.setAttribute('minlength', String(val));
    }


	public get maxLength() {
        return Number(this.getAttribute('maxlength')) || -1;
    }

	public set maxLength(val: number) {
        this.setAttribute('maxlength', String(val));
    }


	public get pattern() {
        return this.getAttribute('pattern') ?? '';
    }

	public set pattern(val: string) {
        this.setAttribute('pattern', val);
    }

	/* this is the function that will be called when the element is inserted in the DOM */

	connectedCallback() {

		/* this component is considered a form part, it'll set this components '_value' as a formValue, so on the form you will see 
		a field {name: 'fc-combobox name property', value: "fc-combobox value property"} if 'name' property is not set, browser is 
		smart enought and won't set the  form field if it is the case  it will still have a formValue for the formRestore and formReset 
		callbacks to work tho */
		if (this.type !== 'file') { // if it has file type it shouldn't have a form value
			this.internals.setFormValue(this._value);
		}

        /* if the user did <fc-input type=""> and type is valid, set it on inputEl, else set as type="text" */
		if (this.hasAttribute('type')) { 
            const type = this.getAttribute('type')!
            this.ALLOWED_TYPES.includes(type) ? this.inputEl.type = type : this.inputEl.type = 'text';
            if (this.passwordBtnEl) { // NEW
                if (type === 'password') {
                    this.passwordBtnEl.hidden = false;
                    // Reset to 'password' state (hidden characters) whenever type attribute changes back to password
                    this.updateToggleIcon(false);
                } else {
                    this.passwordBtnEl.hidden = true;
                }
            }
        }

		/* sync native inputEl boolean attributes */

		if (this.hasAttribute('disabled')) {
			this.inputEl.disabled = true;
			this.internals.ariaDisabled = 'true';
		}

		if (this.hasAttribute('readonly')) {
            this.inputEl.readOnly = true;
        }

		if (this.hasAttribute('required')) {
            this.inputEl.required = true;
        }

		/* sync native inputEl attributes */

		if (this.hasAttribute('placeholder')) {
            this.inputEl.placeholder = this.getAttribute('placeholder')!;
        }

		if (this.hasAttribute('min')) {
            this.inputEl.min = this.getAttribute('min')!;
        }

		if (this.hasAttribute('max')) {
            this.inputEl.max = this.getAttribute('max')!;
        }

		if (this.hasAttribute('step')) {
            this.inputEl.step = this.getAttribute('step')!;
        }

		if (this.hasAttribute('pattern')) {
            this.inputEl.pattern = this.getAttribute('pattern')!;
        }

		if (this.hasAttribute('minlength')) {
            this.inputEl.minLength = Number(this.getAttribute('minlength'));
        }

		if (this.hasAttribute('maxlength')) {
            this.inputEl.maxLength = Number(this.getAttribute('maxlength'));
        }

		/* this one syncs _value with inputEl value attribute, this is needed because react NEVER sets actual attributes,
        it always calls the setters, and calling set value won't actually set a value attribute (like the others) 
        (this is needed because setting an actual attribute will cause a loop on react because of how it handles the value attribute)

        so it is no use to do "if (this.hasAttribute('value'))" this will never run in react
        
        so the only way to guarantee that when you do <FcInput value="a"> on react you'll be passing "a" to the inner component,
        is storing "a" in _value, and waiting for the element to load, calling connectioncallback and setting it here
        */

		if (this.type !== 'file') {
			this.inputEl.value = this._value;
		}

        /*  adding event listeners to the child inputEl so we can emit CustomEvents */
		this.inputEl.addEventListener('input', this.onInput);
		this.inputEl.addEventListener('change', this.onChange);

		this.inputEl.addEventListener('blur', this.onBlur);

        /*  adding click event listener to the password button, so it can run this function on click */
		this.passwordBtnEl.addEventListener('click', this.onTogglePassword);

        /* this listener fires when a form wrapped around this input is submited (anytime checkValidity() is called) */
        this.addEventListener('invalid', this.onInvalid);
        
        /* doing inital validating if the element starts with any 'value' */
		this.syncValidity();
	}

	/* this is the cleaning up function, it'll be called when the element is REMOVED from the DOM, here, we want
	to clean (remove) any event listener that is binded to the DOM. */

	disconnectedCallback() {
		if (this.inputEl) { // not needed but it is a good practice to clean element binded listeners
			this.inputEl.removeEventListener('input', this.onInput);
			this.inputEl.removeEventListener('change', this.onChange);
			this.inputEl.removeEventListener('blur', this.onBlur);
		}
	}

    /* this is the function that runs whenever an observed attribute is changed (via JS), note: this is called 
	by the browser itself, so you need to accept all these three props even if you will not be using it */

	attributeChangedCallback(name: string, _oldVal: string, newVal: string) {

        /* 'value' is a special attribute that is design to be CONTROLED on react, so it must set a private field, that means
        it can't depend if inputEl already exists, so it will be threated here outside the switch case */

        if (name === 'value' && !(this.type === 'file')) {
            // This calls the setter, which updates _value, if (fc-input) didnt load, it just updates memory, if so are connected, it updates the UI too.

            if (this.inputEl) { // if inputEl doesn't exist yet, value will be stored on the private _value attribute, for react compatibility 
                this.inputEl.value = newVal; // if not, update inner inputEl value
                this.syncValidity(); // and also validate and synchrozine it
            }

            this._value = newVal; // sets private _value attribute, just like optionValue on <fc-combobox>
            this.internals.setFormValue(newVal); // also updates formValue so forms can check <fc-input> value
            return;
        }

        /* we can check if inputEl exists here because very attribute below will be set directly on it */

		if (!this.inputEl) {
            return;
        }

		switch (name) {
			case 'placeholder': 
                this.inputEl.placeholder = newVal; 
                break;

			case 'type': 
                const type = this.getAttribute('type')!
                this.ALLOWED_TYPES.includes(type) ? this.inputEl.type = type : this.inputEl.type = 'text';
                if (this.passwordBtnEl) {
                    if (type === 'password') {
                        this.passwordBtnEl.hidden = false;
                        // Reset to 'password' state (hidden characters) whenever type attribute changes back to password
                        this.updateToggleIcon(false);
                    } else {
                        this.passwordBtnEl.hidden = true;
                    }
                }
                
                break;

			case 'disabled':
				this.inputEl.disabled = this.hasAttribute('disabled');
				this.internals.ariaDisabled = this.hasAttribute('disabled') ? 'true' : 'false'; // also update internals aria-disabled value
				break;

			case 'readonly': 
                this.inputEl.readOnly = this.hasAttribute('readonly'); 
                break;
            

			case 'required':
                this.inputEl.required = this.hasAttribute('required'); 
                this.internals.ariaRequired = this.hasAttribute('required') ? 'true' : 'false' // also update internals aria-requierd value
                this.syncValidity();
                break;

			case 'name':
                this.internals.setFormValue(this.value);
                break;
			
			case 'min': 
                this.inputEl.min = newVal; 
                this.syncValidity(); 
                break;

			case 'max': 
                this.inputEl.max = newVal; 
                this.syncValidity(); 
                break;

			case 'step': 
                this.inputEl.step = newVal; 
                this.syncValidity(); 
                break;

			case 'minlength': 
                this.inputEl.minLength = Number(newVal); 
                this.syncValidity(); 
                break;

			case 'maxlength': 
                this.inputEl.maxLength = Number(newVal); 
                this.syncValidity(); 
                break;

			case 'pattern': 
                this.inputEl.pattern = newVal; 
                this.syncValidity(); 
                break;
		}
	}

	/* the callbacks below are exclusive of when using this component as a form component, both are callbacks that
	runs whenever the user do some form actions */

	/* if there is a button type="reset" on the form, and the user clicks it, this function will be run */
	formResetCallback() {

		if (this.inputEl) { // if inputEl doesn't exist yet, value will be stored on the private _value attribute, for react compatibility 
			this.inputEl.value = ''; // if not, update inner inputEl value
		}

		this._value = ''; // sets private _value attribute, just like optionValue on <fc-combobox>
		this.internals.setFormValue('');
		this.syncValidity();
		this.removeAttribute('touched'); // remove touched on reset

        /* dispatch an fc-reset event to let fc-error knows when the element status has been reseted by a form button */
        this.dispatchEvent(new CustomEvent('fc-reset', { 
            bubbles: true, 
            composed: true 
        }));
	}

	/* this runs whenever the user click on return on the page and them go back to the form page again,
	it also runs when the user click on the default browser autocomplete (we disabled it) */
	formStateRestoreCallback(state: string | File | FormData | null, _mode: 'restore' | 'autocomplete') {
		if (this.type === 'file') {
            return;
        }
		const restoredValue = state as string;
		if (restoredValue) {
			if (this.type === 'file') { // before setting a initial value, checks if it is a file type input
                return; 
            }

            if (this.inputEl) { // if inputEl doesn't exist yet, value will be stored on the private _value attribute, for react compatibility 
                this.inputEl.value = restoredValue; // if not, update inner inputEl value
                this.syncValidity(); // and also validate and synchrozine it
            }

            this._value = restoredValue; // sets private _value attribute, just like optionValue on <fc-combobox>
            this.internals.setFormValue(restoredValue); // also updates formValue so forms can check <fc-input> value
		}
	}

	/** functions that run by eventListeners */

	private onInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;

        // direectly update _value here to avoid loop reusing value setter
        this._value = value;

		if (this.type !== 'file') {  // update only form value if it is a file type input
            this.internals.setFormValue(value);
        }

		this.syncValidity();
		this.dispatchEvent(new CustomEvent('fc-input', { 
            detail: { 
                value: value 
            }, 
            bubbles: true, 
            composed: true 
        }));
	}

	private onChange(e: Event) {
		const target = e.target as HTMLInputElement;

        // direectly update _value here to avoid loop reusing value setter
        this._value = target.value;
		this.internals.setFormValue(target.value);
		this.syncValidity();
		this.dispatchEvent(new CustomEvent('fc-change', { 
            detail: { 
                value: target.value, 
                files: target.files 
            },
            bubbles: true, 
            composed: true 
        }));
	}

	private onBlur() {
		// mark as touched when leaving the input
		this.setAttribute('touched', '');
	}

    /* runs whenever a form wrapped around <fc-input> is submitted, this is used to guarantee the errors will pop up if the user
    don't blur the input field and click directly on submit (or hit enter) */
    private onInvalid(e: Event) {
        this.setAttribute('touched', '');

		/* when onInvalid runs it is because internal input launched an invalid event. this event dies on the component, it is a formInternals
		event that is launched by the BROWSER and it does not bubble up, parents components like a form, cannot hear it
		we are re-dispatching an fc-invalid event so the user can listen to invalid events not just on <fc-combobox> but on any element 
		wrapping it */
		this.dispatchEvent(new CustomEvent('fc-invalid', {
			bubbles: true,  
			composed: true, 
			detail: { originalEvent: e }
		}));
    }

    private onTogglePassword(e: MouseEvent) {
		e.preventDefault(); // prevent focus loss or form submit
        
		// if current inner state is password, switch to text (show)
		if (this.inputEl.type === 'password') {
			this.inputEl.type = 'text';
			this.updateToggleIcon(true);
            this.passwordBtnEl.setAttribute('aria-pressed', 'true');
            this.inputEl.focus();
            return;
		} 
        
        // if it is text, hide (prevent other types to show/hide)
        if (this.inputEl.type === 'text') {
			this.inputEl.type = 'password';
			this.updateToggleIcon(false);
            this.passwordBtnEl.setAttribute('aria-pressed', 'false');
            this.inputEl.focus();
		}

	}

    /* helper functions */

	private updateToggleIcon(isVisible: boolean) {
		if (isVisible) {
            this.fcPassEnableIcon.setAttribute('hidden', 'true');
			this.fcPassDisableIcon.removeAttribute('hidden');
            return;
		}
        this.fcPassEnableIcon.removeAttribute('hidden');
        this.fcPassDisableIcon.setAttribute('hidden', 'true');
	}

	private syncValidity() {
		if (!this.inputEl) {
            return;
        }

        // first check native inputEl validity, if invalid, set the error and return
        if (!this.inputEl.validity.valid) {
            this.internals.setValidity(
                this.inputEl.validity,
                this.inputEl.validationMessage,
                this.inputEl
            );
            return;
        }

        // here is a second layer of validation, it validates based on user's function
        if (this._validatorFunction) {
            // run the user's function passing the current value, if it is null, the form is valid, if it is a string, form is invalid
            const customErrorMessage = this._validatorFunction(this.value);

            // if the function returns a string, set the erorr
            if (customErrorMessage) {
                this.internals.setValidity(
                    { customError: true }, // mark as custom error
                    customErrorMessage,    // set the message returned by the function
                    this.inputEl           // bind the target element
                );
                return;
            }
        }
    
        // if both layers passed, it is a valid input:
        this.internals.setValidity({});
        return;
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