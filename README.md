# RSS Aggregator 📰

Это современное веб-приложение для чтения новостных лент в формате RSS. Проект построен на принципах **MVC** и использует реактивное управление состоянием.

### 🛠 Стек технологий:
![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)

### ✨ Ключевые особенности:
- **Архитектура MVC:** Использование библиотеки `on-change` для разделения логики приложения и рендеринга.
- **Валидация на лету:** Проверка вводимых URL с помощью `Yup` (обработка дублей и некорректных адресов).
- **Мультиязычность:** Полная поддержка локализации интерфейса через `i18next`.
- **Работа с сетью:** Загрузка данных через прокси (AllOrigins) для обхода ограничений CORS.

### 🚀 Как запустить:
1. `npm install`
2. `make dev` (или `npm run dev`)

### Hexlet tests and linter status:
[![Actions Status](https://github.com/bpth8/frontend-project-11/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/bpth8/frontend-project-11/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bpth8_frontend-project-11&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bpth8_frontend-project-11)
[![Lint](https://github.com/bpth8/frontend-project-11/actions/workflows/lint.yml/badge.svg)](https://github.com/bpth8/frontend-project-11/actions/workflows/lint.yml)
