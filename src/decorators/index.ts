import { Logger } from '../core/Logger';
import { LogOptions } from '../types';

export function LogClass(logger: Logger, metadata?: Record<string, any>) {
  return function decorate(target: any) {
    return class extends target {
      constructor(...args: any[]) {
        super(...args);
      }
      _logger = logger;
      _originalClass = target;
      _metadata = metadata;
    };
  };
}

export function LogSync(options: LogOptions = {}) {
  return function decorate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = propertyKey;

    descriptor.value = function (...args: any[]) {
      const logger: Logger | undefined = (this as any)._logger;
      if (!logger) {
        console.warn('No logger found in class instance');
        return originalMethod.apply(this, args);
      }

      const classMetadata = (this as any)._metadata || {};
      const metadata = {
        ...classMetadata,
        ...options.metadata,
        method: `${(this as any)._originalClass.name}.${methodName}`,
        args,
      };

      if (options.logStart) {
        logger.debug(
          `Starting ${(this as any)._originalClass.name}.${methodName}`,
          { args },
          metadata
        );
      }

      try {
        const result = originalMethod.apply(this, args);

        if (options.logFinish) {
          logger.debug(
            `Finished ${(this as any)._originalClass.name}.${methodName}`,
            { result },
            metadata
          );
        }

        return result;
      } catch (error) {
        if (options.logError) {
          const errorData = options.errorHandler ? options.errorHandler(error) : error;
          logger.error(
            `Error in ${(this as any)._originalClass.name}.${methodName}`,
            errorData,
            metadata
          );
        }
        throw error;
      }
    };

    return descriptor;
  };
}

export function LogAsync(options: LogOptions = {}) {
  return function decorate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = propertyKey;

    descriptor.value = async function (...args: any[]) {
      const logger: Logger | undefined = (this as any)._logger;
      if (!logger) {
        console.warn('No logger found in class instance');
        return await originalMethod.apply(this, args);
      }

      const classMetadata = (this as any)._metadata || {};
      const metadata = {
        ...classMetadata,
        ...options.metadata,
        method: `${(this as any)._originalClass.name}.${methodName}`,
        args,
      };

      if (options.logStart) {
        logger.debug(
          `Starting ${(this as any)._originalClass.name}.${methodName}`,
          { args },
          metadata
        );
      }

      try {
        const result = await originalMethod.apply(this, args);

        if (options.logFinish) {
          logger.debug(
            `Finished ${(this as any)._originalClass.name}.${methodName}`,
            { result },
            metadata
          );
        }

        return result;
      } catch (error) {
        if (options.logError) {
          const errorData = options.errorHandler ? options.errorHandler(error) : error;
          logger.error(
            `Error in ${(this as any)._originalClass.name}.${methodName}`,
            errorData,
            metadata
          );
        }
        throw error;
      }
    };

    return descriptor;
  };
}
