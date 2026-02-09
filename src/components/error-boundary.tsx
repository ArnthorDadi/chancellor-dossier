import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-parchment-bg">
          {/* Subtle paper texture background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" 
                 style={{ 
                   backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)`,
                   backgroundSize: '40px 40px'
                 }}>
            </div>
          </div>

          <div className="relative z-10 border-4 border-fascist-red bg-white p-8 shadow-2xl max-w-md mx-4">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-12 h-12 bg-fascist-red border-2 border-noir-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">!</span>
              </div>
              
              <h2 className="font-special-elite text-xl text-fascist-red mb-4">
                SYSTEM ERROR
              </h2>
              
              <p className="font-courier text-sm text-noir-black/70 mb-6">
                The dossier system has encountered an error. Please refresh the page.
              </p>
              
              {this.state.error && (
                <div className="border-2 border-noir-black p-3 bg-vintage-cream mb-6">
                  <p className="font-courier text-xs text-noir-black/60 break-all">
                    Error: {this.state.error.message}
                  </p>
                </div>
              )}
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold px-6 py-3 border-2 border-noir-black transition-colors"
              >
                REFRESH PAGE
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}