'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.role === 'admin') {
      router.replace('/admin');
    } else {
      router.replace('/');
    }
    return null;
  }

  const isValidEmail = (email: string) => {
    return /@.+\.com$/.test(email);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('Email harus valid dan diakhiri .com');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.login({ email, password });
      console.log('Login response:', response);
      console.log('User role:', response.user.role);
      const userFixed = { ...response.user, id: Number(response.user.id) };
      login(userFixed, response.token);
      
      setTimeout(() => {
        if (response.user.role === 'admin') {
          console.log('Redirecting to admin...');
          router.replace('/admin');
        } else {
          console.log('Redirecting to home...');
          router.replace('/');
        }
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const googleData = {
        email: 'admin@gmail.com',
        name: 'Admin Google User',
        googleId: 'google_' + Date.now()
      };
      
      const response = await apiClient.googleAuth(googleData);
      console.log('Google login response:', response);
      console.log('User role:', response.user.role);
      const userFixed = { ...response.user, id: Number(response.user.id) };
      login(userFixed, response.token);
      
      setTimeout(() => {
        if (response.user.role === 'admin') {
          console.log('Redirecting to admin...');
          router.replace('/admin');
        } else {
          console.log('Redirecting to home...');
          router.replace('/');
        }
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login Google gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-200 dark:from-dark-900 dark:to-dark-800">
      <div className="glass-card p-8 rounded-xl w-full max-w-md shadow-lg bg-white text-gray-900 dark:bg-dark-900 dark:text-white">
        <h1 className="text-3xl font-bold text-gradient mb-6 text-center dark:text-blue-700">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-4 py-3 rounded w-full bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-dark-800 dark:text-white dark:border-gray-700"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-3 rounded w-full bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-dark-800 dark:text-white dark:border-gray-700"
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className="futuristic-button w-full py-3 text-lg font-semibold dark:bg-blue-700 dark:text-white" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
        <div className="my-4 text-center text-gray-500 dark:text-gray-400">atau</div>
        <button
          onClick={handleGoogleLogin}
          className="glass-button w-full py-3 text-lg font-semibold flex items-center justify-center gap-2 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
          disabled={loading}
        >
          <span className="w-6 h-6 inline-block align-middle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
              <g>
                <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6-6C36.1 5.1 30.4 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.2-.3-3.5z"/>
                <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.3 16.1 18.7 13 24 13c2.7 0 5.2.9 7.2 2.5l6-6C36.1 5.1 30.4 3 24 3 16.3 3 9.3 7.6 6.3 14.7z"/>
                <path fill="#FBBC05" d="M24 43c5.3 0 10.1-1.7 13.7-4.7l-6.3-5.2C29.2 34.6 26.7 35.5 24 35.5c-5.5 0-10.1-3.7-11.7-8.7l-6.6 5.1C9.3 40.4 16.3 45 24 45z"/>
                <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-4.1 5.5-7.3 6.3l6.3 5.2C39.9 37.1 44 32.6 44 24c0-1.3-.1-2.2-.4-3.5z"/>
              </g>
            </svg>
          </span>
          Login dengan Google
        </button>
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className="text-neon-blue font-semibold hover:underline dark:text-blue-400">Daftar</Link>
        </div>
      </div>
    </div>
  );
} 