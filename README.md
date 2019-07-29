# `@epsor/logger`

This is the custom logger package for Epsor. Use it as soon as you need some logs.

- [`@epsor/logger`](#epsorlogger)
  - [Usage](#usage)
  - [View logs](#view-logs)
  - [Log levels](#log-levels)
  - [Guidelines](#guidelines)
    - [Log format](#log-format)
    - [Tags](#tags)

## Usage

`@epsor/logger` assumes that a few environment variables are set:

- `ELASTICSEARCH_URL`, `ELASTICSEARCH_USER` and `ELASTICSEARCH_PASSWORD` to identify against Elasticsearch node,
- `SERVICE_NAME` to identify which part of the app sent the log
- `ENVIRONMENT`

```js
import logger from '@epsor/logger';

logger.info('Hello World!');
```

## View logs

Logs are pushed:

- in your console,
- in your Elasticsearch instance (log levels info or less only, see [log levels](#log-levels) for more information).

## Log levels

Logger uses the npm logging levels,  prioritized from 0 to 5 :

```js
{
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
}
```

All log levels are logged to your console, but only log levels info or less are pushed to Elasticsearch. It allows developer to add logs for local debug purpose only.

## Guidelines

### Log format

For optimal readability of logs:

- Use a human-readable log message
- Add useful metadata (user, error stack...)

To add metadata in your logs, use an object as the second argument:

```js
logger.info(
  'Thats a nice message!',
  {
    user: {
      email: 'julien.murgey@epsor.fr',
      firstname: 'Julien'
      lastname: 'MURGEY'
      id: 48,
    },
  },
)
```

### Tags

To be able to easily find in the codebase where log has been done, add tags in metadata that will be searchable in Kibana.

Example of good tags: `transactions`, `instructions`, `profile selection`, `deposit`, `arbitration`...

```js
try {
  //do something
} catch (e) {
  logger.error(
    'Error happened!'
    {
      user: {
        email: 'julien.murgey@epsor.fr',
        firstname: 'Julien'
        lastname: 'MURGEY'
        id: 48,
      },
      tags: ['import', 'contribution'],
      errorStack: e.stack,
    }
  );
}
```
