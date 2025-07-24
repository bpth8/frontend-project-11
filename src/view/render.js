//это "слой View". Его единственная задача — отображать текущее состояние приложения и
// он не изменяет состояние, а только читает его и обновляет DOM
// Функция render будет вызываться при каждом изменении состояния благодаря on-change

const render = (state, elements, i18n) => {
  const { formInput, feedbackElement, submitButton } = elements;

  // блокировка формы на время отправки
  submitButton.disabled = state.form.processState === 'sending';

  // отображение ошибок валидации
  if (state.form.valid) {
    // если ошибок нет, убираем красную рамку
    formInput.classList.remove('is-invalid');
    feedbackElement.textContent = '';
  } else {
    // если есть ошибка, добавляем красную рамку и выводим сообщение
    formInput.classList.add('is-invalid');
    // используем i18next для перевода ключа ошибки в сообщение
    feedbackElement.textContent = i18n.t(state.form.error);
  }

  // сброс формы после успешного добавления
  if (state.form.processState === 'added') {
    formInput.value = ''; // очищаем поле ввода
    formInput.focus(); // возврат фокуса на поле ввода
  }
};

export default render;