import { template } from './fc-input.template'; // importing the base html and css for the componnet
// v1.0.1


/* 

SET VALIDITY ON COMBOBOX --> REQUIRED AND/OR STRICT (MUST MATCH A OPTION)

types:
text
email
number
password
maybe telephone
file

date picker e color picker should be diff components

range (slide), radio, checkbox, also diff components

customize the design of each type of input
min and max setters for date and number types
minlenght and maxlength for email, text, password, telephone
show / hide password button (icon probably)


will make an Label element later on
and a Validate element that is responsible to receive a function that validates the input of any selected field and shows and error message
will make clearable option on any element
will make slots for icons on any element (prefix and sufix)


<fc-input id="user-email" type="email" required></fc-input>
<fc-error for="user-email"></fc-error>
fc error will check fc-input validity internals to see if it is valid

ARIA-LABELS AND ACESSIBILITY FOR FcInput

in the future add a validate setter to let the user sets a function that check if it is valid or not (maybe)
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

    /* this will store the <fc-input> value when calling the setter, for react compatibility */
    private _value: string = '';
	
    // this signals the browser this custom element (<fc-combobox>) should participate in forms, allowing its value to be submitted along with the form data.
	static formAssociated = true; 
    // this is an reference that provides methods and properties for custom elements to access form control features
	private internals: ElementInternals;
    // this sets a private property that is immutable, it shows what kind of input types the user can set
	private readonly ALLOWED_TYPES = ['text', 'email', 'number', 'password', 'file', 'url'];

    /* this is the class constructor, whenever you create a new element on js or at the dom, this will be called */
	constructor() {
		super(); // calls HTMLElement class constructor too, after that, runs the following code V
		const shadow = this.attachShadow({ mode: 'open' }); // creates a shadow DOM
		shadow.appendChild(
            template.content.cloneNode(true) // clone our html and css template and append it to the shadow DOM
        );
		
		this.internals = this.attachInternals(); 

        /* binding all functions (from listeners) to the current instance of this component */
		this.onInput = this.onInput.bind(this);
		this.onChange = this.onChange.bind(this);

        /* this is a listener to set 'touched' attribute to this element and to inputEl on blur, so the CSS invalid properties
        will start working*/
		this.onBlur = this.onBlur.bind(this);
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
        /* first of all, search for the elements inside the component and bind it to the respective property */
		this.inputEl = this.shadowRoot!.getElementById('fc-field') as HTMLInputElement;

        /* if the user did <fc-input type=""> and type is valid, set it on inputEl, else set as type="text" */
		if (this.hasAttribute('type')) { 
            const type = this.getAttribute('type')!

            if (this.ALLOWED_TYPES.includes(type)) {
                this.inputEl.type = type;
                return;
            } 
            this.inputEl.type = 'text';
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

		/* doing inital validating if the element starts with any 'value' */
		this.syncValidity();

		if (this.hasAttribute('name') && this.type !== 'file') {
			this.internals.setFormValue(this.value);
		}

        /*  adding event listeners to the child inputEl so we can emit CustomEvents*/
		this.inputEl.addEventListener('input', this.onInput);
		this.inputEl.addEventListener('change', this.onChange);

		this.inputEl.addEventListener('blur', this.onBlur);
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
		if (!this.inputEl) return;

		switch (name) {
			case 'placeholder': 
                this.inputEl.placeholder = newVal; 
                break;

			case 'type': 
                const type = this.getAttribute('type')!
                if (this.ALLOWED_TYPES.includes(type)) {
                    this.inputEl.type = type;
                    break;
                }
                this.inputEl.type = 'text';
                break;

			case 'value':
				if (this.type !== 'file' && this.inputEl.value !== newVal) {
					this.inputEl.value = newVal;
					this.internals.setFormValue(newVal);
					this.syncValidity();
				}
				break;

			case 'disabled':
				this.inputEl.disabled = this.hasAttribute('disabled');
				this.internals.ariaDisabled = this.hasAttribute('disabled') ? 'true' : 'false';
				break;

			case 'readonly': 
                this.inputEl.readOnly = this.hasAttribute('readonly'); 
                break;
            

			case 'required':
                this.inputEl.required = this.hasAttribute('required'); 
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

	private syncValidity() {
		if (!this.inputEl) {
            return;
        }

		// first check native inputEl validity
		if (this.inputEl.validity.valid) { // if is valid, <fc-input> is valid
			this.internals.setValidity({});
		} 
        else {
			this.internals.setValidity(
				this.inputEl.validity, 
				this.inputEl.validationMessage, 
				this.inputEl
		    );
		}

        // later here we can set custom validators to set <fc-input> validity directly (a second layer of validation)
	}

	/* the callbacks below are exclusive of when using this component as a form component, both are callbacks that
	runs whenever the user do some form actions */

	/* if there is a button type="reset" on the form, and the user clicks it, this function will be run */
	formResetCallback() {
		if (this.inputEl) {
            this.inputEl.value = '';
        }
		this.removeAttribute('touched'); // remove touched on reset
		this.internals.setFormValue('');
		this.syncValidity();
	}

	/* this runs whenever the user click on return on the page and them go back to the form page again,
	it also runs when the user click on the default browser autocomplete (we disabled it) */
	formStateRestoreCallback(state: string | File | FormData | null, _mode: 'restore' | 'autocomplete') {
		if (this.type === 'file') {
            return;
        }
		const restoredValue = state as string;
		if (restoredValue) {
			this.value = restoredValue;
			if (this.inputEl) {
                this.inputEl.value = restoredValue;
            }
			this.internals.setFormValue(restoredValue);
			this.syncValidity();
		}
	}

	/** helper functions for the eventListeners */

	private onInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;

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