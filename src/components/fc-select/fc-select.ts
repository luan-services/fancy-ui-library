// fc-select.ts
import { template } from './fc-select.template';
import { FcOption } from '../fc-option'; 
import { calculateBottomAvaliableSpace, calculateTopAvaliableSpace } from '../../utils/fc-elements.utils';
//v 1.0.0

export class FcSelect extends HTMLElement {
    
    static get observedAttributes() {
        return ['placeholder', 'name', 'value', 'disabled', 'required'];
    }

    private inputEl!: HTMLInputElement;
    private dropdownEl!: HTMLElement;
    
    static formAssociated = true; 
    private internals: ElementInternals;

    private _value: string = '';
    private activeIndex: number = -1;

    private searchBuffer: string = '';
    private searchTimeout: any = null;

    /* this will store user's custom validation function */
    private _validatorFunction: ((value: string) => string | null) | null = null;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true}); 
        shadow.appendChild(template.content.cloneNode(true)); 

        this.internals = this.attachInternals(); 

        this.inputEl = shadow.querySelector('.fc-input') as HTMLInputElement;
        this.dropdownEl = shadow.querySelector('.fc-options') as HTMLElement;

        const randomId = Math.random().toString(36).substring(2, 9);
        const inputId = `fc-input-${randomId}`;
        const dropdownId = `fc-options-${randomId}`;

        this.inputEl.id = inputId;
        this.dropdownEl.id = dropdownId;
        this.inputEl.setAttribute('aria-controls', dropdownId);

        this.onChange = this.onChange.bind(this);
        this.onOptionSelect = this.onOptionSelect.bind(this);
        this.onOutsideClick = this.onOutsideClick.bind(this);
        this.onFocusOut = this.onFocusOut.bind(this);
        this.onSlotChange = this.onSlotChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onInvalid = this.onInvalid.bind(this);
        
        this.onClick = this.onClick.bind(this);
    }

    public get validity() { return this.internals.validity; }
    public get validationMessage() { return this.internals.validationMessage; }
    public get willValidate() { return this.internals.willValidate; }
    public checkValidity() { return this.internals.checkValidity(); }
    public reportValidity() { return this.internals.reportValidity(); }

    public get placeholder() { return this.getAttribute("placeholder") ?? ""; }
    public set placeholder(val: string) { this.setAttribute("placeholder", val); }

    public get name() { return this.getAttribute('name') ?? ''; }
    public set name(val: string) { this.setAttribute('name', val); }

    public get disabled() { return this.hasAttribute('disabled'); }
    public set disabled(val: boolean) {
        if (val) {
            this.setAttribute('disabled', 'true');
            return;
        } 
        this.removeAttribute('disabled');
    }

    public get value() { return this._value; }
    public set value(newValue: string) {
        if (this._value === newValue) return;

        this._value = newValue;
        this.internals.setFormValue(newValue);

        if (!this.inputEl) return;
        this.syncValidity();
    }

    public get label() { return this.inputEl?.value ?? ''; }

    public get options() {
        const slot:HTMLSlotElement | null = this.shadowRoot!.querySelector('slot'); 
        const optionElements = slot!.assignedElements().filter((el) => el.tagName === 'FC-OPTION');
        return optionElements.map(opt => ({
            label: (opt as FcOption).label, 
            value: (opt as FcOption).value
        }));
    }
    
    public set options(data: { label: string, value: string, disabled?: boolean }[]) {
        const oldOptions = this.querySelectorAll('fc-option');
        oldOptions.forEach(opt => opt.remove());

        data.forEach((element) => {
            const optEl = document.createElement('fc-option');
            optEl.setAttribute('value', element.value);
            optEl.setAttribute('label', element.label); 
            optEl.textContent = element.label;
            if (element.disabled) optEl.setAttribute('disabled', '');
            this.appendChild(optEl);
        });
        this.syncValidity();
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
    
    connectedCallback() {
        this.internals.setFormValue(this.value); 

        if (this.hasAttribute('placeholder')) {
            this.inputEl.placeholder = this.getAttribute('placeholder')!;
        }

        if (this.hasAttribute('disabled')) {
            this.inputEl.disabled = true;
            this.internals.ariaDisabled = 'true';
        }
        
        if (this.hasAttribute('required')) {
            this.internals.ariaRequired = 'true';
            this.inputEl.required = true;
        }

        this.inputEl.addEventListener('click', this.onClick);
        
        
        this.inputEl.addEventListener('change', this.onChange);
        this.addEventListener('fc-option-select', this.onOptionSelect as EventListener);
        
        this.addEventListener('focusout', this.onFocusOut as EventListener);
        this.inputEl.addEventListener('blur', this.onBlur);
        this.addEventListener('invalid', this.onInvalid);

        const slot = this.shadowRoot!.querySelector('slot');
        slot?.addEventListener('slotchange', this.onSlotChange);

        this.inputEl.addEventListener('keydown', this.onKeyDown);

        this.syncValidity();
    }

    attributeChangedCallback(name: string, _old: string, newVal: string) {
        if (name === 'placeholder' && this.inputEl) {
            this.inputEl.placeholder = newVal;
        } 

        if (name === 'name') {
            this.internals.setFormValue(this.value);
        }

        if (name === 'value') {
            this.value = newVal; 
        }

        if (name === 'disabled' && this.inputEl) {
            const isDisabled = this.hasAttribute('disabled');
            this.inputEl.disabled = isDisabled; 
            this.internals.ariaDisabled = isDisabled ? 'true' : 'false';
            if (isDisabled) {
                this.hideDropdown();
            }
        }

        if (name === 'required' && this.inputEl) {
            const isRequired = this.hasAttribute('required');
            this.internals.ariaRequired = isRequired ? 'true' : 'false';
            this.inputEl.required = isRequired;
            this.syncValidity();
        }

    }
    
    disconnectedCallback() {
        document.removeEventListener('click', this.onOutsideClick);
    }

    formResetCallback() {
        this._value = '';
        if (this.inputEl) {
            this.inputEl.value = '';
        }

        this.internals.setFormValue('');
        const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;

        options.forEach(option => {
            option.selected = false;
        });
        
        this.hideDropdown();
        this.removeAttribute('touched'); 
        this.syncValidity();

        this.dispatchEvent(new CustomEvent('fc-reset', { 
            bubbles: true, 
            composed: true 
        }));
    }

    formStateRestoreCallback(state: string | File | FormData | null, mode: 'restore' | 'autocomplete') {
        const restoredValue = state as string;

        if (restoredValue) { 
            this._value = restoredValue;
            this.internals.setFormValue(restoredValue);

            const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;
            let foundMatch = false;

            options.forEach((option) => {
                const selected = (option.value === this._value); 
                option.selected = selected 
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
    }


    private onClick(e: MouseEvent) {
        if (this.disabled) {
            return;
        }
        
        if (this.dropdownEl.hidden) {
            this.showDropdown();
        } else {
            this.hideDropdown();
        }
    }
    
    private onChange(e: Event) {
        e.stopPropagation(); 
        this.dispatchEvent(new CustomEvent('fc-change', { 
            detail: { 
                value: this._value, 
                label: this.inputEl.value
            },
            bubbles: true, 
            composed: true 
        }));
    }

    private onOptionSelect(e: CustomEvent) {
        const { value, label } = e.detail; 

        if (this.disabled) {
            return;
        }

        this.inputEl.value = label; 
        this._value = value; 
        this.internals.setFormValue(value); 

        const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;

        options.forEach((option) => {
            const selected = (option.value === value); 
            option.selected = selected 
            option.active = false; 
        });

        this.hideDropdown(); 
        this.syncValidity();

        this.dispatchEvent(
            new CustomEvent('fc-change', {
                detail: { value, label },
                bubbles: true,
                composed: true,
            })
        );
    }

    private onOutsideClick(e: MouseEvent) { 
        if (!this.contains(e.target as Node)) {
            this.hideDropdown();
        }
    }

    private onFocusOut(e: FocusEvent) { 
		const target = e.relatedTarget as Node;

		if (!target || !this.contains(target)) {
			this.hideDropdown();
		}
    };

    private onSlotChange() {
        if (!this._value) return;

        const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;
        let foundMatch = false;

        options.forEach((option) => {
            const selected = (option.value === this._value); 
            option.selected = selected;
            
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

    private onKeyDown(e: KeyboardEvent) {
        
        if (this.disabled) {
            return;
        }

        const options = this.getVisibleOptions();
        if (options.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault(); 
            // If closed, open it on Arrow Down
            if (this.dropdownEl.hidden) {
                this.showDropdown();
                return;
            }
            
            const nextIndex = this.activeIndex >= options.length - 1 ? 0 : this.activeIndex + 1;
            this.setActiveOption(nextIndex, options);
        } 
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            
            if (this.dropdownEl.hidden) {
                this.showDropdown();
                return;
            }

            const prevIndex = this.activeIndex <= 0 ? options.length - 1 : this.activeIndex - 1;
            this.setActiveOption(prevIndex, options);
        } 
        else if (e.key === 'Enter' || e.key === ' ') {
            
            e.preventDefault(); 

            if (this.dropdownEl.hidden) {
                this.showDropdown();
            } else {
                if (this.activeIndex > -1 && options[this.activeIndex]) {
                    const target = options[this.activeIndex];
                    this.selectOption(target);
                } else {
                    this.hideDropdown();
                }
            }
        } 
        else if (e.key === 'Escape') {
            e.preventDefault();
            this.hideDropdown();
        }
        else if (e.key === 'Tab') {
            this.hideDropdown();
        }

        // type-ahead Logic
        else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            this.handleTypeAhead(e.key);
        }
    }

    private handleTypeAhead(char: string) {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);

        this.searchBuffer += char.toLowerCase();

        this.searchTimeout = setTimeout(() => {
            this.searchBuffer = '';
        }, 500);

        const options = this.getVisibleOptions();
        
        const matchIndex = options.findIndex(opt => {
            const label = (opt.getAttribute('label') || opt.textContent || '').toLowerCase();
            return label.startsWith(this.searchBuffer);
        });

        if (matchIndex !== -1) {
            const match = options[matchIndex];
            
            if (!this.dropdownEl.hidden) {
                this.setActiveOption(matchIndex, options);
            } else {
                
                this.selectOption(match);
            }
        }
    }

    private onBlur() {
        this.setAttribute('touched', '');
    }

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

    private setActiveOption(index: number, visibleOptions: FcOption[]) {
        this.querySelectorAll('fc-option').forEach(opt => (opt as FcOption).active = false);

        this.activeIndex = index;
        const target = visibleOptions[index];
        
        if (target) {
            target.active = true;
            this.inputEl.setAttribute('aria-activedescendant', target.id); 
            target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            return;
        }
        this.inputEl.removeAttribute('aria-activedescendant');
    }

    private getVisibleOptions(): FcOption[] {
        
        return Array.from(this.querySelectorAll('fc-option')).filter(
            opt => !(opt as FcOption).disabled) as FcOption[];
    }

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
            opt.active = false;
        });

        this.hideDropdown();
        this.syncValidity();
        this.dispatchEvent(
            new CustomEvent('fc-change', {
                detail: { value, label },
                bubbles: true, composed: true,
            })
        );
    }

    private showDropdown() {
		if (!this.dropdownEl || this.disabled) {
			return;
		};

		const dropdown = this.dropdownEl;

		/*custom event dispatch when dropdown is open (for developer experience) */
		const showEvent = new CustomEvent('fc-show', {
			bubbles: true,
			composed: true,
			cancelable: true // allows user to call e.preventDefault() to stop opening
		});
		
		this.dispatchEvent(showEvent);

		/* let's user cancel the drodpown opening by cancelling the event */
		if (showEvent.defaultPrevented) {
			return;
		}

		/* calculates available space for dropdown */
		const spaceBelow = calculateBottomAvaliableSpace(this.inputEl);
		const spaceAbove = calculateTopAvaliableSpace(this.inputEl);
		dropdown.hidden = false;
		this.setAttribute('open', 'true');
		this.inputEl.setAttribute("aria-expanded", "true");

		/* if bottom space is not enought for dropdown size AND top space has more space, opens to top */
		const shouldOpenUp = (spaceBelow < dropdown.clientHeight) && (spaceAbove > spaceBelow);
		dropdown.classList.toggle('opens-up', shouldOpenUp);

        // Scroll to currently selected option
        const options = this.getVisibleOptions();
        const selectedIndex = options.findIndex(opt => opt.value === this._value);
        
        if (selectedIndex >= 0) {
            this.setActiveOption(selectedIndex, options);
        } else {
            this.activeIndex = -1; // Reset if no selection
        }

		/* this listener is for when the user clicks outside the input so the dropdown can close this is a DOM event 
		listener, so it must be cleaned onDisconnectCallback (when the element is removed from the dom) to prevent memory leak */
		setTimeout(() => {
			document.addEventListener('click', this.onOutsideClick);
		}, 0);

		return;

	}

	private hideDropdown() {
		if (!this.dropdownEl) {
			return;
		};

		/* dispatch dropdown close event if it was actually open (for developer experience) */
		if (!this.dropdownEl.hidden) {
			this.dispatchEvent(new CustomEvent('fc-hide', {
				bubbles: true,
				composed: true
			}));
		}

		/* remove listener on close */
		document.removeEventListener('click', this.onOutsideClick);

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

        // first check native inputEl validity, if invalid, set the error and return
        if (!this.inputEl.validity.valid) {
                this.internals.setValidity(
                    this.inputEl.validity,
                    this.inputEl.validationMessage,
                    this.inputEl
                );
                return;
        }

        const options = this.querySelectorAll('fc-option') as NodeListOf<FcOption>;
        let match = false;

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

        // valid
        this.internals.setValidity({});
    }
    
    public setProps(props: Record<string, any>) { 
        for (const property in props) { 
            const value = props[property] 
            if (property in this) {
                (this as any)[property] = value;
                continue; 
            }
            if (['string', 'number', 'boolean'].includes(typeof value)) {
                this.setAttribute(property, String(value)); 
            }
        }
    }
}