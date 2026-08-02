export const STATUS_META = {
  open: { label: 'Open', dot: 'bg-gray-400', chip: 'bg-gray-50 text-gray-600 ring-gray-200' },
  accepted: { label: 'Accepted', dot: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 ring-blue-200' },
  in_progress: { label: 'In Progress', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  awaiting_payment: { label: 'Awaiting Payment', dot: 'bg-purple-500', chip: 'bg-purple-50 text-purple-700 ring-purple-200' },
  completed: { label: 'Completed', dot: 'bg-gray-500', chip: 'bg-gray-100 text-gray-600 ring-gray-200' },
  paid: { label: 'Paid', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  disputed: { label: 'Cancelled', dot: 'bg-red-500', chip: 'bg-red-50 text-red-700 ring-red-200' },
};

export const deriveJobStatus = (job) => {
  if (!job) return 'open';
  if (job.status === 'disputed') return 'disputed';
  if (job.status === 'completed') return job.paid ? 'paid' : 'awaiting_payment';
  if (job.status === 'assigned') return Number(job.progress) > 0 ? 'in_progress' : 'accepted';
  return 'open';
};
