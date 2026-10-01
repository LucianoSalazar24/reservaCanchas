import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6 an">
            <div className="text-5xl">⚽</div>
            <h2 className="text-xl font-bold text-slate-800">Algo salió mal</h2>
            <p className="text-slate-500 text-sm max-w-sm">{this.state.error.message}</p>
            <button
              className="btn btn-outline"
              onClick={() => this.setState({ error: null })}
            >
              Reintentar
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
