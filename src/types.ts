export type RequestStatus = 'In progress' | 'Needs review' | 'Completed' | 'Overdue';
export type ItemStatus = 'Missing' | 'Uploaded' | 'Approved' | 'Needs replacement';

export interface Client {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  requestCount: number;
  progress: number;
  status: 'On track' | 'Action needed' | 'Complete';
}

export interface RequestItem {
  id: string;
  label: string;
  required: boolean;
  status: ItemStatus;
  fileName?: string;
  reviewNote?: string;
}

export interface DocumentRequest {
  id: string;
  clientId: string;
  clientName: string;
  period: string;
  dueDate: string;
  status: RequestStatus;
  assignee: string;
  updatedAt: string;
  items: RequestItem[];
}

export interface Template {
  id: string;
  name: string;
  category: string;
  usage: number;
  items: Array<{ id?: string; label: string; required: boolean }>;
}
