# Настройка CORS для Telegram Mini App

## Проблема

Telegram Mini Apps работают в iframe с доменами Telegram (например, `web.telegram.org`), поэтому сервер должен разрешать CORS запросы с этих доменов.

## Решение на сервере

Сервер `way-test.dev.tedo.ru` должен отправлять следующие CORS заголовки:

### Вариант 1: Разрешить все домены Telegram (рекомендуется)

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: false
```

### Вариант 2: Разрешить конкретные домены Telegram

```
Access-Control-Allow-Origin: https://web.telegram.org
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Или для нескольких доменов (нужно проверять Origin и устанавливать соответствующий заголовок):

-   `https://web.telegram.org`
-   `https://webk.telegram.org`
-   `https://webz.telegram.org`

### Важно: Обработка preflight запросов (OPTIONS)

Сервер должен обрабатывать OPTIONS запросы и возвращать правильные заголовки:

```javascript
// Пример для Express.js
app.options('/telegram/logger', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});
```

## Проверка

1. Убедитесь, что сервер использует **HTTPS** (Telegram требует HTTPS)
2. Проверьте, что сервер отвечает на OPTIONS запросы
3. Проверьте заголовки ответа в Network tab браузера

## Пример правильного ответа сервера

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
Content-Type: application/json
```
