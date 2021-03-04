import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  defaultProductData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };
  subElements = {};
  element;

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    const productPromise = this.productId ? this.loadProductData() : [this.defaultProductData];
    const categoriesPromise = this.loadCategoriesData();
    const [categoriesData, productDataArray] = await Promise.all([categoriesPromise, productPromise]);
    const [productData] = productDataArray;
    if (!productData) {
      this.noSuchProduct();
      return;
    }
    this.productData = productData;
    this.categories = categoriesData;
    this.createForm();
    this.populateForm();
    this.initEventListeners();
    return this.element;
  }

  populateForm() {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultProductData).filter(item => !excludedFields.includes(item));
    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);
      element.value = this.productData[item] || this.defaultProductData[item];
    });
  }

  createForm() {
    const element = document.createElement('div');
    element.innerHTML = this.template();
    this.element = element.firstElementChild;
    this.getSubElements();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    [...elements].map(item => {
      this.subElements[item.dataset.element] = item;
    });
  }

  loadProductData() {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
  }

  loadCategoriesData() {
    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  createCategoriesList() {
    const options = []; 
    for (const categorie of this.categories) {
      for (const subcategorie of categorie.subcategories) {
        const option = `<option value="${subcategorie.id}">${categorie.title} &gt; ${subcategorie.title}</option>`;
        options.push(option);
      }
    }
    return options.join('');
  }

  createImageList() {
    return this.productData.images.map(item => {
      return this.imageItemTemplate(item.url, item.source);
    }).join('');
  }

  imageItemTemplate(src, name) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(src)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  noSuchProduct() {
    this.element = document.createElement('div');
    this.element.innerHTML = ` <h1 class="page-title">Страница не найдена</h1>
    <p>Извините, данный товар не существует</p>`;
  }

  template() {
    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required
            id="title"
            value=""
            type="text"
            name="title"
            class="form-control"
            placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required
          id="description"
          class="form-control"
          name="description"
          data-element="productDescription"
          placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Фото</label>
        <ul class="sortable-list" data-element="imageListContainer">
          ${this.createImageList()}
        </ul>
        <button data-element="uploadImage" type="button" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
          ${this.createCategoriesList()}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required
            id="price"
            value=""
            type="number"
            name="price"
            class="form-control"
            placeholder="">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required
            id="discount"
            value=""
            type="number"
            name="discount"
            class="form-control"
            placeholder="">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required
          id="quantity"
          value=""
          type="number"
          class="form-control"
          name="quantity"
          placeholder="">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>
  `;
  }

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    document.addEventListener('input', this.onInput);
    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);
    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  onSubmit = event => {
    event.preventDefault();

    this.save();
  };

  onInput = async event => {
    const target = event.target;
    if (target.type === 'file' && target.accept === 'image/*') {
      const [file] = target.files;
      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData
        });

        imageListContainer.innerHTML += this.imageItemTemplate(result.data.link, file.name);

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        target.remove();
      }
    }
  }
 
  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('something went wrong', error);
    }
  }

  getFormData () {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultProductData).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`#${field}`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field)
        ? parseInt(value)
        : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.hidden = true;
    document.body.append(fileInput);
    fileInput.click();
  };

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');
    this.element.dispatchEvent(event);
  }
  
  destroy () {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove () {
    this.element.remove();
  }
}