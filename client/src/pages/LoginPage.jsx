import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password, displayName || username);
        toast.success('Welcome to TV Time! 🎬');
      } else {
        await login(username, password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#000',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          {/* TV Time logo-like icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: '#F5C518',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <polyline points="17 2 12 7 7 2"/>
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>
            TV Time
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
            Track every episode. Never lose your place.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {isRegister && (
            <div>
              <label style={{ color: '#888', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Display Name
              </label>
              <input
                id="displayname-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name (optional)"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label style={{ color: '#888', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="input-field"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label style={{ color: '#888', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
                style={{ paddingRight: 48 }}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="submit-btn"
            type="submit"
            disabled={loading}
            className="btn-yellow"
            style={{ marginTop: 8, width: '100%' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }}
                />
                {isRegister ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'
            )}
          </button>
        </motion.form>

        {/* Switch mode */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: 24, color: '#888', fontSize: 14 }}
        >
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            id="switch-mode-btn"
            type="button"
            onClick={() => setIsRegister((p) => !p)}
            style={{ color: '#F5C518', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </motion.p>
      </div>
    </div>
  );
}
