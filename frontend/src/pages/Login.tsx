import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Building2, Eye, EyeOff } from 'lucide-react'
import { login } from '../api'

const loginSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(1, 'Lösenord krävs'),
})

type LoginForm = z.infer<typeof loginSchema>

interface LoginProps {
  onLogin: (user: { name: string; email: string; role: string }) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'info@hemsolutions.se',
      password: 'Mzeeshan786',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      const response = await login(data.email, data.password)
      
      // Store token and user
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Call onLogin with user data
      onLogin({
        name: response.user.name || response.user.email.split('@')[0],
        email: response.user.email,
        role: response.user.role,
      })
    } catch (err) {
      setError('Felaktig e-post eller lösenord. Försök igen.')
      console.error('Login error:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">HemSolutions</CardTitle>
          <CardDescription>Logga in för att hantera dina fakturor och kunder</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="info@hemsolutions.se"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Loggar in...' : 'Logga in'}
            </Button>
          </form>
          
          {/* Role selector for demo */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Snabbinloggning (demo)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onLogin({ name: 'Admin', email: 'info@hemsolutions.se', role: 'admin' });
                }}
                className="px-2 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogin({ name: 'Johan Andersson', email: 'johan@hemsolutions.se', role: 'employee' });
                }}
                className="px-2 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Medarbetare
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogin({ name: 'Maria Larsson', email: 'maria@example.com', role: 'customer' });
                }}
                className="px-2 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                Kund
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
