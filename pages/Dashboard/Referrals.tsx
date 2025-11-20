import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from '../../services/mockBackend';
import { Copy } from 'lucide-react';

export const Referrals: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  // Calculate network (mock calculation for demo - mostly direct for now)
  // In a real backend this would be a recursive query. 
  // Here we just scan users who have this user's ID as referrer
  const users = getUsers();
  const directReferrals = users.filter(u => u.referrerId === user.id);
  
  const refLink = `${window.location.origin}/#/register?ref=${user.referralCode}`;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite & Earn</h2>
        <p className="text-gray-500 mb-6">Earn up to 5 levels deep! $5 - $4 - $3 - $2 - $1</p>
        
        <div className="flex items-center justify-center gap-2 max-w-lg mx-auto bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
          <code className="text-sm text-indigo-600 break-all">{refLink}</code>
          <button onClick={() => navigator.clipboard.writeText(refLink)} className="text-gray-500 hover:text-gray-900">
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-gray-900 mb-4">My Network (Direct)</h3>
          {directReferrals.length === 0 ? (
            <p className="text-gray-500 text-sm">No referrals yet.</p>
          ) : (
            <div className="space-y-3">
              {directReferrals.map(ref => (
                <div key={ref.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{ref.fullName}</p>
                    <p className="text-xs text-gray-500">{new Date(ref.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${ref.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100'}`}>
                    {ref.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-gray-900 mb-4">Commission Rates</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Level 1 (Direct)</span> <span className="font-bold text-green-600">$5.00</span></li>
            <li className="flex justify-between"><span>Level 2</span> <span className="font-bold text-green-600">$4.00</span></li>
            <li className="flex justify-between"><span>Level 3</span> <span className="font-bold text-green-600">$3.00</span></li>
            <li className="flex justify-between"><span>Level 4</span> <span className="font-bold text-green-600">$2.00</span></li>
            <li className="flex justify-between"><span>Level 5</span> <span className="font-bold text-green-600">$1.00</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};
