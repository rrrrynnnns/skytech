const ticketStatusLabels: Record<string, string> = {
  Open: 'Submitted',
  In_Progress: 'Repair Confirmed',
  'In Progress': 'Repair Confirmed',
  Resolved: 'Repair Closed',
  Closed: 'Repair Rescheduled',
};

export function formatTicketStatus(status: string) {
  return ticketStatusLabels[status] || status.replace(/_/g, ' ');
}