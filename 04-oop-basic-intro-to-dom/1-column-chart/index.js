export default class ColumnChart {
  chartHeight = 50;
  updatableElements = {};

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;

    this.render();
  }

  get template() {
    return `
     <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
       <div class="column-chart__title">
         Total ${this.label}
         ${this.getLink()}
       </div>
       <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
         <div data-element="body" class="column-chart__chart">
           ${this.populateBody(this.data)}
         </div>
       </div>
     </div>
     `;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  populateBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
    }).join('');
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }
    this.updatableElements = this.getUpdatableElements(this.element);
  }

  getUpdatableElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((res, item) => {
      res[item.dataset.element] = item;
      return res;
    }, {});
  }

  update(data) {
    this.data = data;
    this.updatableElements.body.innerHTML = this.populateBody();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
