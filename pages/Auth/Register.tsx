import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', referralCode: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        passwordHash: formData.password,
        referrerId: formData.referralCode || undefined
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join TaskRipple today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="w-full px-3 py-2 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Phone Number"
            className="w-full px-3 py-2 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            name="referralCode"
            placeholder="Referral Code (Optional)"
            className="w-full px-3 py-2 border rounded-lg"
            onChange={handleChange}
          />
          <Button type="submit" className="w-full py-3">Register</Button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-indigo-600 text-sm hover:underline">Already have an account? Log In</Link>
        </div>
      </div>
    </div>
  );
};
