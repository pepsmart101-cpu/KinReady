import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../store/AuthContext';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      await apiService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      setIsRegistered(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-sage/10 text-sage rounded-full mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-navy dark:text-white mb-4">Check Your Email</h1>
        <p className="text-warm-slate text-lg mb-8">
          We've sent a verification link to <strong>{formData.email}</strong>. Please verify your email to continue.
        </p>
        <Button onClick={() => navigate('/login')} className="bg-navy text-white px-8">
          Go to Login
        </Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sage/10 text-sage rounded-2xl mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-navy dark:text-white">Create Your Account</h1>
        <p className="text-warm-slate mt-2">Join KinReady and start your path to peace of mind.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange}
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className="text-xs text-warm-slate flex items-start gap-2 py-2">
            <CheckCircle2 className="w-4 h-4 text-sage flex-shrink-0" />
            <span>
              By clicking "Create Account", you agree to our Terms of Service and Privacy Policy.
            </span>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-navy text-white h-12"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-warm-slate">
          Already have an account?{' '}
          <Link to="/login" className="text-calamity font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
