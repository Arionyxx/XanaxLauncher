'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-base-100">
          <div className="card bg-base-200 shadow-xl max-w-md">
            <div className="card-body text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-error mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-base-content/70 mb-4">
                The application encountered an unexpected error. Don't worry,
                your data is safe.
              </p>
              {this.state.error && (
                <div className="alert alert-error mb-4">
                  <p className="text-xs font-mono break-all text-left">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="card-actions justify-center gap-2">
                <button className="btn btn-primary" onClick={this.handleReload}>
                  Reload Application
                </button>
                <button className="btn btn-ghost" onClick={this.handleReset}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
