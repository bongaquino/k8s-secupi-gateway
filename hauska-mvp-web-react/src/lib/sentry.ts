import * as Sentry from '@sentry/react';

/**
 * Capture an exception with Sentry
 * @param error The error to capture
 * @param context Additional context to include with the error
 */
export const captureException = (error: unknown, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    contexts: context ? { additionalContext: context } : undefined,
  });
};

/**
 * Capture a message with Sentry
 * @param message The message to capture
 * @param level The severity level of the message
 * @param context Additional context to include with the message
 */
export const captureMessage = (
  message: string, 
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  Sentry.captureMessage(message, {
    level,
    contexts: context ? { additionalContext: context } : undefined,
  });
};

/**
 * Set user information for Sentry
 * @param user User information to set
 */
export const setUser = (user: { id?: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

/**
 * Clear user information from Sentry
 */
export const clearUser = () => {
  Sentry.setUser(null);
};

/**
 * Set a tag for the current scope
 * @param key Tag key
 * @param value Tag value
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Add breadcrumb to the current scope
 * @param breadcrumb The breadcrumb to add
 */
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Monitor performance of a function or operation
 * @param name Operation name to track
 * @param operation Function to monitor
 * @param data Additional data to include
 */
export const withMonitoring = async <T>(name: string, operation: () => Promise<T>, data?: Record<string, any>): Promise<T> => {
  const startTime = performance.now();
  try {
    // Add a breadcrumb at the start of the operation
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Starting ${name}`,
      level: 'info',
      data
    });

    // Execute the operation
    const result = await operation();
    
    // Calculate duration and add a breadcrumb for successful completion
    const duration = performance.now() - startTime;
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Completed ${name}`,
      level: 'info',
      data: { ...data, durationMs: Math.round(duration) }
    });
    
    return result;
  } catch (error) {
    // Calculate duration and capture the exception with performance data
    const duration = performance.now() - startTime;
    Sentry.captureException(error, {
      tags: { operation: name },
      extra: { ...data, durationMs: Math.round(duration) }
    });
    throw error;
  }
};

export default {
  captureException,
  captureMessage,
  setUser,
  clearUser,
  setTag,
  addBreadcrumb,
  withMonitoring,
};
