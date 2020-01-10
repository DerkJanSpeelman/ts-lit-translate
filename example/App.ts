import { customElement, LitElement } from 'lit-element';
import { LanguageIdentifier, registerTranslateConfig, Strings, use } from 'lit-translate';

import './LoginPage';

@customElement('custom-app')
export class App extends LitElement {

    @property({ type: Boolean })
    private langLoaded: boolean = false;

    constructor() {
        super();
        document.addEventListener('language-changed', this.changeLanguage);
    }

    public render = (): TemplateResult => html`
        <login-page></login-page>
    `

    public async connectedCallback (): Promise<void> {
        registerTranslateConfig({
            loader: async (lang: LanguageIdentifier): Promise<Strings> => {
                return fetch(`/assets/lang/${lang}.json`).then(
                    async (res: Response): Promise<Strings> => {
                        this.langLoaded = true;

                        return res.json();
                    },
                );
            },
            interpolate: (text: string, values: Values | ValuesCallback | null): any => {
                let res: string = text;

                if (values !== null) {
                    for (const [key, value] of Object.entries(extract(values))) {
                        res = res.replace(`[[${key}]]`, String(extract(value)));
                    }
                }

                return unsafeHTML(res);
            },
        });

        await use('en');
        super.connectedCallback();
    }

    protected shouldUpdate = (changedProperties: PropertyValues): boolean => {
        return this.langLoaded && super.shouldUpdate(changedProperties);
    }

    private readonly = changeLanguage(e: any): void => {
        if (e && e.detail) {
            use(e.detail.value).catch((event: any) => {
                console.trace();
                console.warn(event);
            });
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'custom-app': App;
    }
}
