import { css, CSSResult, customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { arrowdown } from '../icons/arrowdown';

export interface SelectItem {
    value: string;
    content?: string | TemplateResult;
    text?: string;
}

@customElement('custom-select')
export class Select extends LitElement {
    static get styles(): CSSResult {
        return css`
            :host {
                display: block;
                width: 100%;
                min-width: 180px;
                max-width: 100%;
                box-sizing: border-box;

                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }

            select {
                display: none;
            }

            .select {
                position: relative;
                line-height: 50px;
                font-family: var(--font-family);
                font-size: var(--font-size-14);
                box-sizing: border-box;
                cursor: pointer;
            }
            .select .selected {
                display: flex;
                background-color: var(--primary-white);
                color: var(--primary-blue-80);
                padding: 0 46px 0 17px;
                height: 50px;
                width: 100%;
                border-radius: var(--border-radius);
                border: 1px solid var(--primary-blue-10);
                box-sizing: border-box;
                transition:
                    border-color var(--transition-duration-shortest) ease-in-out,
                    border-radius var(--transition-duration-shortest) ease-in-out;
            }
            .select.open .selected {
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
            }
            .placeholder {
                opacity: 0.3;
            }

            .arrow-down {
                position: absolute;
                right: 17px;
            }
            .option-list {
                position: absolute;
                background-color: var(--primary-white);
                color: var(--primary-blue-80);
                left: 0px;
                top: 49px;
                min-width: 100%;
                max-height: 225px;
                -webkit-overflow-scrolling: touch;
                opacity: 0;
                pointer-events: none;
                box-sizing: border-box;
                overflow-x: hidden;
                overflow-y: auto;
                border: 1px solid var(--primary-blue-10);
                border-bottom-left-radius: var(--border-radius);
                border-bottom-right-radius: var(--border-radius);
                transition:
                    opacity var(--transition-duration-shortest) ease-in-out;
                z-index: 2;
            }

            .select.open .option-list {
                opacity: 1;
                pointer-events: auto;
            }
            .option-item {
                padding: 0 17px;
                white-space: nowrap;
                border-left: 0 !important;
                border-right: 0 !important;
                transition:
                    color var(--transition-duration-supershort) ease-in-out,
                    background-color var(--transition-duration-supershort) ease-in-out;
            }
            .option-item:hover {
                background-color: var(--primary-light-blue-5);
            }
            .option-item.hidden {
                display: none;
            }
            .option-item * {
                pointer-events: none;
            }
            .select > .selected .placeholder-wrapper svg,
            .option-item > svg {
                display: inline-block;
                vertical-align: middle;
                margin: 0 15px 0 0;
                border-radius: var(--border-radius);
            }
            .select > .selected .placeholder-wrapper svg:last-child,
            .option-item > svg:last-child {
                margin: 0;
            }
        `;
    }

    @property({ type: Array })
    public list: SelectItem[] = [];

    @property({ type: String })
    public placeholder?: string;

    @property({ type: String })
    public selected?: string;

    @property({ type: String })
    public readonly eventName?: string;

    @property({ type: Boolean })
    public open: boolean = false;

    constructor() {
        super();
        document.addEventListener('click', this.windowClicked);
    }

    public render = (): TemplateResult => html`
        <div class="select ${classMap({ open: this.open })}">
            <div class="selected" @click="${this.toggleOpen}">
                <div class="placeholder-wrapper">
                    ${this.selected ? this.showSelected() : html`<span class="placeholder">${this.placeholder}</span>`}
                </div>
                <i class="arrow-down">${arrowdown}</i>
            </div>
            <div class="option-list">
                ${this.list.map((item: SelectItem) => html`
                    <div
                        class="
                            option-item
                            ${item.value === this.selected ? `option-item_selected`: ''}
                        "
                        @click="${this.itemClicked}"
                        data-value="${item.value}"
                    >${this.showContent(item)}</div>
                `)}
            </div>
        </div>
        <select @change="${this.selectChange}">
            ${this.list.map((item: SelectItem) => html`
                <option ?selected="${item.value === this.selected}" value="${item.value}">${this.showContent(item)}</option>
            `)}
        </select>
    `

    public readonly showContent = (item: SelectItem): (string | TemplateResult | undefined) => {
        if (item.content) {
            return item.content;
        }
        if (item.text) {
            return item.text;
        }

        if (!item.text && !item.content) {
            return item.value;
        }

        return undefined;
    }

    public selectChange(e: {target: {value: string}}): void {
        if (e && e.target) {
            this.selectChangeEvent(e.target.value);
        }
    }

    public itemClicked(e: MouseEvent): void {
        e.stopPropagation();

        if (e && e.target) {
            const value: string = <string>(<HTMLDivElement>e.target).getAttribute('data-value');
            this.selectChangeEvent(value);
            this.open = false;
        }
    }

    public selectChangeEvent(val: string): void {
        if (this.eventName) {
            const event: CustomEvent = new CustomEvent(this.eventName, {
                detail: {
                    value: val,
                },
                bubbles: true,
                composed: true,
            });
            this.dispatchEvent(event);
        }
        this.selected = val;
        this.open = false;
    }

    public toggleOpen(e: MouseEvent): void {
        e.stopPropagation();
        this.open = !this.open;
    }

    public showSelected(): (string | TemplateResult | undefined) {
        const selectedItem: SelectItem | undefined = this.list.find((item: SelectItem) => item.value === this.selected);
        if (selectedItem !== undefined) {
            return this.showContent(selectedItem);
        } else {
            return '';
        }
    }

    public disconnectedCallback = (): void => {
        super.disconnectedCallback();
        window.removeEventListener('click', this.windowClicked);
    }

    private readonly windowClicked = (e: MouseEvent): void => {
        e.stopPropagation();
        this.open = false;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'custom-select': Select;
    }
}
