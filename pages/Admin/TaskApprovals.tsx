import React, { useEffect, useState } from 'react';
import { getSubmissions, getTasks, approveSubmission, rejectSubmission, getUserName } from '../../services/mockBackend';
import { TaskSubmission, Task, SubmissionStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Check, X, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';

export const TaskApprovals: React.FC = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadData = () => {
    const allSubmissions = getSubmissions();
    // Filter for PENDING only
    setSubmissions(allSubmissions.filter(s => s.status === SubmissionStatus.PENDING));
    setTasks(getTasks());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveSubmission(id);
      loadData();
    } catch (e) {
      alert('Error approving submission');
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Reject this submission?')) {
        await rejectSubmission(id);
        loadData();
    }
  };

  const getTaskTitle = (id: string) => tasks.find(t => t.id === id)?.title || 'Unknown Task';
  const getTaskReward = (id: string) => tasks.find(t => t.id === id)?.reward || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pending Task Approvals</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Reward</th>
                <th className="px-6 py-3 font-medium">Proof</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No pending submissions.</td></tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                        {getUserName(sub.userId)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                        {getTaskTitle(sub.taskId)}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                        ${getTaskReward(sub.taskId).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                            {sub.textProof && (
                                <div className="flex items-start gap-2 text-gray-600 text-xs bg-gray-100 p-2 rounded max-w-xs">
                                    <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                    <span className="break-words line-clamp-2" title={sub.textProof}>{sub.textProof}</span>
                                </div>
                            )}
                            {sub.imageProofUrl && (
                                <a href={sub.imageProofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs font-medium">
                                    <ImageIcon size={14} /> View Image <ExternalLink size={12} />
                                </a>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => handleApprove(sub.id)} className="bg-green-600 hover:bg-green-700" title="Approve">
                                <Check size={16} />
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(sub.id)} title="Reject">
                                <X size={16} />
                            </Button>
                        </div>
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