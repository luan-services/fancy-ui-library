# Contributing to Fancy UI Library

Thank you for your interest in contributing to **Fancy UI Library**! We welcome contributions to help make this project better.

## Getting Started

### Prerequisites
* **Node.js**: Ensure you have Node.js installed (v18+ recommended).
* **npm**: This project uses npm as the package manager.

### Installation
1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally:
3.  
    ```bash
    git clone [https://github.com/YOUR_USERNAME/fancy-ui-library.git](https://github.com/YOUR_USERNAME/fancy-ui-library.git)
    cd fancy-ui-library
    ```
4.  **Install dependencies**:
5.  
    ```bash
    npm install
    ```

## Development Workflow

We use **Vite** for a fast development server and **tsup** for bundling.

### Running the Dev Server
To start the development server and test your changes visually:
```bash
npm run dev

```

* This opens the local server (usually at `http://localhost:5173`).
* It serves `/tests/index.html`, where you can manually test components.

### Building the Project

To build the library for production (generates ESM bundles and type definitions in `dist/`):

```bash
npm run build

```

* **Note:** We use `tsup` with tree-shaking. Ensure your component is exported in `src/index.ts` or it will be removed from the bundle.

## Adding a New Component

We follow a strict pattern for every component to keep logic, styles, and templates organized. Ensure your new component follows this pattern.

### 1. Create the Directory

Create a new folder in `src/components/` using the naming convention `fc-<name>` (e.g., `src/components/fc-button/`).

### 2. Create the Required Files

Inside your new folder, you need these four files:

#### A. Styles (`fc-<name>.styles.ts`)

Export the CSS styles as a template literal string. Use CSS variables for theming.

```typescript
export const styles = `
    :host {
        display: block;
        font-family: var(--fc-font-family);
    }
    /* ... your css ... */
`;

```

#### B. Template (`fc-<name>.template.ts`)

Create the HTML structure and inject the styles.

```typescript
import { styles } from './fc-select.styles';

export const template = document.createElement('template');
template.innerHTML = `
    <style>${styles}</style>
    <div part="container">
        <slot></slot>
    </div>
`;

```

#### C. Logic (`fc-<name>.ts`)

The main class extending `HTMLElement`. Use `attachShadow` and handling attributes/events here.

```typescript
import { template } from './fc-name.template';

export class FcName extends HTMLElement {
    static get observedAttributes() {
        return ['disabled', 'value'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }
    
    // ... logic ...
}

```

#### D. Index (`index.ts`)

Export the class and a define function.

```typescript
import { FcName } from "./fc-name";

export { FcName };

export const defineName = () => {
    if (!customElements.get("fc-name")) {
        customElements.define("fc-name", FcName);
    }
    return FcName;
};

```

### 3. Register the Component

Open `src/index.ts` (the main entry point) and register your new component:

1. **Import** it at the top.
2. **Export** it in the list.
3. Add the `defineName()` call inside the `defineAll` function.

```typescript
// src/index.ts
import { FcName, defineName } from "./components/fc-name/index";

export { 
   // ... other exports
   FcName,
   defineName
}

export const defineAll = () => {
    // ... other definitions
    defineName();
}

```

## Testing

We currently use manual testing via the browser.

1. Open `tests/index.html`.
2. Add an example of your new component `<fc-name>...</fc-name>`.
3. Run `npm run dev` and verify behavior in the browser.

## Submitting a Pull Request

1. Create a new branch: `git checkout -b feature/my-new-component`.
2. Commit your changes using descriptive messages.
3. Push to your fork and open a Pull Request against the `main` branch.
<br><br>
---

*Thank you for contributing!*
