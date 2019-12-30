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

    constructor() {
        super();
        document.addEventListener('language-has-changed', this.languageChanged);
    }

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

    private readonly languageChanged = (): void => {
        this.performUpdate();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'login-page': LoginPage;
    }
}