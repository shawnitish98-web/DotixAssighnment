import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());

export default function Dashboard() {
  const [taskName, setTaskName] = useState('');
  const [payload, setPayload] = useState('{}');
  const [priority, setPriority] = useState('Low');
  const [filterStatus, setFilterStatus] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookModal, setShowWebhookModal] = useState(false);

  const { data: jobs, mutate: mutateJobs } = useSWR(`/api/proxy/jobs?status=${filterStatus}`, fetcher, { refreshInterval: 3000 });
  const { data: logs, mutate: mutateLogs } = useSWR(`/api/proxy/webhook-logs`, fetcher, { refreshInterval: 3000 });

  useEffect(() => { mutateJobs(); }, [filterStatus]);

  // load stored webhook URL from backend (if any)
  useEffect(() => {
    async function loadWebhook() {
      try {
        const res = await fetch('/api/proxy/settings/webhook');
        if (res.ok) {
          const js = await res.json();
          setWebhookUrl(js.url || localStorage.getItem('webhookUrl') || '');
        }
      } catch (err) {
        // ignore
        setWebhookUrl(localStorage.getItem('webhookUrl') || '');
      }
    }
    loadWebhook();
  }, []);

  async function createJob(e) {
    e.preventDefault();
    let parsed = {};
    try { parsed = JSON.parse(payload); } catch (err) { alert('Invalid JSON payload'); return; }
    await fetch('/api/proxy/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskName, payload: parsed, priority }) });
    setTaskName(''); setPayload('{}'); setPriority('Low');
    mutateJobs();
  }

  async function runJob(id) {
    await fetch(`/api/proxy/run-job/${id}`, { method: 'POST' });
    mutateJobs();
    setTimeout(() => mutateLogs(), 3500);
  }

  async function saveWebhookUrl() {
    try {
      const res = await fetch('/api/proxy/settings/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      if (!res.ok) throw new Error('Failed to save');
      localStorage.setItem('webhookUrl', webhookUrl);
      setShowWebhookModal(false);
      alert('Webhook URL saved! Jobs will send webhooks to this URL when completed.');
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Dotix Job Scheduler</h1>
            <p className="text-slate-400">Manage and schedule background jobs</p>
          </div>
          <button 
            onClick={() => setShowWebhookModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
          >
            ⚙️ Webhook Settings
          </button>
        </div>

        {/* Webhook Modal */}
        {showWebhookModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-white mb-4">Configure Webhook</h2>
              <input
                type="text"
                placeholder="https://webhook.site/your-id"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 mb-4"
              />
              <div className="flex gap-2">
                <button 
                  onClick={saveWebhookUrl}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
                <button 
                  onClick={() => setShowWebhookModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Create Job Card */}
          <div className="lg:col-span-1 bg-slate-700 border border-slate-600 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Create Job</h2>
            <form onSubmit={createJob} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Task Name</label>
                <input 
                  value={taskName} 
                  onChange={e=>setTaskName(e.target.value)} 
                  className="w-full px-3 py-2 rounded-lg bg-slate-600 text-white border border-slate-500 focus:border-blue-500 outline-none" 
                  placeholder="e.g., Send Email"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Payload (JSON)</label>
                <textarea 
                  value={payload} 
                  onChange={e=>setPayload(e.target.value)} 
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg bg-slate-600 text-white border border-slate-500 focus:border-blue-500 outline-none font-mono text-xs" 
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Priority</label>
                <select 
                  value={priority} 
                  onChange={e=>setPriority(e.target.value)} 
                  className="w-full px-3 py-2 rounded-lg bg-slate-600 text-white border border-slate-500 focus:border-blue-500 outline-none"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                + Create Job
              </button>
            </form>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-2 bg-slate-700 border border-slate-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Jobs</h2>
              <select 
                value={filterStatus} 
                onChange={e=>setFilterStatus(e.target.value)} 
                className="px-3 py-1 rounded-lg bg-slate-600 text-white border border-slate-500 text-sm"
              >
                <option value="">All Jobs</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-600">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Task</th>
                    <th className="text-left p-2">Priority</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs && jobs.length > 0 ? (
                    jobs.map(job => (
                      <tr key={job.id} className="border-b border-slate-600 hover:bg-slate-600 transition">
                        <td className="p-2 text-slate-300">{job.id}</td>
                        <td className="p-2">
                          <a href={`/job/${job.id}`} className="text-blue-400 hover:text-blue-300">
                            {job.taskName}
                          </a>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            job.priority === 'High' ? 'bg-red-900 text-red-200' :
                            job.priority === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-slate-600 text-slate-200'
                          }`}>
                            {job.priority}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            job.status === 'completed' ? 'bg-green-900 text-green-200' :
                            job.status === 'running' ? 'bg-blue-900 text-blue-200' :
                            'bg-gray-900 text-gray-200'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-400 text-xs">{new Date(job.createdAt).toLocaleDateString()}</td>
                        <td className="p-2">
                          {job.status === 'pending' && (
                            <button 
                              onClick={()=>runJob(job.id)} 
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition"
                            >
                              Run
                            </button>
                          )}
                          {job.status === 'running' && <span className="text-blue-400 text-xs">Running...</span>}
                          {job.status === 'completed' && <span className="text-green-400 text-xs">Done</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        No jobs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Webhook Logs */}
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Webhook Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-600">
                  <th className="text-left p-2">Job ID</th>
                  <th className="text-left p-2">URL</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Response</th>
                  <th className="text-left p-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs && logs.length > 0 ? (
                  logs.slice(0, 10).map(log => (
                    <tr key={log.id} className="border-b border-slate-600 hover:bg-slate-600 transition">
                      <td className="p-2 text-slate-300">{log.jobId}</td>
                      <td className="p-2 text-blue-400 text-xs truncate">{log.url}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.responseStatus === 200 ? 'bg-green-900 text-green-200' :
                          'bg-red-900 text-red-200'
                        }`}>
                          {log.responseStatus}
                        </span>
                      </td>
                      <td className="p-2 text-slate-400 text-xs truncate">{log.responseBody || 'N/A'}</td>
                      <td className="p-2 text-slate-400 text-xs">{new Date(log.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-400">
                      No webhook logs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
