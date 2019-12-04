import winston from 'winston';
import ElasticsearchTransport from 'winston-elasticsearch';
import SentryTransport from 'winston-sentry-raven-transport';
import { consoleFormat } from 'winston-console-format';
import { Client } from '@elastic/elasticsearch';

const useElasticsearch =
  process.env.ELASTICSEARCH_URL &&
  process.env.ELASTICSEARCH_USER &&
  process.env.ELASTICSEARCH_PASSWORD &&
  process.env.SERVICE_NAME &&
  process.env.ENVIRONMENT;

const useSentry = process.env.SENTRY_DSN && process.env.SERVICE_NAME && process.env.ENVIRONMENT;

const isTest = process.env.NODE_ENV === 'test';

const esClient = new Client({
  node: `https://${process.env.ELASTICSEARCH_USER}:${process.env.ELASTICSEARCH_PASSWORD}@${process.env.ELASTICSEARCH_URL}`,
  maxRetries: 5,
  requestTimeout: 30000,
});

const esTransportOptions = {
  level: 'info',
  client: esClient,
  transformer: ({
    timestamp = new Date().toISOString(),
    level,
    message,
    meta: { user, ...meta },
  }) => {
    return {
      '@timestamp': timestamp,
      severity: level,
      message,
      user: user && {
        email: user.email,
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      fields: meta,
      service: process.env.SERVICE_NAME,
      environment: process.env.ENVIRONMENT,
    };
  },
};

const sentryTransportOptions = {
  dsn: process.env.SENTRY_DSN,
  name: 'winston-sentry',
  logger: 'winston-sentry',
  server_name: process.env.SERVICE_NAME,
  environment: process.env.ENVIRONMENT,
  level: 'error',
  install: true,
  config: {
    captureUnhandledRejections: true,
  },
};

const logger = winston.createLogger({
  level: 'info',
  transports: [
    ...(!isTest
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize({ all: true }),
              winston.format.padLevels(),
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              consoleFormat({
                showMeta: true,
                metaStrip: ['service'],
                inspectOptions: {
                  depth: Infinity,
                  colors: true,
                  maxArrayLength: Infinity,
                  breakLength: 120,
                  compact: Infinity,
                },
              }),
            ),
          }),
        ]
      : [new winston.transports.File({ filename: '/dev/null' })]),
    ...(useElasticsearch ? [new ElasticsearchTransport(esTransportOptions)] : []),
    ...(!isTest && useSentry ? [new SentryTransport(sentryTransportOptions)] : []),
  ],
});

if (!useElasticsearch) {
  logger.info(
    'Logs are not sent to Elasticsearch. Ensure all the required environment variables are set.',
  );
}

if (!useSentry) {
  logger.info(
    'Logs are not sent to Sentry. Ensure all the required environment variables are set.',
  );
}

export default logger;
