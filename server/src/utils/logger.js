const pino = require('pino');
const pinoHttp = require('pino-http');
const env = require('../config/validateEnv');

// Only use pino-pretty if it's actually installed (dev only — excluded in prod by npm ci --omit=dev)
let pinoPrettyAvailable = false;
try {
    require.resolve('pino-pretty');
    pinoPrettyAvailable = true;
} catch (_) {
    // pino-pretty not installed — production JSON logging mode
}

const usePretty = pinoPrettyAvailable && env.NODE_ENV !== 'production';

const logger = pino({
    level: env.LOG_LEVEL || (env.NODE_ENV === 'production' ? 'info' : 'debug'),
    ...(usePretty
        ? {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    ignore: 'pid,hostname',
                    translateTime: 'SYS:HH:MM:ss',
                },
            },
        }
        : {}),
});

const httpLogger = pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
});

module.exports = { logger, httpLogger };
