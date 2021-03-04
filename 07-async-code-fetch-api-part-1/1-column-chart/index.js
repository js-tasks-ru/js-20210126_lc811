import fetchJson from './utils/fetch-JSON.js';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  backendURL = 'https://course-js.javascript.ru';

  constructor({
    url = '',
    range = {
      from: new Date(), //Tests dont pass without empty Date
      to: new Date(),
    },
    label = '',
    link = '',
    formatHeading: formatHeading = data => data,
  } = {}) {
    this.url = new URL(url, this.backendURL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
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
          </div>
         <div data-element="body" class="column-chart__chart">
         </div>
       </div>
     </div>
     `;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((res, item) => {
      res[item.dataset.element] = item;
      return res;
    }, {});
  }

  getHeaderValue(data) {
    this.subElements.header.textContent = this.formatHeading(Object.values(data).reduce((acc, val) => acc += val, 0));
  }

  populateBody(data) {
    const dataValues = Object.values(data);
    const maxValue = Math.max(...dataValues);
    const scale = this.chartHeight / maxValue;

    this.subElements.body.innerHTML = dataValues.map(item => {
      const percent = (item / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
    }).join('');
  }

  //In current version this method is useless
  updateRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  async update(from, to) {
    this.subElements.header.textContent = '';
    this.subElements.body.innerHTML = '';
    this.updateRange(from, to);
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    const data = await fetchJson(this.url);
    if (Object.values(data).length) {
      this.getHeaderValue(data);
      this.populateBody(data);
      this.element.classList.remove('column-chart_loading');
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}