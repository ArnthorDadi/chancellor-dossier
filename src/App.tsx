import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const USERNAME_KEY = 'secret-hitler-username'

  useEffect(() => {
    const storedUsername = localStorage.getItem(USERNAME_KEY)
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  useEffect(() => {
    if (username) {
      localStorage.setItem(USERNAME_KEY, username)
    } else {
      localStorage.removeItem(USERNAME_KEY)
    }
  }, [username])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('username') as HTMLInputElement;
    if (input.value.trim()) {
      setUsername(input.value.trim())
    }
  }

  const handleSignOut = () => {
    setUsername(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">
          Chancellor Dossier
        </h1>

        {username ? (
          <div className="space-y-4">
            <p className="text-xl text-slate-700 dark:text-slate-300">
              Welcome, <span className="font-semibold">{username}</span>!
            </p>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="flex flex-col items-center gap-4">
            <Input
              type="text"
              name="username"
              placeholder="Enter your username"
              className="max-w-xs text-center"
              required
            />
            <Button type="submit">Sign In as Guest</Button>
          </form>
        )}

        <p className="text-slate-600 dark:text-slate-400 mt-8">
          Tailwind CSS and shadcn/ui are successfully installed!
        </p>
        <div className="flex gap-4 justify-center">
          <Button>Click me</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>
    </div>
  )
}

export default App
