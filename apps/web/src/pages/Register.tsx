import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { RegisterInputSchema, RegisterInput } from '@mahathi/validation';
import { Input } from '../components/shared/Input';
import { Select } from '../components/shared/Select';
import { Button } from '../components/shared/Button';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema as any),
    defaultValues: {
      role: 'SCHOOL_ADMIN',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    const resolveToast = toast.loading('Registering institution portal...');
    
    try {
      await axios.post('/api/v1/auth/register', data);
      toast.dismiss(resolveToast);
      toast.success(`Verification link sent to: ${data.email}`);
      navigate('/login');
    } catch (err: any) {
      toast.dismiss(resolveToast);
      const message = err.response?.data?.error?.message || err.message || 'Registration failed.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'SCHOOL_ADMIN', label: 'School Administrator' },
    { value: 'PRINCIPAL', label: 'Principal' },
    { value: 'COORDINATOR', label: 'Timetable Coordinator' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'STUDENT', label: 'Student' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">Create school portal</h3>
        <p className="text-[11px] text-slate-400 font-medium">Join the next-gen AI timetable automation engine.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            error={(errors.profile as any)?.firstName?.message?.toString()}
            {...register('profile.firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={(errors.profile as any)?.lastName?.message?.toString()}
            {...register('profile.lastName')}
          />
        </div>

        <Input
          label="Email address"
          placeholder="admin@school.com"
          error={errors.email?.message?.toString()}
          {...register('email')}
        />

        <Input
          label="School Name"
          placeholder="Lincoln Academy"
          error={errors.schoolName?.message?.toString()}
          {...register('schoolName')}
        />

        <Select
          label="Your Role"
          options={roleOptions}
          error={errors.role?.message?.toString()}
          {...register('role')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message?.toString()}
          {...register('password')}
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <div className="text-center text-[10px] text-slate-400 font-medium border-t border-slate-900 pt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:underline font-bold">
          Sign In
        </Link>
      </div>
    </div>
  );
};
export default Register;
