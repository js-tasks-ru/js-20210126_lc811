import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements = {};
  data = [];
  readyToLoad = true;
  sortParams = {
    defaultKey: '',
    defaultOrder: '',
    serverSort: true,
  }
  start = 0;
  step = 20;


  constructor(headers = [], {
    url = '',
    serverSort = true,
    defaultKey = 'title',
    defaultOrder = 'asc',
    } = {}) {
    this.headers = headers;
    this.url = new URL(url, BACKEND_URL);
    this.sortParams.serverSort = serverSort;
    this.sortParams.defaultKey = defaultKey;
    this.sortParams.defaultOrder = defaultOrder;
    this.render();
    this.initEventListners();
    this.initUrl(
      this.sortParams.defaultKey, 
      this.sortParams.defaultOrder,
      this.start,
      this.step);
    this.update();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable();
    this.element = element.firstElementChild;
    this.getSubElements();
  }

  initUrl(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
  }

  async update(eraseData = false) {
    if (eraseData) {
      this.subElements.body.innerHTML = '';
      this.data = [];
    }
    this.element.classList.add('sortable-table_loading');
    const data = await this.loadData();
    this.element.classList.remove('sortable-table_loading');
    this.updateRows(data);
  }

  updateRows(data) {
    this.data = [...this.data, ...data];
    const newRows = document.createElement('div');
    newRows.innerHTML = this.getBodyRows(data);
    this.subElements.body.append(...newRows.children);
  }

  async loadData() {
    const data = await fetchJson(this.url);
    this.start += this.step + 1;
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.start + this.step);
    return data;
  }

  getTable() {
    return `
    <div class="sortable-table">

    ${this.getHeader()}
    ${this.getBody()}

    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>
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
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${this.getDefaultOrder(item)}">
        <span>${item.title}</span>
        ${this.getArrow(this.sortParams.defaultKey, item)}
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

  getDefaultOrder(item) {
    if (item.id === this.sortParams.defaultKey) {
      return this.sortParams.defaultOrder;
    }
  }

  getBody() {
    return `
    <div data-element="body" class="sortable-table__body">
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

  sortLocal(column) {
    const arr = [...this.data];

    const direction = {
      asc: 1,
      desc: -1
    };

    const sortType = this.headers.find(item => item.id == column.dataset.id).sortType;

    const {id, order} = column.dataset;

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

  async sortOnServer(column) {
    this.start = 0;
    const {id, order} = column.dataset;
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.start + this.step);
    await this.update(true);
  }

  initEventListners() {
    this.subElements.header.addEventListener('pointerdown', this.onclickSort);
    document.addEventListener('scroll', this.onScrollDown);
  }

  onclickSort = async event => {
    const column = event.target.closest('.sortable-table__cell[data-sortable="true"]');
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

    this.moveArrow(column);

    if (this.sortParams.serverSort) {
      await this.sortOnServer(column);
    } else {
      this.sortLocal(column);
    }
  }

  moveArrow(column) {
    const arrow = column.querySelector('.sortable-table__sort-arrow');
    if (!arrow) column.append(this.subElements.arrow);
  }

  onScrollDown = async event => {
    const state = document.documentElement.scrollHeight - document.documentElement.scrollTop - document.documentElement.clientHeight === 0;
    if (state && this.readyToLoad) {
      this.readyToLoad = false;
      await this.update();
      this.readyToLoad = true;
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

}
