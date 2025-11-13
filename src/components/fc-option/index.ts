import { FcOption } from "./fc-option"; // import autoComplete Class

export { FcOption };

export const defineOption = () => {
    if (!customElements.get("fc-option")) { // prevent browser error if the user calls this function more than once
        customElements.define("fc-option", FcOption); // register the element on the browser to use as <fc-option> 
    }
    return FcOption; /* enable to make an instance of the component with 'const fc = new FCOption();' and send it to the
    html page with with document.appendChild(); */
}
