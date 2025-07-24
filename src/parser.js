const parseRss = (xmlString, feedUrl) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  // проверка наличия ошибок парсинга (<parsererror>)
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    const errorText = parserError.textContent;
    console.error('Ошибка парсинга XML:', errorText);
    // бросаем ошибку с ключом, который i18next сможет перевести
    throw new Error('errors.parsingError');
  }

  // извлекаем данные фида
  const feedTitle = doc.querySelector('channel > title').textContent;
  const feedDescription = doc.querySelector('channel > description').textContent;

  // извлекаем данные постов
  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent; // Описание поста
    return { title, link, description, feedId: null, id: Date.now() + Math.random() }; // feedId будет установлен позже, id для уникальности
  });

  // возвращаем объект с данными фида и постов
  return {
    feed: { title: feedTitle, description: feedDescription, url: feedUrl, id: Date.now() }, // Добавляем id для фида
    posts,
  };
};

export default parseRss;