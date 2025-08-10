import * as Sentry from '@sentry/react';
import { FallbackRender } from '@sentry/react';
import { Button } from './ui/button';

// Create a fallback component that conforms to Sentry's FallbackRender type
export const ErrorFallback: FallbackRender = ({ 
  error, 
  eventId,
  resetError 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="w-full max-w-md p-6 rounded-lg border border-border shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">We've been notified about this issue and are working to fix it.</p>
        
        <div className="mb-4 p-3 bg-muted rounded-md overflow-auto max-h-32">
          <p className="font-mono text-sm">{String(error)}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <Button 
            onClick={resetError}
            variant="default"
          >
            Try again
          </Button>
          
          <Button 
            onClick={() => Sentry.showReportDialog({ eventId: eventId || undefined })}
            variant="outline"
          >
            Report feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
