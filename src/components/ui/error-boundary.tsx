'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Bug } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode
  /** Custom fallback UI - if not provided, uses default ErrorFallback */
  fallback?: React.ReactNode
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /** Whether to show retry button */
  showRetry?: boolean
  /** Whether to show error details (dev mode) */
  showDetails?: boolean
  /** Custom error message */
  message?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'full'
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * ErrorBoundary - Catches JavaScript errors in child component tree
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomError />}>
 *   <SomeComponent />
 * </ErrorBoundary>
 * 
 * // With error callback
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }

    // TODO: Send to error monitoring service (Sentry, etc.)
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Use default ErrorFallback
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.props.showRetry !== false ? this.handleRetry : undefined}
          showDetails={this.props.showDetails}
          message={this.props.message}
          size={this.props.size}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback UI
 */
interface ErrorFallbackProps {
  error: Error | null
  errorInfo?: React.ErrorInfo | null
  onRetry?: () => void
  onGoHome?: () => void
  showDetails?: boolean
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  onGoHome,
  showDetails = process.env.NODE_ENV === 'development',
  message = 'Đã xảy ra lỗi không mong muốn',
  size = 'md',
}: ErrorFallbackProps) {
  const [showStack, setShowStack] = React.useState(false)

  const sizeClasses = {
    sm: 'py-6 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8',
    full: 'min-h-screen py-16 px-8',
  }

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    full: 'h-16 w-16',
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]}`}>
      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
        <AlertTriangle className={`${iconSizes[size]} text-red-600 dark:text-red-400`} />
      </div>

      {/* Title */}
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        Có lỗi xảy ra
      </h2>

      {/* Message */}
      <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        )}
        {onGoHome && (
          <Button
            variant="outline"
            onClick={onGoHome}
            className="gap-2 rounded-full"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        )}
      </div>

      {/* Error Details (Development) */}
      {showDetails && error && (
        <div className="mt-8 w-full max-w-2xl text-left">
          <button
            onClick={() => setShowStack(!showStack)}
            className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            <Bug className="h-4 w-4" />
            Chi tiết lỗi (Development)
            {showStack ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showStack && (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              {/* Error Name & Message */}
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                  {error.name}: {error.message}
                </p>
              </div>

              {/* Stack Trace */}
              {error.stack && (
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                  {error.stack}
                </pre>
              )}

              {/* Component Stack */}
              {errorInfo?.componentStack && (
                <div>
                  <p className="mb-1 text-xs font-medium text-red-700 dark:text-red-400">
                    Component Stack:
                  </p>
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * withErrorBoundary - HOC to wrap component with ErrorBoundary
 * 
 * Usage:
 * ```tsx
 * const SafeComponent = withErrorBoundary(DangerousComponent, {
 *   message: 'Failed to load component',
 * })
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}

export default ErrorBoundary
