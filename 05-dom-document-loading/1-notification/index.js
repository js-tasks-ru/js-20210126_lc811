export default class NotificationMessage {
  static onShow = null;

  constructor(message = 'Hello World!', {duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.createElement();
  }

  get template() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
            <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
            ${this.message}
            </div>
        </div>
    </div>`;
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  remove() {
    if (!NotificationMessage.onShow) {
      return;
    } else {
      clearTimeout(NotificationMessage.onShow.timerId);
      NotificationMessage.onShow.instance.element.remove();
      NotificationMessage.onShow = null;
    }
  }
    
  setOnShow(timerId) {
    NotificationMessage.onShow = {
      instance: this,
      timerId: timerId
    };
  }

  show(element = document.body) {
    this.remove();
    element.append(this.element);
    const timerId = setTimeout(this.remove, this.duration);
    this.setOnShow(timerId);
  }

  destroy() {
    this.element.remove();
    this.onShow = null;
  }
}
