import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { getTasks, createTask, deleteTask } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { Trash2, Plus, X } from 'lucide-react';

export const ManageTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: 0,
    requirements: '', // Newline separated
    proofType: 'IMAGE' as Task['proofType']
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setTasks(getTasks());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
      loadTasks();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: formData.title,
      description: formData.description,
      reward: Number(formData.reward),
      requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
      proofType: formData.proofType,
      createdAt: new Date().toISOString()
    };
    createTask(newTask);
    setIsModalOpen(false);
    setFormData({ title: '', description: '', reward: 0, requirements: '', proofType: 'IMAGE' });
    loadTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Tasks</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </Button>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Reward</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Requirements</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{task.description}</p>
                </td>
                <td className="px-6 py-4 font-bold text-green-600">${task.reward.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{task.proofType}</span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {task.requirements.length} requirements
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No tasks found. Create one!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input 
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reward ($)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.reward}
                    onChange={e => setFormData({...formData, reward: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proof Type</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.proofType}
                    onChange={e => setFormData({...formData, proofType: e.target.value as any})}
                  >
                    <option value="IMAGE">Screenshot (Image)</option>
                    <option value="TEXT">Text Answer</option>
                    <option value="MIXED">Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
                <textarea 
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={4}
                  placeholder="- Join the channel&#10;- Stay for 7 days"
                  value={formData.requirements}
                  onChange={e => setFormData({...formData, requirements: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Create Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};