import * as yup from 'yup';

//файл который экспортирует одну асинхронную функцию, проверяет URL на 
// : корректность формата URL и отсутствие дубликатов

const validate = (url, existingUrls) => {
  // чхема создается внутри функции, чтобы всегда использовать актуальный
  // список добавленных URL для проверки на дубликаты.
  const schema = yup.string()
    .required('errors.required') // тест на пустое поле
    .url('errors.invalidUrl') // тест на валидность URL
    .notOneOf(existingUrls, 'errors.duplicateUrl'); // тест на дубликат

  // метод .validate() возвращает промис
  return schema.validate(url);
};

export default validate;

