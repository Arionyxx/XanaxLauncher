'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@nextui-org/react'

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
        <div className="flex items-center justify-center min-h-screen bg-base">
          <div className="max-w-md p-8 bg-surface0 rounded-lg border border-surface1 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-subtext0 mb-4">
              The application encountered an unexpected error. Don't worry, your
              data is safe.
            </p>
            {this.state.error && (
              <div className="mb-4 p-3 bg-mantle rounded text-left">
                <p className="text-xs text-subtext1 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button color="primary" onPress={this.handleReload}>
                Reload Application
              </Button>
              <Button color="default" variant="flat" onPress={this.handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
