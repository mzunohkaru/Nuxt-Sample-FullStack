import winston from "winston";

const logLevel = process.env.LOG_LEVEL || "info";
const isDevelopment = process.env.NODE_ENV === "development";

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "nuxt-api" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

if (isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    })
  );
}

export interface LogContext {
  userId?: number;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

export class Logger {
  static info(message: string, context?: LogContext) {
    logger.info(message, context);
  }

  static warn(message: string, context?: LogContext) {
    logger.warn(message, context);
  }

  static error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorInfo =
      error instanceof Error
        ? { error: error.message, stack: error.stack }
        : { error };

    logger.error(message, { ...context, ...errorInfo });
  }

  static debug(message: string, context?: LogContext) {
    logger.debug(message, context);
  }

  static http(message: string, context?: LogContext) {
    logger.http(message, context);
  }

  static logApiRequest(event: any, additionalContext?: LogContext) {
    const method = getMethod(event);
    const url = getRequestURL(event);
    const userAgent = getHeader(event, "user-agent");
    const ip = getClientIP(event);

    this.http(`${method} ${url.pathname}`, {
      method,
      url: url.toString(),
      userAgent,
      ip,
      ...additionalContext,
    });
  }

  static logApiResponse(
    event: any,
    statusCode: number,
    duration: number,
    additionalContext?: LogContext
  ) {
    const method = getMethod(event);
    const url = getRequestURL(event);

    this.http(`${method} ${url.pathname} - ${statusCode} (${duration}ms)`, {
      method,
      url: url.toString(),
      statusCode,
      duration,
      ...additionalContext,
    });
  }

  static logError(
    event: any,
    error: Error | unknown,
    additionalContext?: LogContext
  ) {
    const method = getMethod(event);
    const url = getRequestURL(event);
    const userAgent = getHeader(event, "user-agent");
    const ip = getClientIP(event);

    this.error(`API Error: ${method} ${url.pathname}`, error, {
      method,
      url: url.toString(),
      userAgent,
      ip,
      ...additionalContext,
    });
  }
}

export default Logger;
