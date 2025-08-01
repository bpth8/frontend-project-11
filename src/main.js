import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import onChange from 'on-change'
import i18next from 'i18next'
import * as yup from 'yup'
import axios from 'axios'
import parseRss from './parser.js'
import validate from './validation.js'

const renderFeeds = (feeds, container) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Фиды';
  cardBody.append(h2);
  card.append(cardBody);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;

    li.append(h3, p);
    ul.append(li);
  });
  card.append(ul);
  container.innerHTML = '';
  container.append(card);
};

const renderPosts = (posts, container, viewedPostsIds) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Посты';
  cardBody.append(h2);
  card.append(cardBody);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('data-id', post.id);
    const fontWeightClass = viewedPostsIds.has(post.id) ? 'fw-normal' : 'fw-bold';
    a.classList.add(fontWeightClass);
    a.textContent = post.title;

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = 'Просмотр';

    li.append(a, button);
    ul.append(li);
  });
  card.append(ul);
  container.innerHTML = '';
  container.append(card);
};

const renderModal = (postId, posts, elements) => {
  const post = posts.find((p) => p.id === postId);
  if (post) {
    elements.modalTitle.textContent = post.title;
    elements.modalBody.textContent = post.description;
    elements.fullArticleLink.setAttribute('href', post.link);
  }
};

const render = (state, elements, i18n) => {
  const { formInput, feedbackElement, submitButton, feedsContainer, postsContainer } = elements;

  submitButton.disabled = state.form.processState === 'sending';

  if (state.form.valid) {
    formInput.classList.remove('is-invalid');
    feedbackElement.textContent = '';
  } else {
    formInput.classList.add('is-invalid');
    const errorMessageKey = state.networkError || state.form.error;
    feedbackElement.textContent = i18n.t(errorMessageKey);
  }

  if (state.form.processState === 'added') {
    formInput.value = '';
    formInput.focus();
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
    feedbackElement.textContent = i18n.t('success');
  } else {
    feedbackElement.classList.remove('text-success');
    feedbackElement.classList.add('text-danger');
  }

  renderFeeds(state.feeds, feedsContainer);
  renderPosts(state.posts, postsContainer, state.ui.viewedPostsIds);

  if (state.ui.modal.postId) {
    renderModal(state.ui.modal.postId, state.posts, elements);
  }
};

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
    modal: document.getElementById('modal'), // модальное окно
    modalTitle: document.querySelector('.modal-title'), // заголовок модального окна
    modalBody: document.querySelector('.modal-body'),   // тело модального окна (описание)
    fullArticleLink: document.querySelector('.full-article'), // ссылка "Читать полностью"
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
     ui: { // новый раздел для UI-состояния
      viewedPostsIds: new Set(), // Set для быстрого поиска просмотренных ID
      modal: {
        postId: null, // ID поста, который открыт в модальном окне
      },
    },
  }

  // View
  // оборачиваем состояние в прокси on-change, который вызывает render при любом изменении
  const watchedState = onChange(state, (path, value) => {
    render(watchedState, elements, i18nextInstance)

    // после того как поток был добавлен и форма очищена (состояние 'added'),
    // возвращаем состояние в 'filling' для следующего ввода.
    if (path === 'form.processState' && value === 'added') {
      watchedState.form.processState = 'filling'
    }
  })

  // обработчик событий для кнопок предпросмотра
  elements.postsContainer.addEventListener('click', (e) => {
    // проверка, что клик был по кнопке 'Просмотр'
    if (e.target.dataset.bsToggle === 'modal' && e.target.dataset.id) {
      const postId = e.target.dataset.id;
      // адд ID поста в список просмотренных
      const numericPostId = Number(postId)
      watchedState.ui.viewedPostsIds.add(postId);
      // инсталл ID поста для модального окна
      watchedState.ui.modal.postId = numericPostId;
    }
  })

  //спомогательные функции для работы с RSS

  const getProxyUrl = (url) => {
    const proxyUrl = new URL('https://allorigins.hexlet.app/get')
    proxyUrl.searchParams.set('disableCache', 'true')
    proxyUrl.searchParams.set('url', url)
    return proxyUrl.toString()
  };

  // функция для получения и парсинга постов из одного фида
  const fetchPosts = (feedUrl, feedId) => {
    const proxyUrl = getProxyUrl(feedUrl)
    return axios.get(proxyUrl)
      .then((response) => {
        const { contents } = response.data
        const { posts } = parseRss(contents, feedUrl)
        return posts.map(post => ({ ...post, feedId }))
      })
      .catch((error) => {
        console.error(`Ошибка при получении или парсинге RSS для ${feedUrl}:`, error)
        throw error
      })
  }

  // функция для периодического обновления всех фидов
  const updateFeeds = () => {
    const updatePromises = watchedState.feeds.map((feed) =>
      fetchPosts(feed.url, feed.id)
        .then((newPosts) => {
          // получение постов, которые уже есть для текущего фида
          const existingPostLinks = watchedState.posts
            .filter((post) => post.feedId === feed.id)
            .map((post) => post.link)

          // фильтр новых постов, оставляя только те, которых еще нет
          const uniqueNewPosts = newPosts.filter(
            (newPost) => !existingPostLinks.includes(newPost.link)
          )

          // добавление уникальных новых постов в начало массива posts
          if (uniqueNewPosts.length > 0) {
            watchedState.posts.unshift(...uniqueNewPosts);
          }
        })
        .catch((err) => {
          console.error(`Ошибка обновления фида ${feed.url}:`, err);
        })
    )

    // ожидание завершения всех запросов обновления, и установка таймаута
    Promise.allSettled(updatePromises)
      .finally(() => {
        setTimeout(updateFeeds, 5000)
      })
  }

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
        // инициализация обновления после добавления фида или если это первый фид
        if (watchedState.feeds.length === 1) {
          setTimeout(updateFeeds, 5000); // запуск цикла обновления после успешного добавления первого фида
        }
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

app()