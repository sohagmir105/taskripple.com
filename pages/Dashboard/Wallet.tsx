import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestWithdrawal } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';

export const Wallet: React.FC = () => {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState(0);
  const [binanceId, setBinanceId] = useState('');
  
  if (!user) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > user.balance) return alert('Insufficient funds');
    try {
      await requestWithdrawal(user.id, amount, binanceId);
      alert('Withdrawal requested!');
      setAmount(0);
      setBinanceId('');
    } catch (err) {
      alert('Failed to request withdrawal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <p className="text-indigo-100 font-medium mb-1">Total Balance</p>
        <h1 className="text-5xl font-bold">${user.balance.toFixed(2)}</h1>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Request Withdrawal</h3>
        <form onSubmit={handleWithdraw} className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input 
              type="number" 
              min="5" 
              step="0.01"
              className="w-full border rounded-lg p-3"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: $5.00</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Binance ID</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-3"
              value={binanceId}
              onChange={e => setBinanceId(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full py-3" disabled={amount <= 0 || !binanceId}>
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
