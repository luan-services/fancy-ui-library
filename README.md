# Fancy UI

A lightweight, cool, customizable Web Component library built with TypeScript.
Works with **React**, **Vue**, **Angular**, **Svelte**, or plain HTML/JS.

## Installation

```bash
npm install fancy-ui-ts
```

-----

## 1\. Quick Start

### Registration

Before using a component, you must register it with the browser.

```typescript
import { defineInput } from './index';

defineInput(); 
```

You can also register every component at once:

```typescript
import { defineAll } from './index';

defineAll(); 
```

### Basic HTML Usage

```html
<form>
  <fc-input 
    name="username" 
    placeholder="Enter username" 
    required 
    minlength="3"
  >
  </fc-input>

  <fc-input 
    type="password" 
    name="password" 
    required
  >
  </fc-input>
</form>
```

-----

## 2\. Setting Properties & Attributes

Most fc-components have properties that can be set as custom attributes, they also accepts default attributes. You can configure the component using HTML Attributes or JavaScript Properties.

### Via HTML Attributes

Use this for static configuration or simple strings.

```html
<fc-input 
  label="Email" 
  type="email" 
  disabled
  placeholder="john@doe.com"
></fc-input>
```

### Via JavaScript Properties

In some cases, you'll need to pass dynamic data, complex objects, arrays or event listeners. You can't do that as attributes, you must
pass them with Javascript:

```javascript
const input = document.querySelector('fc-input');

input.value = "New Value";
input.disabled = true;
input.required = false;

// The setProps() helper: useful for setting multiple properties at once using a configuration object.
input.setProps({
  value: "Dynamic Value",
  placeholder: "Updated Placeholder",
  readOnly: true
});
```

-----

## 3\. Styling & Theming

The component uses **Shadow DOM**, which means internal elements (like the actual `<input>` tag) are isolated from global CSS. You cannot style internal classes like `.fc-input-field` directly. Instead, you use **CSS Variables** or style the **Host Component**.

### Strategy A: CSS Variables (Theming)

Variables pierce the Shadow DOM and are the primary way to theme the component.

```css
/* Apply globally to all inputs */
:root {
  --fc-input-bg: #ffffff;
  --fc-input-border: #ccc;
  --fc-input-focus-ring: 0 0 0 3px rgba(0, 123, 255, 0.25);
  --fc-input-radius: 4px;
}

/* Apply only on a theme */
:root[fc-theme="dark"] {
    --fc-input-bg: #333;
    --fc-input-fg: #fff;
}

/* Apply to a specific class */
.username-input {
  --fc-input-border: #555;
}
```

### Strategy B: Host Styling

You can style the element tag itself (dimensions, margins, display).

```css
/* Target by tag name */
fc-input {
  display: block;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 400px;
}

/* Target by class */
.my-custom-input {
  width: 50%;
}

/* Target specific states provided by the component */
fc-input[disabled] {
  opacity: 0.7;
}

fc-input[touched]:invalid {
  /* You can style the host wrapper when error exists */
  animation: shake 0.2s ease-in-out;
}
```

-----

## 4\. Events

Each element has its own unique events that are emitted from it. Even though the elements still standart events like `input`, `click`, `blur`, because of the nature of the Shadow DOM, it is highly recommended to listen to only custom Events.

```javascript
const el = document.querySelector('fc-input');

el.addEventListener('fc-input', (e) => {
  console.log('Typing:', e.detail.value);
});

el.addEventListener('fc-change', (e) => {
  console.log('Committed:', e.detail.value);
});
```

-----

## 5\. Validation Logic

Some elements has validation logic, most are form field elements, link inputs, select, combobox, etc. Visual errors (red borders) are **suppressed** until the user interacts with the field (blur) or submits the form. Validation works in two layers:

### Layer 1: Native Attributes

Standard HTML5 attributes work automatically.

  * `required`, `min`, `max`, `step`
  * `minlength`, `maxlength`, `pattern`
  * `type="email"`, `type="url"`


### Layer 2: Custom Validator Function

You can inject custom business logic using the `.validator` property.

```javascript
const usernameInput = document.getElementById('user-field');

// Function receives value -> returns Error String or Null
usernameInput.validator = (value) => {
  if (value.toLowerCase() === 'admin') {
    return 'This username is reserved.'; // Error message
  }
  return null; // Valid
};
```

On both ways, you can also use our custom `<fc-error>` component to display the error message as a paragraph:

```html
<fc-input 
  id="email-field"
  label="Email" 
  type="email" 
  disabled
  placeholder="john@doe.com"
>
</fc-input>
<fc-error 
  for="email-field"
>
</fc-error>
```

-----

## 6\. Accessibility (A11y)

  * **Delegates Focus:** Most elements has delegate focus, which means clicking anywhere on the component focuses the internal input.
  * **ARIA Labels:** `aria-label`, `aria-labelledby`, `aria-describedby` and others aria's can be set directly to the fc-element. The browser automatically maps them to the respective internal element.
  * **Auto-States:** `aria-disabled`, `aria-required`, and `aria-invalid` are automatically managed by `ElementInternals`. Do not set these manually.
  * **Other:** Other aria properties are added directly to the element template because they do not need to be custom and does not change. Example: `<fc-combobox>` has keyboard mapping arias added to its template, `<fc-input>` has 'aria-live' on its internal input element, etc.

-----

## 7\. Attribute Reflection

For all properties (`disabled`, `placeholder`, `min`, etc.), the component uses **Reflection**.

  * **JS to HTML:** Setting `el.disabled = true` adds the `disabled` attribute to the HTML tag.
  * **HTML to JS:** Changing the HTML attribute triggers `attributeChangedCallback`, which updates the internal logic.
