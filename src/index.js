import winston from 'winston';
import ElasticsearchTransport from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

const useElasticsearch =
  process.env.ELASTICSEARCH_URL &&
  process.env.ELASTICSEARCH_USER &&
  process.env.ELASTICSEARCH_PASSWORD &&
  process.env.SERVICE_NAME &&
  process.env.ENVIRONMENT;

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

const logger = winston.createLogger({
  level: 'info',
  transports: [
    ...(!isTest
      ? [new winston.transports.Console()]
      : [new winston.transports.File({ filename: '/dev/null' })]),
    ...(useElasticsearch ? [new ElasticsearchTransport(esTransportOptions)] : []),
  ],
});

if (!useElasticsearch) {
  logger.info(
    'Logs are not sent to Elasticsearch. Ensure all the required envrionment variables are set.',
  );
}

export default logger;
