import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const AuthPage = () => {
  const [error, setError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const { login, register: registerUser } = useAuthStore(state => ({ login: state.login, register: state.register }))
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const authSchema = z.object({
    username: z.string().min(1, t('auth.login.error.usernameRequired')),
    password: z.string().min(6, t('auth.login.error.passwordRequired'))
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema)
  })

  const onSubmit = async (data: z.infer<typeof authSchema>) => {
    try {
      if (isRegistering) {
        await registerUser(data.username, data.password)
      } else {
        await login(data.username, data.password)
      }
      navigate('/')
    } catch (err) {
      setError(isRegistering ? t('auth.register.error') : t('auth.login.error'))
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering)
    setError(null)
    reset()
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isRegistering ? t('auth.register.title') : t('auth.login.title')}
        </h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              {t('auth.login.username')}
            </label>
            <input
              type="text"
              id="username"
              {...register('username')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('auth.login.password')}
            </label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isRegistering ? t('auth.register.submit') : t('auth.login.submit')}
            </button>

            <button
              type="button"
              onClick={toggleMode}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isRegistering ? t('auth.register.switchToLogin') : t('auth.register.switchToRegister')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthPage 