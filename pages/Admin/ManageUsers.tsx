import React, { useState, useEffect } from 'react';
import { User, UserRole, AccountStatus } from '../../types';
import { getUsers, updateUserStatus, updateUserRole } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { Search, Shield, ShieldAlert, Ban, CheckCircle } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleStatusChange = (userId: string, newStatus: AccountStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
        updateUserStatus(userId, newStatus);
        loadUsers();
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
     if (window.confirm(`Are you sure you want to change role to ${newRole}?`)) {
        updateUserRole(userId, newRole);
        loadUsers();
     }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="border rounded-lg px-3 py-2 bg-white"
                value={filterRole}
                onChange={e => setFilterRole(e.target.value as any)}
            >
                <option value="ALL">All Roles</option>
                <option value={UserRole.USER}>Users</option>
                <option value={UserRole.ADMIN}>Admins</option>
            </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
                <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Balance</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                <tr key={user.id}>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {user.fullName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{user.fullName}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        {user.role === UserRole.ADMIN ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">
                                <Shield className="w-3 h-3" /> ADMIN
                            </span>
                        ) : (
                             <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                                USER
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            user.status === AccountStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                            user.status === AccountStatus.BANNED ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {user.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                        ${user.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            {/* Role Toggle */}
                            {user.role === UserRole.USER ? (
                                <Button size="sm" variant="outline" onClick={() => handleRoleChange(user.id, UserRole.ADMIN)} title="Promote to Admin">
                                    <Shield className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleRoleChange(user.id, UserRole.USER)} title="Demote to User">
                                    <ShieldAlert className="w-4 h-4" />
                                </Button>
                            )}

                            {/* Ban Toggle */}
                            {user.status === AccountStatus.BANNED ? (
                                <Button size="sm" variant="secondary" onClick={() => handleStatusChange(user.id, AccountStatus.ACTIVE)} title="Unban User">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                            ) : (
                                <Button size="sm" variant="secondary" onClick={() => handleStatusChange(user.id, AccountStatus.BANNED)} title="Ban User">
                                    <Ban className="w-4 h-4 text-red-600" />
                                </Button>
                            )}
                        </div>
                    </td>
                </tr>
                ))}
                 {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found matching your criteria.</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};