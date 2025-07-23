import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import render from './view/render.js';
import validate from './validation.js';

const app = () => {
  // настройка i18next для локализации сообщений об ошибках
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru: {
        translation: {
          errors: {
            invalidUrl: 'Ссылка должна быть валидным URL',
            duplicateUrl: 'RSS уже существует',
            required: 'Не должно быть пустым',
          },
          success: 'RSS успешно загружен',
        },
      },
    },
  });

  // настройка локализации для yup
  yup.setLocale({
    mixed: {
      required: 'errors.required',
    },
    string: {
      url: 'errors.invalidUrl',
    },
  });

  // Элементы DOM
  const elements = {
    form: document.querySelector('.header__form'),
    formInput: document.querySelector('input[name="url"]'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedbackElement: document.querySelector('.feedback'),
  };

  // Состояние приложения (стэйт)
  const state = {
    form: {
      processState: 'filling',
      valid: true,
      error: null,
    },
    feeds: [], // массив для хранения добавленных rss-потоков
  };

  // View
  // оборачиваем состояние в прокси on-change, который вызывает render при любом изменении
  const watchedState = onChange(state, (path, value) => {
    render(state, elements, i18nextInstance);

    // после того как поток был добавлен и форма очищена (состояние 'added'),
    // возвращаем состояние в 'filling' для следующего ввода.
    if (path === 'form.processState' && value === 'added') {
      watchedState.form.processState = 'filling';
    }
  });

  // контроллер
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    // переводим форму в состояние отправки
    watchedState.form.processState = 'sending';

    const existingUrls = watchedState.feeds.map((feed) => feed.url);

    // вызов асинхр валидации
    validate(url, existingUrls)
      .then((validUrl) => {
        // успех валидации
        watchedState.form.valid = true;
        watchedState.form.error = null;
        
        const newFeed = { url: validUrl, id: Date.now() };
        watchedState.feeds.unshift(newFeed);

        // установка состояния, чтобы вью сбросил форму
        watchedState.form.processState = 'added';
      })
      .catch((err) => {
        // ошибка, фалс
        watchedState.form.valid = false;
        // yup помещает ключ ошибки в err.message
        watchedState.form.error = err.message;
        watchedState.form.processState = 'failed';
      });
  });
};

// Запуск приложения
app();