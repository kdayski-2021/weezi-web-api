# weezi-web-api

HTTP API на `express`, который читает данные из Google Spreadsheet (через `google-spreadsheet`) и отдаёт агрегированную информацию по DAO.

## Стек

- `express`
- `cors`
- `dotenv`
- `google-spreadsheet`

## Требования

- Node.js (желательно LTS)
- Google API key с доступом к нужному Google Spreadsheet

## Установка

```bash
npm install
```

## Переменные окружения

Создайте файл `.env` (он не коммитится).

```bash
GOOGLE_API_KEY=ваш_google_api_key
PORT=30001
```

`PORT` опционален: по умолчанию сервер слушает `30001`.

## Запуск

```bash
node index.js
```

После запуска в консоль выводится сообщение вида: `DAO API Server ready on port <port>`.

## API

### `GET /dao-info`

Возвращает текущую агрегированную сводку.

Пример:

```bash
curl http://localhost:30001/dao-info
```

Ответ (JSON):

```json
{
  "DAOVaults": 12,
  "currentUsers": 1234.5,
  "aum": 12.3,
  "totalTransactionVolume": 45.6,
  "votesCastByCommunity": 789
}
```

Как формируется:
- читает диапазон `A1:J30`
- ищет строку с названием `ИТОГО` в первом столбце, чтобы взять итоговые значения.

### `GET /dao-history`

Возвращает историю значений (список объектов).

Пример:

```bash
curl http://localhost:30001/dao-history
```

Ответ (JSON-массив):

```json
[
  {
    "date": "2026-01-01",
    "DAOVaults": 12,
    "currentUsers": 1234.5,
    "aum": 12.3,
    "aumS": "1234500",
    "totalTransactionVolume": 45.6,
    "totalTransactionVolumeS": "4567000",
    "votesCastByCommunity": 789
  }
]
```

Как формируется:
- читает диапазон `A1:J300`
- для каждой даты ищет строку `ИТОГО` и собирает итоговые показатели.

## CORS

`cors()` включён для всех источников, поэтому запросы из браузера должны работать без дополнительных настроек.

## Примечания

- Эндпоинты при каждом запросе загружают данные из Google Spreadsheet заново (кэш не реализован).
- ID Google Spreadsheet захардкожен в `index.js`, а ключ берётся из `GOOGLE_API_KEY`.

