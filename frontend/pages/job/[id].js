import useSWR from 'swr';
import { useRouter } from 'next/router';
import Link from 'next/link';

const fetcher = (url) => fetch(url).then(r => r.json());

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: job } = useSWR(id ? `/api/proxy/jobs/${id}` : null, fetcher);

  if (!job) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-slate-400">Loading job details...</div>
    </div>
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-900 text-green-200';
      case 'running': return 'bg-blue-900 text-blue-200';
      case 'pending': return 'bg-gray-900 text-gray-200';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-900 text-red-200';
      case 'Medium': return 'bg-yellow-900 text-yellow-200';
      case 'Low': return 'bg-slate-700 text-slate-300';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  async function runJob() {
    await fetch(`/api/proxy/run-job/${job.id}`, { method: 'POST' });
    // Refresh the page
    router.push(router.asPath);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-3xl mx-auto p-6">
        <Link href="/">
          <span className="text-blue-400 hover:text-blue-300 cursor-pointer mb-6 inline-block">← Back to Dashboard</span>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Job #{job.id}</h1>
          <p className="text-slate-400">{job.taskName}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(job.status)}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
          
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Priority</p>
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(job.priority)}`}>
              {job.priority}
            </span>
          </div>
          
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Created</p>
            <p className="text-white">{new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Payload</h2>
          <pre className="bg-slate-800 p-4 rounded-lg text-slate-300 overflow-auto text-sm border border-slate-600">
            {JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>

        {job.completedAt && (
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Completed</h2>
            <p className="text-slate-300">{new Date(job.completedAt).toLocaleString()}</p>
          </div>
        )}

        {job.status === 'pending' && (
          <button
            onClick={runJob}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ▶ Run This Job
          </button>
        )}

        {job.status === 'running' && (
          <div className="bg-blue-900 text-blue-200 px-6 py-3 rounded-lg text-center font-semibold">
            Job is currently running...
          </div>
        )}

        {job.status === 'completed' && (
          <div className="bg-green-900 text-green-200 px-6 py-3 rounded-lg text-center font-semibold">
            ✓ Job completed successfully
          </div>
        )}
      </div>
    </div>
  );
}
