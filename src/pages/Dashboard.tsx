import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Task = {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  created_at: string;
};

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: newTask,
          priority,
          status: 'pending'
        }]);

      if (error) throw error;

      setNewTask('');
      setPriority('medium');
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in-progress' | 'done') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'low': return 'bg-green-500/20 border-green-500/50 text-green-300';
      default: return 'bg-slate-500/20 border-slate-500/50 text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'in-progress': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'pending': return 'bg-slate-500/20 border-slate-500/50 text-slate-300';
      default: return 'bg-slate-500/20 border-slate-500/50 text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-cyan-300 text-2xl font-semibold">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Futuristic grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

      {/* Metallic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent"></div>

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16">
        <div className="bg-slate-900/40 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-10 shadow-2xl shadow-cyan-500/20">
          <h1 className="text-6xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 tracking-wide">
            Your Tasks
          </h1>

          {error && (
            <div className="mb-6 bg-red-500/20 border-2 border-red-500/50 rounded-lg p-4">
              <p className="text-red-200 text-center">{error}</p>
            </div>
          )}

          {/* Task List */}
          <div className="mb-12 bg-slate-800/30 backdrop-blur-sm border-2 border-cyan-400/20 rounded-xl p-8">
            {tasks.length === 0 ? (
              <p className="text-slate-400 text-center text-lg">No tasks yet. Add your first task below!</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-900/40 backdrop-blur-sm border-2 border-cyan-400/20 rounded-lg p-6 hover:border-cyan-400/40 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-white text-xl font-semibold mb-3">{task.title}</h3>
                        <div className="flex flex-wrap gap-3">
                          <div className={`px-3 py-1 rounded-lg border-2 text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                            Priority: {task.priority.toUpperCase()}
                          </div>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                            className={`px-3 py-1 rounded-lg border-2 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${getStatusColor(task.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        title="Delete task"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-12">
            <label
              htmlFor="newTask"
              className="block text-cyan-300 font-semibold mb-4 text-xl tracking-wide"
            >
              New Task
            </label>
            <div className="space-y-4">
              <input
                id="newTask"
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a new task"
                className="w-full px-5 py-4 bg-slate-800/50 border-2 border-cyan-400/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
              />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="priority" className="block text-cyan-300 font-semibold mb-2 text-sm tracking-wide">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm text-lg cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 rounded-lg text-cyan-300 font-bold text-lg tracking-wider hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 backdrop-blur-sm flex items-center gap-2 min-w-[180px] justify-center self-end"
                >
                  <Plus className="w-5 h-5" />
                  <span className="relative z-10">Add Task</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/40 group-hover:to-blue-500/40 rounded-lg transition-all duration-300"></div>
                </button>
              </div>
            </div>
          </form>

          {/* Logout Button */}
          <div className="flex justify-center pt-8 border-t-2 border-cyan-400/20">
            <button
              onClick={handleLogout}
              className="group relative px-10 py-5 bg-gradient-to-r from-slate-500/30 to-cyan-500/30 border-2 border-slate-400/50 rounded-lg text-slate-300 font-bold text-xl tracking-wider hover:border-slate-300 hover:shadow-lg hover:shadow-slate-500/50 transition-all duration-300 backdrop-blur-sm flex items-center gap-3"
            >
              <LogOut className="w-6 h-6" />
              <span className="relative z-10">Logout</span>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/0 to-cyan-500/0 group-hover:from-slate-500/40 group-hover:to-cyan-500/40 rounded-lg transition-all duration-300"></div>
            </button>
          </div>

          {/* Decorative elements */}
          <div className="mt-10 flex justify-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping-slow"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping-slow" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping-slow" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
