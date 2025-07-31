// это "слой View". Его единственная задача — отображать текущее состояние приложения и
// он не изменяет состояние, а только читает его и обновляет DOM
// Функция render будет вызываться при каждом изменении состояния благодаря on-change

const renderFeeds = (feeds, container) => {
  // карточка для фидов
  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  const h2 = document.createElement('h2')
  h2.classList.add('card-title', 'h4')
  h2.textContent = 'Фиды' // Заголовок для раздела фидов
  cardBody.append(h2)
  card.append(cardBody)

  const ul = document.createElement('ul')
  ul.classList.add('list-group', 'border-0', 'rounded-0'); // Bootstrap классы для списка

  feeds.forEach((feed) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'border-0', 'border-end-0')

    const h3 = document.createElement('h3')
    h3.classList.add('h6', 'm-0')
    h3.textContent = feed.title
    const p = document.createElement('p')
    p.classList.add('m-0', 'small', 'text-black-50')
    p.textContent = feed.description

    li.append(h3, p)
    ul.append(li)
  })
  card.append(ul)
  container.innerHTML = '' // очистка контейнера перед отрисовкой
  container.append(card)
}

const renderPosts = (posts, container, viewedPostsIds) => {
  // карточка для постов
  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  const h2 = document.createElement('h2')
  h2.classList.add('card-title', 'h4')
  h2.textContent = 'Посты'; // заголовок для раздела постов
  cardBody.append(h2)
  card.append(cardBody)

  const ul = document.createElement('ul')
  ul.classList.add('list-group', 'border-0', 'rounded-0') // Bootstrap классы

  posts.forEach((post) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')

    const a = document.createElement('a')
    a.setAttribute('href', post.link)
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
    a.setAttribute('data-id', post.id); // data-id для ссылки
    // определение класса шрифта: fw-bold для непрочитанных, fw-normal для прочитанных
    const fontWeightClass = viewedPostsIds.has(post.id) ? 'fw-normal' : 'fw-bold'
    a.classList.add(fontWeightClass)
    a.textContent = post.title

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
    button.setAttribute('data-id', post.id); // ID поста для модального окна
    button.setAttribute('data-bs-toggle', 'modal')
    button.setAttribute('data-bs-target', '#modal')
    button.textContent = 'Просмотр'

    li.append(a, button)
    ul.append(li)
  })
  card.append(ul)
  container.innerHTML = '' // очистка контейнера перед отрисовкой
  container.append(card)
};

// функция для обновления модального окна
const renderModal = (postId, posts, elements) => {
  const post = posts.find((p) => p.id === postId)
  if (post) {
    elements.modalTitle.textContent = post.title
    elements.modalBody.textContent = post.description
    elements.fullArticleLink.setAttribute('href', post.link)
  }
}

const render = (state, elements, i18n) => {
  const { formInput, feedbackElement, submitButton, feedsContainer, postsContainer } = elements

  // управление формой
  submitButton.disabled = state.form.processState === 'sending'

  // Отображение ошибок валидации и сети/парсинга
  if (state.form.valid) {
    formInput.classList.remove('is-invalid')
    feedbackElement.textContent = ''
  } else {
    formInput.classList.add('is-invalid')
    // приоритет ошибки: сначала сеть/парсинг, потом валидация
    const errorMessageKey = state.networkError || state.form.error
    feedbackElement.textContent = i18n.t(errorMessageKey)
  }

  // сброс формы после успешного добавления
  if (state.form.processState === 'added') {
    formInput.value = '' // очищаем поле ввода
    formInput.focus() // возврат фокуса на поле ввода
    // если успех, можно показать сообщение об успехе
    feedbackElement.classList.remove('text-danger')
    feedbackElement.classList.add('text-success')
    feedbackElement.textContent = i18n.t('success')
  } else {
    // если не успех, убедимся, что цвет ошибки красный
    feedbackElement.classList.remove('text-success')
    feedbackElement.classList.add('text-danger')
  }

  // отрисовка фидов
  renderFeeds(state.feeds, feedsContainer)

  // отрисовка постов
  renderPosts(state.posts, postsContainer, state.ui.viewedPostsIds)

  // обновление модального окна, если есть активный postId
  if (state.ui.modal.postId) {
    renderModal(state.ui.modal.postId, state.posts, elements);
  }
}

export default render