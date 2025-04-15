
import { useToast } from './use-toast';

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: any) => {
    const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
    
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });

    if (error?.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/auth';
    }

    return message;
  };

  return { handleError };
}
