import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTasks, getSubmissions, submitTask } from '../../services/mockBackend';
import { Task, TaskSubmission, AccountStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Lock, Filter, ArrowUpDown } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { user, setUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState('');
  
  // Filter & Sort State
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    if (user) {
      setTasks(getTasks());
      setSubmissions(getSubmissions().filter(s => s.userId === user.id));
    }
  }, [user]);

  if (!user) return null;

  if (user.status !== AccountStatus.ACTIVE) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="bg-gray-200 p-4 rounded-full mb-4">
          <Lock className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Tasks Locked</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          You must activate your account by paying the one-time fee to access tasks and start earning.
        </p>
      </div>
    );
  }

  const getTaskStatus = (taskId: string) => {
    const sub = submissions.find(s => s.taskId === taskId);
    return sub ? sub.status : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    try {
      await submitTask(user.id, activeTask.id, { text: proofText, image: proofImage });
      setSubmissions(getSubmissions().filter(s => s.userId === user.id));
      setActiveTask(null);
      setProofText('');
      setProofImage('');
    } catch (err) {
      alert('Failed to submit');
    }
  };

  // Process tasks based on filters
  const filteredTasks = tasks
    .filter(task => filterType === 'ALL' || task.proofType === filterType)
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.reward - b.reward;
      return b.reward - a.reward;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Available Tasks</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select 
              className="w-full sm:w-auto pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="IMAGE">Image Only</option>
              <option value="TEXT">Text Only</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
          
          <div className="relative flex-1 sm:flex-none">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select 
              className="w-full sm:w-auto pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Highest Reward</option>
              <option value="asc">Lowest Reward</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            No tasks match your current filters.
          </div>
        ) : (
          filteredTasks.map(task => {
            const status = getTaskStatus(task.id);
            return (
              <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{task.title}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                      ${task.reward.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  <div className="mt-3 flex gap-2">
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded border border-indigo-100">
                      {task.proofType}
                    </span>
                    {task.requirements.map((req, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{req}</span>
                    ))}
                  </div>
                </div>

                <div>
                  {status ? (
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {status}
                    </span>
                  ) : (
                    <Button onClick={() => setActiveTask(task)}>Start Task</Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Submission Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Submit Proof: {activeTask.title}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Text Proof</label>
                <textarea 
                  className="w-full border rounded p-2" 
                  rows={3}
                  value={proofText}
                  onChange={e => setProofText(e.target.value)}
                  required={activeTask.proofType === 'TEXT' || activeTask.proofType === 'MIXED'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image Proof URL</label>
                <input 
                  type="url" 
                  className="w-full border rounded p-2"
                  value={proofImage}
                  onChange={e => setProofImage(e.target.value)}
                  required={activeTask.proofType === 'IMAGE' || activeTask.proofType === 'MIXED'}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <Button variant="secondary" type="button" onClick={() => setActiveTask(null)}>Cancel</Button>
                <Button type="submit">Submit Proof</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};