import { template } from './fc-error.template';
// v 1.0.0

export class FcError extends HTMLElement {
    // only observed attribute is for, which will be used to get the target inputEl
    static get observedAttributes() { 
        return ['for'];
    }

    /* this is the inner text div on <fc-error> */
    private errorTextEl!: HTMLElement;

    /* targetEl is the <fc-input> target element, it is NOT an HTMLInputElement, but since it has validity() it behaves as one,
    so it is better here to type cast it as HTMLInputElement to guarantee TypeScript won't complain when calling its validity 
    functions */
    private targetEl: HTMLInputElement | null = null;

    constructor() {
        super(); // calls HTMLElement class constructor too, after that, runs the following code V
        const shadow = this.attachShadow({ mode: 'open' }); // creates a shadow DOM
        shadow.appendChild(
            template.content.cloneNode(true) // clone our html and css template and append it to the shadow DOM
        );
        
        /* search for the error div inside the shadow dom and bind it to the private attribute, it could be set on connectedCallback, but it 
        is better here (might need to change fc-input and fc-combobox) */
        this.errorTextEl = shadow.querySelector('.fc-error-text') as HTMLElement;
        
        /* binding function to its context */
        this.handleErrorState = this.handleErrorState.bind(this);
    }

    /* this is the function that will be called when the element is inserted in the DOM */

    connectedCallback() { // on connect, try to search up for a target input
        this.findTarget();
    }

    /* this is the cleaning up function, it'll be called when the element is REMOVED from the DOM, here, we want
	to clean (remove) any event listener that is binded to the DOM. */

    disconnectedCallback() {
        this.cleanup(); // cleanup all listeners and data related to a target element
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) { 
        if (name === 'for' && oldVal !== newVal) { // when for="" property is set, tries to find a target.
            this.findTarget();
        }
    }

    /* function called on blur, invalid and input listeners trigger */

    private handleErrorState() {
        if (!this.targetEl) { // if there is no target, return
            return;
        }

        // check if the target element is touched and valid
        const isTouched = this.targetEl.hasAttribute('touched');
        const isValid = this.targetEl.validity.valid;

        // shows error ONLY if it is invalid AND (touched or submitted)
        if (!isValid && isTouched) {
            this.removeAttribute('hidden'); // turn <fc-error> visible
            this.errorTextEl.textContent = this.targetEl.validationMessage; // sets the target validity error messages as the inner text of <fc-input>
            return;
        } 
        this.setAttribute('hidden', '');
    }

    /* helper functions */

    private findTarget() {
        this.cleanup(); // before finding a new target, cleans old one if exist

        const targetId = this.getAttribute('for'); // looks for target Id
        if (!targetId) {
            return;
        }

        const target = document.getElementById(targetId) as HTMLInputElement;

        if (target) { // if there is a target element, bind it to the private attribute and bind the listeners
            this.targetEl = target;
            this.bindListeners();
        }
    }

    private bindListeners() {
        if (!this.targetEl) { // if there is no target element, return.
            return;
        }

        /* BLUR: the user left the field. check if it should show error. */
        this.targetEl.addEventListener('blur', this.handleErrorState);

        /* INVALID: the form was submitted (or checkValidity called), this forces the error to show even if the user never touched it. */
        this.targetEl.addEventListener('invalid', this.handleErrorState);

        /* INPUT: the user is typing, this is only needed to HIDE the error if the user fix it. there is no need to check 
        "touched" here, because if the error is currently visible, they effectively "touched" it already. */
        this.targetEl.addEventListener('fc-input', this.handleErrorState);

        /* CHANGE: value effectively changed */
        this.targetEl.addEventListener('fc-change', this.handleErrorState);

        /* RESET: listen to the element custom reset event that launches when a reset button is clicked */
        this.targetEl.addEventListener('fc-reset', this.handleErrorState);
    }

    /* this is the cleanup helper function to remove all listeners and remove the target Element from the private attribute */

    private cleanup() {
        if (this.targetEl) {
            this.targetEl.removeEventListener('blur', this.handleErrorState);
            this.targetEl.removeEventListener('invalid', this.handleErrorState);
            this.targetEl.removeEventListener('fc-input', this.handleErrorState);
            this.targetEl.removeEventListener('fc-change', this.handleErrorState);
            this.targetEl.removeEventListener('fc-reset', this.handleErrorState);
            this.targetEl = null;
        }
    }

}