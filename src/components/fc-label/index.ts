import { FcLabel } from "./fc-label";

export { FcLabel };

export const defineLabel = () => {
    if (!customElements.get("fc-label")) { // prevent browser error if the user calls this function more than once
        customElements.define("fc-label", FcLabel); // register the element on the browser to use as <fc-label> 
    }
    return FcLabel; /* enable to make an instance of the component with 'const fc = new FcLabel();' and send it to the
    html page with with document.appendChild(); */
}
