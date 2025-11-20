import React, { useEffect, useState } from 'react';
import { getTransactions, approveActivation, rejectActivation, getUserName } from '../../services/mockBackend';
import { Transaction, TransactionType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Check, X } from 'lucide-react';

export const ManageDeposits: React.FC = () => {
  const [txs, setTxs] = useState<Transaction[]>([]);

  const load = () => {
    setTxs(getTransactions().filter(t => t.type === TransactionType.DEPOSIT && t.status === 'PENDING'));
  };

  useEffect(load, []);

  const handleApprove = async (id: string) => {
    try {
      await approveActivation(id);
      load();
    } catch (e) { alert('Error approving'); }
  };

  const handleReject = async (id: string) => {
    await rejectActivation(id);
    load();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold">Pending Activation Payments</h2>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-6 py-3">User</th>
            <th className="px-6 py-3">Binance ID</th>
            <th className="px-6 py-3">Proof</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {txs.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">No pending deposits</td></tr> :
            txs.map(tx => (
              <tr key={tx.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{getUserName(tx.userId)}</div>
                  <div className="text-xs text-gray-500 font-mono">{tx.userId}</div>
                </td>
                <td className="px-6 py-4 font-bold">{tx.metadata?.binanceId}</td>
                <td className="px-6 py-4">
                  <a href={tx.metadata?.proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Proof</a>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(tx.id)} className="bg-green-600 hover:bg-green-700">
                    <Check size={16} className="mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleReject(tx.id)}>
                    <X size={16} />
                  </Button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};