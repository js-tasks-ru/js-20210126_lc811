export default class SortableTable {
  subElements = {};
  default = 'title';

  constructor(headers = [], {data = []} = {}) {
    this.headers = headers;
    this.data = data;
    this.render();
    this.initEventListners();
    this.sortByDefault();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable();
    this.element = element.firstElementChild;
    this.getSubElements();
  }

  getTable() {
    return `
    <div class="sortable-table">
    ${this.getHeader()}
    ${this.getBody()}
    </div>`;
  }

  getHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
    ${this.getHeaderRow(this.headers)}
    </div>`;
  }

  getHeaderRow(headers) {
    return headers.map(item => {
      return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="">
        <span>${item.title}</span>
        ${this.getArrow(this.default, item)}
      </div>`}).join('');
  }

  getArrow(id, item) {
    if (id == item.id) {
      return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;
    }
    return '';
  }

  getBody() {
    return `
    <div data-element="body" class="sortable-table__body">
    ${this.getBodyRows(this.data)}
    </div>
    `;
  }

  getBodyRows(data) {
    return data.map(item => {
      return `
      <a href="/products/${item.id}" class="sortable-table__row">
      ${this.getRowCells(item)}
      </a>`;
    }).join('');
  }

  getRowCells(item) {
    return this.headers.map(header => {
      return header.template 
        ? header.template(item[header.id]) 
        : `<div class="sortable-table__cell">${item[header.id]}</div>`;
    }).join('');
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    [...elements].map(item => this.subElements[item.dataset.element] = item);
  }

  sort(column) {
    const arr = [...this.data];

    const direction = {
      asc: 1,
      desc: -1
    };

    const sortType = this.headers.find(item => item.id == column.dataset.id).sortType;

    const {id, order} = column.dataset;

    const arrow = column.querySelector('.sortable-table__sort-arrow');
    if (!arrow) column.append(this.subElements.arrow);

    arr.sort((a, b) => {
      switch (sortType) {
      case 'string':
        return direction[order] * a[id].localeCompare(b[id], 'ru');
      case 'number':
        return direction[order] * (a[id] - b[id]);
      default:
        return direction[order] * (a[id] - b[id]);
      }
    });

    this.subElements.body.innerHTML = this.getBodyRows(arr);
    const { children } = this.subElements.header;
    const [_, title] = children;
  }

  initEventListners() {
    this.subElements.header.addEventListener('pointerdown', this.onclickSort);
  }

  onclickSort = event => {
    const column = event.target.closest('.sortable-table__cell[data-sortable="true"]');
    //Не стал использовать объект с ключами asc и desc, чтобы не усложнять обработку пустого атрибута order
    if (!column) return;
    const order = column.dataset.order;
    switch (order) {
    case 'asc':
      column.dataset.order = 'desc';
      break;
    case 'desc':
      column.dataset.order = 'asc';
      break;
    default:
      column.dataset.order = 'desc';
    }
    this.sort(column);
  }

  sortByDefault() {
    const column = this.subElements.header.querySelector(`[data-id="${this.default}"]`);
    column.dataset.order = 'asc';
    this.sort(column);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}