import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../store/AuthContext';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiService.login({ email, password, mfaToken: mfaRequired ? mfaToken : undefined });
      
      if (data.mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      login(data.token, {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.firstName,
        last_name: data.user.lastName,
        role: data.user.role
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-calamity/10 text-calamity rounded-2xl mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-navy dark:text-white">Welcome Back</h1>
        <p className="text-warm-slate mt-2">Sign in to access your secure family roadmap.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {!mfaRequired ? (
            <>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <div className="p-3 bg-calamity/5 border border-calamity/20 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-calamity mt-0.5" />
                <p className="text-sm text-navy">
                  Two-factor authentication is enabled. Please enter the code from your authenticator app.
                </p>
              </div>
              <Input
                label="MFA Code"
                type="text"
                placeholder="000000"
                value={mfaToken}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMfaToken(e.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-navy text-white h-12"
            disabled={loading}
          >
            {loading ? 'Signing in...' : mfaRequired ? 'Verify & Login' : 'Sign In'}
            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-warm-slate">
          Don't have an account?{' '}
          <Link to="/register" className="text-calamity font-bold hover:underline">
            Create one for free
          </Link>
        </div>
      </Card>
      
      <div className="mt-8 p-4 bg-soft-sand/50 rounded-2xl border border-warm-slate/10 flex items-center gap-3">
        <Lock className="w-5 h-5 text-warm-slate" />
        <p className="text-xs text-warm-slate">
          Your data is protected by industry-standard encryption. We never sell your personal information.
        </p>
      </div>
    </div>
  );
};

export default Login;
