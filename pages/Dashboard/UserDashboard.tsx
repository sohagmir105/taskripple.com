import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTransactions, getSubmissions, getUserName } from '../../services/mockBackend';
import { AccountStatus, Transaction, TaskSubmission } from '../../types';
import { AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ tasksCompleted: 0, pendingTasks: 0 });

  useEffect(() => {
    if (!user) return;
    const txs = getTransactions().filter(t => t.userId === user.id).reverse().slice(0, 5);
    const subs = getSubmissions().filter(s => s.userId === user.id);
    
    setRecentTx(txs);
    setStats({
      tasksCompleted: subs.filter(s => s.status === 'APPROVED').length,
      pendingTasks: subs.filter(s => s.status === 'PENDING').length
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {user.status === AccountStatus.PENDING && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-yellow-800">Account Activation Required</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your account is currently pending. You must pay the $25 activation fee to unlock tasks and earning features.
            </p>
            <Link to="/activation" className="inline-block mt-2 text-sm font-bold text-yellow-900 underline">
              Activate Now &rarr;
            </Link>
          </div>
        </div>
      )}
      {user.status === AccountStatus.REVIEW && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 flex items-center gap-3">
          <Clock className="text-blue-600 w-6 h-6" />
          <div>
            <h3 className="font-bold text-blue-800">Activation Under Review</h3>
            <p className="text-sm text-blue-700">Admin is reviewing your payment. Please wait.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Balance</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">${user.balance.toFixed(2)}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Tasks Completed</h3>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.tasksCompleted}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Referral Code</h3>
          <div className="mt-2 text-xl font-mono font-bold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded">
            {user.referralCode}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentTx.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No transactions yet</td></tr>
              ) : (
                recentTx.map(tx => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 text-gray-900">
                      <div className="font-medium capitalize">{tx.type.replace('_', ' ')}</div>
                      {tx.metadata?.relatedUserId && (
                        <div className="text-xs text-gray-500">
                          From: {getUserName(tx.metadata.relatedUserId)}
                        </div>
                      )}
                      {tx.description && !tx.metadata?.relatedUserId && (
                        <div className="text-xs text-gray-500">{tx.description}</div>
                      )}
                    </td>
                    <td className={`px-6 py-4 font-bold ${
                      tx.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {tx.type === 'WITHDRAWAL' ? '-' : '+'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};