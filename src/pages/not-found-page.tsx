import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
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

      <div className="relative z-10 border-4 border-noir-black bg-white p-8 shadow-2xl max-w-md mx-4">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="w-16 h-16 bg-liberal-blue border-2 border-noir-black rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">404</span>
          </div>
          
          <h2 className="font-special-elite text-2xl text-liberal-blue mb-4">
            FILE NOT FOUND
          </h2>
          
          <p className="font-courier text-sm text-noir-black/70 mb-6">
            The requested dossier could not be located in our archives.
          </p>
          
          <Link 
            to="/"
            className="inline-block w-full bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold px-6 py-3 border-2 border-noir-black transition-colors text-center"
          >
            RETURN TO HEADQUARTERS
          </Link>
        </div>
      </div>
    </div>
  )
}