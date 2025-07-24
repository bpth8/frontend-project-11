//это "слой View". Его единственная задача — отображать текущее состояние приложения и
// он не изменяет состояние, а только читает его и обновляет DOM
// Функция render будет вызываться при каждом изменении состояния благодаря on-change

const renderFeeds = (feeds, container) => {
  container.innerHTML = '' // очистка контейнера перед отрисовкой
  const ul = document.createElement('ul')
  ul.classList.add('list-group', 'mb-5') // Bootstrap классы для списка

  feeds.forEach((feed) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item')

    const h3 = document.createElement('h3')
    h3.textContent = feed.title
    const p = document.createElement('p')
    p.textContent = feed.description

    li.append(h3, p)
    ul.append(li)
  })
  container.append(ul)
}

const renderPosts = (posts, container) => {
  container.innerHTML = '' // очистка контейнер
  const ul = document.createElement('ul')
  ul.classList.add('list-group') // Bootstrap классы

  posts.forEach((post) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start')

    const a = document.createElement('a')
    a.setAttribute('href', post.link)
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
    a.textContent = post.title
    a.classList.add('fw-bold') // жирный текст для ссылки

    li.append(a)

    ul.append(li)
  })
  container.append(ul)
}

const render = (state, elements, i18n) => {
  const { formInput, feedbackElement, submitButton, feedsContainer, postsContainer } = elements

  // Управление формой
  submitButton.disabled = state.form.processState === 'sending'

  // Отображение ошибок валидации и сети/парсинга
  if (state.form.valid) {
    formInput.classList.remove('is-invalid')
    feedbackElement.textContent = '' // очищаем текст ошибки
  } else {
    formInput.classList.add('is-invalid');
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

  // отрисовка фидов и постов
  if (state.feeds.length > 0) {
    renderFeeds(state.feeds, feedsContainer)
  } else {
    feedsContainer.innerHTML = '' // очистить, если фидов нет
  }

  if (state.posts.length > 0) {
    renderPosts(state.posts, postsContainer)
  } else {
    postsContainer.innerHTML = '' // очистить, если постов нет
  }
}

export default render