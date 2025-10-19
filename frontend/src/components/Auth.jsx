import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-primary-500 to-secondary-500">
      <div className="bg-white rounded-[20px] p-12 w-full max-w-md shadow-2xl animate-slideUp">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {isLogin ? 'Welcome Back! 👋' : 'Create Account 🎨'}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isLogin 
            ? 'Sign in to continue generating fursonas' 
            : 'Join us and start creating amazing fursonas'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-semibold text-gray-800 text-sm">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required={!isLogin}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-semibold text-gray-800 text-sm">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-semibold text-gray-800 text-sm">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg animate-shake">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="mt-4 px-4 py-3 text-lg font-bold rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-8 text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-primary-500 font-bold underline hover:text-secondary-500 transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
