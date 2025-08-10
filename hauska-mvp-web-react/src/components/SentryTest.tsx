import { useState } from 'react';
import { Button } from './ui/button';
import * as sentryUtils from '../lib/sentry';

export function SentryTest() {
  const [count, setCount] = useState(0);

  const triggerError = () => {
    try {
      // This will cause an error
      throw new Error('This is a test error for Sentry!');
    } catch (error) {
      // Capture the error with Sentry
      sentryUtils.captureException(error, {
        testData: 'Manual error test',
        count
      });
      
      // Inform the user
      alert('Error sent to Sentry!');
    }
  };

  const triggerMessage = () => {
    // Send a test message to Sentry
    sentryUtils.captureMessage('This is a test message from the app', 'info', {
      testData: 'Manual message test',
      count
    });
    
    // Inform the user
    alert('Message sent to Sentry!');
  };

  const triggerUnhandledError = () => {
    // This will cause an unhandled error that should be caught by the ErrorBoundary
    const obj = null;
    // @ts-ignore - intentional error
    obj.nonExistentMethod();
  };

  const triggerAsyncError = () => {
    // Test async error tracking
    sentryUtils.withMonitoring(
      'test.asyncOperation',
      async () => {
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Then throw an error
        throw new Error('Async operation failed');
      },
      { testType: 'async', count }
    ).catch(() => {
      // Inform the user
      alert('Async error sent to Sentry!');
    });
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm space-y-4">
      <h2 className="text-xl font-bold">Sentry Test Panel</h2>
      <p className="text-sm text-muted-foreground">Use these buttons to test Sentry integration</p>
      
      <div className="flex flex-col gap-2">
        <Button onClick={() => setCount(c => c + 1)} variant="outline">
          Increment counter: {count}
        </Button>
        
        <Button onClick={triggerError} variant="destructive">
          Trigger Handled Error
        </Button>
        
        <Button onClick={triggerUnhandledError} variant="destructive">
          Trigger Unhandled Error
        </Button>
        
        <Button onClick={triggerAsyncError} variant="destructive">
          Trigger Async Error
        </Button>
        
        <Button onClick={triggerMessage} variant="secondary">
          Send Test Message
        </Button>
      </div>
    </div>
  );
}
