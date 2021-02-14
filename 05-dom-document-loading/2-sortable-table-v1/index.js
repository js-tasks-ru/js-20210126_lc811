export default class SortableTable {
  subElements = {};

  constructor(headers = [], {data = []} = {}) {
    this.headers = headers;
    this.data = data;
    this.render();
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
        ${this.getArrow()}
      </div>`}).join('');
  }

  getArrow() {
    return `
    <span data-element="arrow" class="sortable-table__sort-arrow">
      <span class="sort-arrow"></span>
    </span>`;
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

  sort(field, order) {
    const arr = [...this.data];

    const allHeaderColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentHeaderColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    const direction = {
      asc: 1,
      desc: -1
    };

    const sortType = this.headers.find(item => item.id == field).sortType;

    allHeaderColumns.forEach(col => col.dataset.order = '');
    currentHeaderColumn.dataset.order = order;

    arr.sort((a, b) => {
      switch (sortType) {
      case 'string':
        return direction[order] * a[field].localeCompare(b[field], 'ru-u-kf-upper', 'en-u-kf-upper');
      case 'number':
        return direction[order] * (a[field] - b[field]);
      default:
        return direction[order] * (a[field] - b[field]);
      }
    });

    this.subElements.body.innerHTML = this.getBodyRows(arr);
  }

  removeArrows() {
    
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}