import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, Sparkles, Save, Search, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Profile from '../components/Profile';

type Task = {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  created_at: string;
};

type Subtask = {
  id: string;
  task_id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  created_at: string;
};

type SearchResult = {
  id: string;
  title: string;
  priority: string;
  status: string;
  similarity: number;
};

const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You don't have to be great to start, but you have to start to be great.",
  "The only way to do great work is to love what you do.",
  "Focus on being productive instead of busy.",
  "Action is the foundational key to all success.",
  "Your limitation—it's only your imagination.",
  "Great things never come from comfort zones.",
  "Success doesn't just find you. You have to go out and get it.",
  "Dream it. Wish it. Do it.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't wait for opportunity. Create it.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Make each day your masterpiece.",
  "Opportunities don't happen, you create them.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "Start where you are. Use what you have. Do what you can.",
  "Every accomplishment starts with the decision to try.",
  "Your time is limited, don't waste it living someone else's life."
];

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [generatingSuggestions, setGeneratingSuggestions] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [savingSubtask, setSavingSubtask] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  };

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

      if (data) {
        for (const task of data) {
          await fetchSubtasks(task.id);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtasks = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubtasks(prev => ({ ...prev, [taskId]: data || [] }));
    } catch (err: any) {
      console.error('Error fetching subtasks:', err.message);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: insertedTask, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: newTask,
          priority,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      if (insertedTask) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-task-embedding`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              taskId: insertedTask.id,
              taskTitle: insertedTask.title
            }),
          }).catch(err => console.error('Failed to generate embedding:', err));
        }
      }

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

  const handlePriorityChange = async (taskId: string, newPriority: 'low' | 'medium' | 'high') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority: newPriority, updated_at: new Date().toISOString() })
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

  const handleDuplicateTask = async (task: Task) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: task.title,
          priority: task.priority,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateSubtasks = async (taskId: string, taskTitle: string) => {
    setGeneratingSuggestions(taskId);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subtasks`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate subtasks');
      }

      const { subtasks: generatedSubtasks } = await response.json();
      setSuggestions(prev => ({ ...prev, [taskId]: generatedSubtasks || [] }));
    } catch (err: any) {
      setError(err.message || 'Failed to generate subtasks');
    } finally {
      setGeneratingSuggestions(null);
    }
  };

  const handleSaveSubtask = async (taskId: string, subtaskTitle: string) => {
    setSavingSubtask(subtaskTitle);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('subtasks')
        .insert([{
          task_id: taskId,
          user_id: user.id,
          title: subtaskTitle,
          status: 'pending'
        }]);

      if (error) throw error;

      await fetchSubtasks(taskId);

      setSuggestions(prev => ({
        ...prev,
        [taskId]: prev[taskId]?.filter(s => s !== subtaskTitle) || []
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingSubtask(null);
    }
  };

  const handleSubtaskStatusChange = async (subtaskId: string, taskId: string, newStatus: 'pending' | 'in-progress' | 'done') => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', subtaskId);

      if (error) throw error;
      await fetchSubtasks(taskId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string, taskId: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;
      await fetchSubtasks(taskId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-search`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const { results } = await response.json();
      setSearchResults(results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to perform search');
      setSearchResults([]);
    } finally {
      setSearching(false);
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section - Left side (2/3 width) */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-10 shadow-2xl shadow-cyan-500/20">
            <h1 className="text-5xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 tracking-wide leading-tight">
              {getDailyQuote()}
            </h1>

            {/* Smart Search */}
            <div className="mb-8 bg-blue-50/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-xl p-6">
              <form onSubmit={handleSmartSearch} className="space-y-4">
                <label
                  htmlFor="smartSearch"
                  className="block text-blue-300 font-semibold text-lg tracking-wide"
                >
                  Smart Search
                </label>
                <div className="flex gap-3">
                  <input
                    id="smartSearch"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your tasks with AI..."
                    className="flex-1 px-4 py-3 bg-slate-800/50 border-2 border-blue-400/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="group relative px-6 py-3 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-2 border-blue-400/50 rounded-lg text-blue-300 font-semibold tracking-wide hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    <span className="relative z-10">{searching ? 'Searching...' : 'Search'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 rounded-lg transition-all duration-300"></div>
                  </button>
                </div>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-blue-200 text-sm font-semibold mb-2">
                    Top Results (similarity &gt; 0.7):
                  </h3>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-white text-sm font-medium flex-1">{result.title}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 bg-blue-500/20 border border-blue-400/40 rounded text-blue-200">
                            {result.priority}
                          </span>
                          <span className="px-2 py-1 bg-slate-700/50 border border-slate-500/40 rounded text-slate-200">
                            {result.status}
                          </span>
                          <span className="px-2 py-1 bg-green-500/20 border border-green-400/40 rounded text-green-200 font-semibold">
                            {(result.similarity * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !searching && (
                <div className="mt-4 p-3 bg-slate-700/20 border border-slate-500/30 rounded-lg">
                  <p className="text-slate-300 text-sm text-center">No similar tasks found</p>
                </div>
              )}
            </div>

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
                        <div className="flex flex-wrap gap-3 mb-4">
                          <select
                            value={task.priority}
                            onChange={(e) => handlePriorityChange(task.id, e.target.value as any)}
                            className={`px-3 py-1 rounded-lg border-2 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${getPriorityColor(task.priority)}`}
                          >
                            <option value="low">Priority: LOW</option>
                            <option value="medium">Priority: MEDIUM</option>
                            <option value="high">Priority: HIGH</option>
                          </select>
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

                        {/* Generate Subtasks Button */}
                        <button
                          onClick={() => {
                            setExpandedTask(expandedTask === task.id ? null : task.id);
                            if (expandedTask !== task.id && !suggestions[task.id]) {
                              handleGenerateSubtasks(task.id, task.title);
                            }
                          }}
                          disabled={generatingSuggestions === task.id}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-4 h-4" />
                          {generatingSuggestions === task.id ? 'Generating...' : 'Generate Subtasks with AI'}
                        </button>

                        {/* Subtasks Section */}
                        {expandedTask === task.id && (
                          <div className="mt-4 space-y-3">
                            {/* Saved Subtasks */}
                            {subtasks[task.id] && subtasks[task.id].length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-cyan-300 text-sm font-semibold mb-2">Subtasks:</h4>
                                {subtasks[task.id].map((subtask) => (
                                  <div
                                    key={subtask.id}
                                    className="flex items-center justify-between gap-3 p-3 bg-slate-800/40 border border-cyan-400/20 rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <p className="text-white text-sm">{subtask.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={subtask.status}
                                        onChange={(e) => handleSubtaskStatusChange(subtask.id, task.id, e.target.value as any)}
                                        className={`px-2 py-1 rounded border text-xs font-semibold cursor-pointer focus:outline-none ${getStatusColor(subtask.status)}`}
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                      </select>
                                      <button
                                        onClick={() => handleDeleteSubtask(subtask.id, task.id)}
                                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all"
                                        title="Delete subtask"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* AI Suggestions */}
                            {suggestions[task.id] && suggestions[task.id].length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-yellow-300 text-sm font-semibold mb-2">AI Suggestions:</h4>
                                {suggestions[task.id].map((suggestion, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between gap-3 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg"
                                  >
                                    <p className="text-white text-sm flex-1">{suggestion}</p>
                                    <button
                                      onClick={() => handleSaveSubtask(task.id, suggestion)}
                                      disabled={savingSubtask === suggestion}
                                      className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Save className="w-3 h-3" />
                                      {savingSubtask === suggestion ? 'Saving...' : 'Save'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                          title="Delete task"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateTask(task)}
                          className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded-lg transition-all duration-300"
                          title="Duplicate task"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
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

          {/* Profile Section - Right side (1/3 width) */}
          <div className="lg:col-span-1">
            <Profile />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
