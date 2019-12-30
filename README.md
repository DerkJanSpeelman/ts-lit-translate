# ts-lit-translate

https://github.com/andreasbm/lit-translate

This documentation extends the original documentation with better type declarations and dynamic interpolation functionality.

<br>

## Table of contents

* [1. Getting started](#1-getting-started)
* [2. Setting up lit-translate in TypeScript](#2-setting-up-lit-translate-in-typescript)
* [3. Wait for strings to be loaded before displaying the component](#3-.wait-for-strings-to-be-loaded-before-displaying-the-component)
* [4. Getting translations](#4-getting-translations)
* [5. Use the `translate` directive with `lit-html`](#5-use-the-translate-directive-with-lit-html)
* [6. Change language](#6-change-language)
* [7. Interpolate values](#7-interpolate-values)
    * [#7.1 Interpolate values with HTML strings](#71-interpolate-values-with-html-strings)
    * [#7.2 Interpolate dynamic values](#72-interpolate-dynamic-values)


<br>

## 1. Getting started

Install [lit-translate](https://github.com/andreasbm/lit-translate) with `npm i lit-translate` as shown in the docs. And define the translations in JSON format, also shown in the docs.

```json
// en.json
{
    "en": "English",
    "nl": "Dutch",

    "selected_language": "Selected language",

    "login_page": {
        "sign_in": "Sign in",
        "sign_in_intro": "Sign in with your social media account or email address.",
        "sign_in_with": "Sign in with [[social]]",
        "agreement": "I agree with all [[terms_and_conditions]] and [[privacy_policies]].",
    },
    "terms_and_conditions": "Terms and Conditions",
    "privacy_policies": "Privacy Policies",
}
```

```json
// nl.json
{
    "en": "Engels",
    "nl": "Nederlands",

    "selected_language": "Geselecteerde taal",

    "login_page": {
        "sign_in": "Login",
        "sign_in_intro": "Log in met je socialmedia-account of e-mailadres.",
        "sign_in_with": "Log in met [[social]]",
        "agreement": "Ik ga akkoord met [[terms_and_conditions]] en [[privacy_policies]].",
    },
    "terms_and_conditions": "Algemene Voorwaarden",
    "privacy_policies": "Privacy beleid",
}
```

<br>

## 2. Setting up lit-translate in TypeScript

Registering the translate config differs from the original documentation. Either way, the best place to configure lit-translate is in your main component. `App.ts` in my case. Place this in lit-elements' [`connectedCallback`](https://lit-element.polymer-project.org/guide/events) lifecycle callback.

```ts
// App.ts
import { customElement, LitElement } from 'lit-element';
import { LanguageIdentifier, registerTranslateConfig, Strings, use } from 'lit-translate';

@customElement('custom-app')
export class App extends LitElement {

    public async connectedCallback (): Promise<void> {
        registerTranslateConfig({
            loader: async (lang: LanguageIdentifier): Promise<Strings> => {
                return fetch(`/assets/lang/${lang}.json`).then(
                    async (res: Response): Promise<Strings> => {
                        return res.json();
                    },
                );
            },
        });
    }
}
```

**Please note** that I have ``return fetch(`/assets/lang/${lang}.json`).then(`` in my code example. With `use('en')` stated, this will search for `en.json` inside the `/assets/lang` folder.

<br>

## 3. Wait for strings to be loaded before displaying the component

From the docs:

> Sometimes you want to avoid the empty placeholders being shown initially before any of the translation strings has been loaded. To avoid this issue you might want to defer the first update of the component. Here's an example of what you could do if using `lit-element`.

By using the `langLoaded` property, the component will not be visible until the translation lines have been loaded. If you don't do this, the translation key will be shown instead of the translation: *en* in this case.

```ts
// App.ts
import { customElement, LitElement } from 'lit-element';
import { LanguageIdentifier, registerTranslateConfig, Strings, use } from 'lit-translate';

@customElement('custom-app')
export class App extends LitElement {

    @property({ type: Boolean })
    private langLoaded: boolean = false;

    public render = (): TemplateResult => html`
        <p>${translate('en')}</p>
    `

    public async connectedCallback (): Promise<void> {
        registerTranslateConfig({
            loader: async (lang: LanguageIdentifier): Promise<Strings> => {
                return fetch(`/assets/lang/${lang}.json`).then(
                    async (res: Response): Promise<Strings> => {
                        return res.json();
                    },
                );
            },
        });

        await use('en');
        this.langLoaded = true;
        super.connectedCallback();
    }

    protected shouldUpdate (changedProperties: PropertyValues): boolean {
        return this.langLoaded && super.shouldUpdate(changedProperties);
    }
}
```

<br>

## 4. Getting translations

To get the translation **once**, use `get`. The original docs say `import { get } from 'lit-translate'`. However, using `get` as function name is not a very smart idea. Simply rename it:

```js
// LoginPage.ts
import { get as translateGet } from "lit-translate";

translateGet("login_page.sign_in"); // "Hello"
translateGet("login_page.sign_in_intro"); // "World"
```

Remember: this will get the translation only **once**. See [Interpolate dynamic values](#interpolate-dynamic-values).

<br>

## 5. Use the `translate` directive with `lit-html`

Use the `translate` directive with `lit-html` to automatically refresh the translations when the language is changed.

```js
// LoginPage.ts
import { customElement, html, LitElement, TemplateResult } from 'lit-element';
import { translate } from "lit-translate";

@customElement('custom-login-page')
export class LoginPage extends LitElement {
    public render = (): TemplateResult => html`
        <article>
            <h1 class="large">${translate('login_page.sign_in')}</h1>
            <p>${translate('login_page.sign_in_intro')}</p>
        </article>
        `;
    }
}
```

Add an EventListener in the constructor of `App.ts`:

```js
// App.ts
constructor() {
    super();
    document.addEventListener('language-changed', this.changeLanguage);
}

private readonly changeLanguage = (e: any): void => {
    if (e && e.detail) {
        use(e.detail.value).catch((event: any) => {
            console.trace();
            console.warn(event);
        });
    }
}
```

This will invoke the `use` function again, to change the language.

<br>

## 6. Change language

To test this, create a custom `<select>` element to select a different language. On change, fire a `CustomEvent` called `anguage-changed`. Take a look at `Select.ts`. This element can be imported in any component, so let's import `LoginPage.ts` in `App.ts` and import the `<select>` element in `LoginPage.ts`.

```js
// App.ts
import './LoginPage';

public render = (): TemplateResult => html`
    <login-page></login-page>
`
```

```js
// LoginPage.ts
import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { translate } from 'lit-translate';

import './Select';

import { SelectItem } from './Select';

const languageList: SelectItem[] = [
    {
        value: 'en',
        text: 'English - British pound (£)',
    },
    {
        value: 'nl',
        text: 'Nederlands - Euro (€)',
    },
];

@customElement('login-page')
export class LoginPage extends LitElement {

    @property({ type: String })
    public lang: string = 'en';

    public render = (): TemplateResult => html`
        <article>
            <h1 class="large">${translate('login_page.sign_in')}</h1>
            <p>${translate('login_page.sign_in_intro')}</p>
        </article>
        <custom-select
            .eventName="${'language-changed'}"
            .list="${languageList}"
            selected="${this.lang ? this.lang : 'en'}"
        >
        </custom-select>
    `
}
```

<br>

## 7. Interpolate values

From the docs:

> When using the `get` function it is possible to interpolate values (eg. replace the placeholders with content). As default, you can simply use the `key` syntax in your translations and provide an object with values replacing those defined in the translations when using the `get` function.


```js
// LoginPage.ts
import { get as translateGet } from 'lit-translate';

${translate('signin.sign_in_with', {
    social: 'Google',
})}
// Sign in with Google.
```

Note: by default, it searched for strings inside double brackets: `[[string]]`:

```js
// App.ts
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

// Inside App.ts' connectedCallback function:
registerTranslateConfig({
    interpolate: (text: string, values: Values | ValuesCallback | null): any => {
        let res: string = text;

        if (values !== null) {
            for (const [key, value] of Object.entries(extract(values))) {
                res = res.replace(`[[${key}]]`, String(extract(value)));
            }
        }

        // unsafeHTML allows us to parse the result of the interpolated translation line to a TemplateResult object
        return unsafeHTML(res);
    },
});
```

But remember: `lit-translate`'s `get` function will get the translation only **once**. See [Interpolate dynamic values](#interpolate-dynamic-values).

<br>

### 7.1 Interpolate values with HTML strings

But what if you want html inside the translation? Like so:

```html
<p>I agree with all <a href="/terms-and-conditions">Terms and Conditions</a> and <a href="/terms-and-conditions">Privacy Policies</a>.</p>
```

`lit-translate` only accepts the types `string` or `number`. So, you could translate `Terms and Conditions` and `Privacy Policies` seperately. Without link, because you're not able to pass in a `TemplateResult`:

```js
${translate('signin.agreement', {
    terms_and_conditions: `<a href="/terms-and-conditions">${litTranslate('terms_and_conditions')}</a>`,
    privacy_policies: `<a href="/privacy-policies">${litTranslate('privacy_policies')}</a>`,
})}
```

But remember: `lit-translate`'s `get` function will get the translation only **once**.

<br>

### 7.2 Interpolate dynamic values

Why use this package if the interpolated values are not updated to the current selected language? To make this work:

```js
// App.ts
private readonly changeLanguage = (e: any): void => {
    if (e && e.detail) {
        use(e.detail.value).then(() => {
            document.dispatchEvent(new CustomEvent(`language-has-changed`));
        }).catch((event: any) => {
            console.trace();
            console.warn(event);
        });
    }
}
```

```js
// LoginPage.ts
constructor() {
    super();
    document.addEventListener('language-has-changed', this.languageChanged);
}

private readonly languageChanged = (): void => {
    this.performUpdate();
}
```
