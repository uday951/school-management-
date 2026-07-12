import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { LoginInputSchema, LoginInput } from '@mahathi/validation';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema as any),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    const resolveToast = toast.loading('Authenticating credentials...');
    
    try {
      const response = await axios.post('/api/v1/auth/login', data);
      const token = response.data?.data?.accessToken;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.data?.data?.user));
        toast.dismiss(resolveToast);
        toast.success('Successfully logged in.');
        navigate('/dashboard');
      } else {
        throw new Error('Token was not returned by API server.');
      }
    } catch (err: any) {
      toast.dismiss(resolveToast);
      const message = err.response?.data?.error?.message || err.message || 'Login failed.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">Welcome back</h3>
        <p className="text-[11px] text-slate-400 font-medium">Enter your credentials to access your academic schedule.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          placeholder="coordinator@lincoln.com"
          error={errors.email?.message?.toString()}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message?.toString()}
          {...register('password')}
        />

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="text-center text-[10px] text-slate-400 font-medium border-t border-slate-900 pt-4">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:underline font-bold">
          Register School
        </Link>
      </div>
    </div>
  );
};
export default Login;
