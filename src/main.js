import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import onChange from 'on-change'
import i18next from 'i18next'
import * as yup from 'yup'
import axios from 'axios'
import parseRss from './parser.js'
import render from './view/render.js'
import validate from './validation.js'

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
            networkError: 'Ошибка сети. Проверьте подключение или попробуйте позже.',
            parsingError: 'Ресурс не содержит валидный RSS',
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
    form: document.querySelector('.rss-form'),
    formInput: document.querySelector('input[name="url"]'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedbackElement: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'), // контейнер для фидов
    postsContainer: document.querySelector('.posts'), // контейнер для постов
  };

  // Состояние приложения (стэйт)
  const state = {
    form: {
      processState: 'filling',
      valid: true,
      error: null,
    },
    feeds: [], // массив для хранения добавленных rss-потоков
    posts: [], // массив для хранения постов
    networkError: null, //состояние для ошибок парсинга
  };

  // View
  // оборачиваем состояние в прокси on-change, который вызывает render при любом изменении
  const watchedState = onChange(state, (path, value) => {
    render(watchedState, elements, i18nextInstance);

    // после того как поток был добавлен и форма очищена (состояние 'added'),
    // возвращаем состояние в 'filling' для следующего ввода.
    if (path === 'form.processState' && value === 'added') {
      watchedState.form.processState = 'filling'
    }
  })

  //спомогательные функции для работы с RSS

  const getProxyUrl = (url) => {
    const proxyUrl = new URL('https://allorigins.hexlet.app/get')
    proxyUrl.searchParams.set('disableCache', 'true')
    proxyUrl.searchParams.set('url', url)
    return proxyUrl.toString()
  };

  // контроллер
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const url = formData.get('url').trim()

    // переводим форму в состояние отправки
    watchedState.form.processState = 'sending'
    watchedState.networkError = null

    const existingUrls = watchedState.feeds.map((feed) => feed.url)

    // вызов асинхр валидации
    validate(url, existingUrls)
      .then(() => { // успех валидации
        const proxyUrl = getProxyUrl(url)
        return axios.get(proxyUrl); // прокси запрос
      })
      .then((response) => {
        const { contents } = response.data; // получение содержимого RSS
        const { feed, posts } = parseRss(contents, url); // парсинг RSS

        //присваиваем feedId каждому посту
        const postsWithFeedId = posts.map(post => ({ ...post, feedId: feed.id }))

        watchedState.feeds.unshift(feed) // добавляем фид
        watchedState.posts.unshift(...postsWithFeedId) // добавляем посты

        watchedState.form.valid = true
        watchedState.form.error = null
        //установка состояния, чтобы вью сбросил форму
        watchedState.form.processState = 'added'
      })
      .catch((err) => {
        // ошибка, фалс
        watchedState.form.valid = false
        // yup помещает ключ ошибки в err.message
        watchedState.form.processState = 'failed'

        // проверка тип ошибки
        if (err.isAxiosError) {
          // ошибки сети
          watchedState.networkError = 'errors.networkError' // новый ключ для i18next
          watchedState.form.error = 'errors.networkError' // передача в форму для отображения
          console.error('Ошибка сети:', err.message)
        } else if (err.message === 'errors.parsingError') {
          // ошибки парсинга, которые мы сами генерируем
          watchedState.networkError = 'errors.parsingError'
          watchedState.form.error = 'errors.parsingError'
          console.error('Ошибка парсинга:', err.message)
        } else {
          // ошибки валидации (от yup)
          watchedState.form.error = err.message;
          watchedState.networkError = null; // нет ошибки сети/парсинга
        }
      })
  })
}

// Запуск приложения
app()