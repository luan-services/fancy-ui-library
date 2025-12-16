import { template } from './fc-label.template';
// v1.0.0

export class FcLabel extends HTMLElement {
    /* about the 'for' attribute: we want to mimic the native <label> element: on plain html, using for="" and setting the label is fine,
    but in react we use htmlFor="", this is also fine because using htmlFor="" in react automatically translate into for="" */
    static get observedAttributes() {
        return ['for'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        /* bind the click handler to this instance */
        this.onClick = this.onClick.bind(this);
    }

    connectedCallback() {
        /* adding a click listener to focus the label target element */
        this.addEventListener('click', this.onClick); 
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
    }

    attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
        /* there is no need for any specific logic here
            'for' is read dynamically on click. */
    }

    /* properties (getters and setters) for the attributes */

    /* we use set/get htmlFor instead of 'for' because 'for' is a reserved keyword (used for loops), we can't set it */

    public get htmlFor() {
        return this.getAttribute('for') ?? '';
    }

    public set htmlFor(val: string) {
        this.setAttribute('for', val);
    }

    /* functions that run by eventListeners */

    private onClick(e: MouseEvent) {
        // prevent default double-action if the label wraps the input (rare in web components but possible)
        e.preventDefault();

        const targetId = this.getAttribute('for');
        
        if (!targetId) {
            return;
        }

        const targetEl = document.getElementById(targetId);

        if (targetEl) {
            // this works for native inputs and elements with delegatesFocus: true
            targetEl.focus(); 
            
            // to trigger a specific click behavior on non-focusable elements
            targetEl.click(); 
        }
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