class Tooltip {
  static instance;
  element;
  offset = 10;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    this.initEventListeners();
  }

  render(htmlData) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = htmlData;
    document.body.append(this.element);
  }

  moveTooltip = event => {
    this.element.style.left = `${event.clientX + this.offset}px`;
    this.element.style.right = `${event.clientY + this.offset}px`;
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.pointerIn);
    document.addEventListener('pointerout', this.pointerOut);
  }

  pointerIn = event => {
    const element = event.target.closest('[data-tooltip]');
    if (!element) return;
    this.render(element.dataset.tooltip);
    this.moveTooltip(event);
    document.addEventListener('pointermove', this.pointerMove);
  }

  pointerOut = () => {
    this.removeTooltip();
  }

  pointerMove = event => {
    this.moveTooltip(event);
  }

  removeTooltip() {
    if (this.element) {
      this.remove();
      document.removeEventListener('pointermove', this.pointerMove);
    }
  }

  remove() {
    this.element.remove();
    this.element = null;
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerIn);
    document.removeEventListener('pointerout', this.pointerOut);
  }
}
  
const tooltip = new Tooltip();

export default tooltip;  