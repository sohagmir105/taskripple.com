import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitActivationPayment } from '../../services/mockBackend';
import { AccountStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Copy } from 'lucide-react';

export const Activation: React.FC = () => {
  const { user, setUser } = useAuth();
  const [binanceId, setBinanceId] = useState('');
  const [proofUrl, setProofUrl] = useState(''); // In real app this is file upload
  const [submitted, setSubmitted] = useState(false);
  
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitActivationPayment(user.id, binanceId, proofUrl);
      setSubmitted(true);
      // Optimistically update user state for UI
      setUser({ ...user, status: AccountStatus.REVIEW });
    } catch (err) {
      alert('Error submitting payment');
    }
  };

  if (user.status === AccountStatus.ACTIVE) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Account Active</h2>
        <p className="text-gray-600 mt-2">You are fully verified and can start earning!</p>
      </div>
    );
  }

  if (user.status === AccountStatus.REVIEW || submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Submission Received</h2>
        <p className="text-gray-600 mt-2">Admin will review your payment shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Activate Your Account</h2>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mb-8">
          <p className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">Payment Instructions</p>
          <p className="text-gray-700 mb-4">
            Please send exactly <strong className="text-gray-900">$25.00 USD</strong> to the Binance Pay ID below.
          </p>
          
          <div className="flex items-center gap-4 bg-white p-3 rounded border border-indigo-200">
            <span className="font-mono font-bold text-lg text-gray-800">123456789 (Binance Pay)</span>
            <button className="text-indigo-600 hover:text-indigo-800"><Copy size={18} /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Binance ID</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter your Binance ID"
              value={binanceId}
              onChange={e => setBinanceId(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proof Screenshot URL</label>
            <input 
              required
              type="url" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://..."
              value={proofUrl}
              onChange={e => setProofUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              *For this demo, paste any valid image URL (e.g., from unsplash or picsum)
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Submit Payment for Review
          </Button>
        </form>
      </div>
    </div>
  );
};
