import type { Client, DocumentRequest, Template } from './types';

export const clients: Client[] = [
  { id: 'c1', businessName: 'Elm Street Cafe', contactName: 'Maya Chen', email: 'maya@elmstreet.example', requestCount: 8, progress: 60, status: 'Action needed' },
  { id: 'c2', businessName: 'Northstar Studio', contactName: 'Jordan Lee', email: 'jordan@northstar.example', requestCount: 6, progress: 100, status: 'Complete' },
  { id: 'c3', businessName: 'Harbor Health Co.', contactName: 'Sam Rivera', email: 'sam@harborhealth.example', requestCount: 4, progress: 80, status: 'On track' },
  { id: 'c4', businessName: 'Brightpath Design', contactName: 'Anika Shah', email: 'anika@brightpath.example', requestCount: 3, progress: 20, status: 'Action needed' },
];

export const templates: Template[] = [
  { id: 't1', name: 'Monthly Bookkeeping', category: 'Bookkeeping', usage: 12, items: [
    { label: 'Bank statement', required: true }, { label: 'Credit card statement', required: true },
    { label: 'POS sales summary', required: true }, { label: 'Payroll summary', required: true },
    { label: 'Vendor invoices', required: false },
  ]},
  { id: 't2', name: 'Year-end tax prep', category: 'Tax preparation', usage: 5, items: [
    { label: 'Year-end bank statement', required: true }, { label: '1099 forms', required: true },
    { label: 'Asset purchases', required: false }, { label: 'Loan statements', required: false },
  ]},
  { id: 't3', name: 'New client onboarding', category: 'Onboarding', usage: 7, items: [
    { label: 'Prior year financials', required: true }, { label: 'Chart of accounts', required: true },
    { label: 'Primary contacts', required: true },
  ]},
];

export const initialRequests: DocumentRequest[] = [
  { id: 'r1', clientId: 'c1', clientName: 'Elm Street Cafe', period: 'October 2026', dueDate: '2026-11-05', status: 'Needs review', assignee: 'You', updatedAt: '12 min ago', items: [
    { id: 'i1', label: 'Bank statement', required: true, status: 'Uploaded', fileName: 'Elm_Street_October.pdf' },
    { id: 'i2', label: 'Credit card statement', required: true, status: 'Approved', fileName: 'Visa_October.pdf' },
    { id: 'i3', label: 'POS sales summary', required: true, status: 'Uploaded', fileName: 'Square_Sales.pdf' },
    { id: 'i4', label: 'Payroll summary', required: true, status: 'Missing' },
    { id: 'i5', label: 'Vendor invoices', required: false, status: 'Missing' },
  ]},
  { id: 'r2', clientId: 'c3', clientName: 'Harbor Health Co.', period: 'October 2026', dueDate: '2026-11-03', status: 'In progress', assignee: 'You', updatedAt: '2 hours ago', items: [
    { id: 'i6', label: 'Bank statement', required: true, status: 'Approved', fileName: 'Bank_Oct.pdf' },
    { id: 'i7', label: 'Credit card statement', required: true, status: 'Approved', fileName: 'Card_Oct.pdf' },
    { id: 'i8', label: 'Payroll summary', required: true, status: 'Missing' },
  ]},
  { id: 'r3', clientId: 'c4', clientName: 'Brightpath Design', period: 'September 2026', dueDate: '2026-10-15', status: 'Overdue', assignee: 'You', updatedAt: 'Yesterday', items: [
    { id: 'i9', label: 'Bank statement', required: true, status: 'Approved', fileName: 'Sept_Bank.pdf' },
    { id: 'i10', label: 'Credit card statement', required: true, status: 'Needs replacement', reviewNote: 'Please upload the full September statement.' },
    { id: 'i11', label: 'Payroll summary', required: true, status: 'Missing' },
  ]},
  { id: 'r4', clientId: 'c2', clientName: 'Northstar Studio', period: 'September 2026', dueDate: '2026-10-10', status: 'Completed', assignee: 'You', updatedAt: 'Oct 8', items: [
    { id: 'i12', label: 'Bank statement', required: true, status: 'Approved', fileName: 'Northstar_Bank.pdf' },
    { id: 'i13', label: 'Credit card statement', required: true, status: 'Approved', fileName: 'Northstar_CC.pdf' },
  ]},
];
