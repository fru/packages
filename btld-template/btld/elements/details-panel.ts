import { setAttrSafe } from '../attributes';
import { BtldElementBase } from '../base';
import { css, html } from '../literals';

const detailsCss = css`
  details:has(> details-panel[layout='grid-columns'])::details-content,
  details:has(> details-panel:not([layout]))::details-content {
    content-visibility: visible !important;
    overflow: hidden;
  }

  details:has(> details-panel[layout='flex']) {
    display: contents;
  }

  details:has(> details-panel[layout='flex'])::details-content {
    content-visibility: visible !important;
    display: contents !important;
  }
`;

const layoutCss = css`
  :where(details-panel[open]) {
    --details-delay: var(--details-delay-opening);
  }

  :where(details-panel:not([open])) {
    --details-delay: var(--details-delay-closing);
  }

  :where(details-panel) {
    --details-ease: ease-in-out;
    --details-duration: 0.15s;

    --details-transition: var(--details-duration) var(--details-ease) var(--details-delay, 0s);

    transition:
      flex-grow var(--details-transition),
      grid-template-rows var(--details-transition),
      grid-template-columns var(--details-transition);
  }

  :where(details-panel:not([layout]), details-panel[layout='grid-columns']) {
    display: grid;
  }

  :where(details-panel:not([layout]):not([open])) {
    grid-template-rows: 0fr;
    --details-transform: var(--details-transform-closed, traslateY(-100%));
  }

  :where(details-panel:not([layout])[open]) {
    grid-template-rows: 1fr;
    transform: translateY(0);
  }

  :where(details-panel[layout='grid-columns']:not([open])) {
    grid-template-columns: 0fr;
    --details-transform: var(--details-transform-closed, traslateX(-100%));
  }

  :where(details-panel[layout='grid-columns'][open]) {
    grid-template-columns: 1fr;
  }

  :where(details-panel[layout='flex']:not([open])) {
    flex-grow: 0.00001;
    --details-transform: var(--details-transform-closed);
  }

  :where(details-panel[layout='flex'][open]) {
    flex-grow: 1;
  }
`;

const easeCss = css`
  details-panel {
    --ease-step-at-start: cubic-bezier(0, 1, 0, 1);
    --ease-step-at-end: cubic-bezier(1, 0, 1, 0);
    --ease-around-closed: var(--ease-step-at-end);
    --ease-around-opened: var(--ease-step-at-start);
  }

  details-panel[open] {
    --ease-around-closed: var(--ease-step-at-start);
    --ease-around-opened: var(--ease-step-at-end);
  }
`;

const shadowHtml = html`
  <div part="item">
    <div part="transform">
      <slot />
    </div>
  </div>
`;

const shadowCss = css`
  [part='item'] {
    min-height: 0;
  }
  [part='transform'] {
    transform: var(--details-transform);
    transition: transform var(--details-transition);
  }
`;

class BtldDetailsPanel extends BtldElementBase {
  static observedAttributes = ['open', 'layout'];

  open = this.props.observeBool({ attr: 'open', attrSync: true }, (value) => {
    setAttrSafe(this.details, 'open', value);
  });

  layout = this.props.observeString({ attr: 'layout', attrSync: true });

  details: HTMLDetailsElement | undefined;

  constructor() {
    super();
    this.props.redefine();
    this.applyShadow(shadowHtml, shadowCss);
    this.apply(detailsCss, layoutCss, easeCss);
  }

  override connect() {
    if (this.parentElement instanceof HTMLDetailsElement) {
      this.details = this.parentElement;
      this.props.set('open', this.details.open, { noSetter: true });
      this.events.add(this.details, 'toggle', ({ newState }) => {
        this.props.set('open', newState === 'open', { noSetter: true });
      });
    }

    // TODO make this changeable after connect
    if (this.hasAttribute('toggle-on-click')) {
      this.events.add(this, 'click', () => {
        this.open = !this.open;
      });
    }
  }
}

customElements.define('details-panel', BtldDetailsPanel);
