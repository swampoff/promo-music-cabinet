/**
 * ERROR BOUNDARY
 * Перехватывает ошибки React компонентов
 */

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Что-то пошло не так
          </h2>
          <p className="text-gray-400 mb-4 max-w-md">
            Произошла ошибка при загрузке компонента. Попробуйте обновить страницу.
          </p>
          {this.state.error && (
            <details className="mb-4 text-left max-w-md">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                Подробности ошибки
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 rounded text-xs text-red-400 overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <Button onClick={this.handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Функциональный хук для перехвата ошибок
export function useErrorHandler() {
  const handleError = (error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error(`[${context || 'Error'}]:`, errorMessage);

    // Можно добавить отправку в аналитику
    // analytics.trackError(errorMessage, context);
  };

  return { handleError };
}

export default ErrorBoundary;
