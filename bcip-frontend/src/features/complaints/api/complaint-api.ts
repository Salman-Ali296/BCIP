import { notifySessionExpired } from '@/lib/api/client';

const API_BASE = '/api/complaints';

export interface Complaint {
  id: string;
  trackingId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved';
  submittedBy: string;
  organizationId: string;
  customerEmail?: string;
  sentiment?: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintData {
  title: string;
  description: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  customerEmail?: string;
  customerName?: string;
  tenantId?: string;
  attachmentUrl?: string;
}

export interface ComplaintListParams {
  page?: number;
  limit?: number;
  status?: Complaint['status'];
  search?: string;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

export async function fetchComplaints(
  params: ComplaintListParams = {},
): Promise<Complaint[]> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  const suffix = query.size ? `?${query.toString()}` : '';
  const response = await fetch(`${API_BASE}${suffix}`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    notifySessionExpired(response);
    throw new Error('Failed to fetch complaints');
  }
  const data = await response.json();
  return data.complaints;
}

export async function fetchComplaint(id: string): Promise<Complaint> {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    notifySessionExpired(response);
    throw new Error('Failed to fetch complaint');
  }
  const data = await response.json();
  return data.complaint;
}

export async function createComplaint(data: CreateComplaintData): Promise<Complaint> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    notifySessionExpired(response);
    throw new Error('Failed to create complaint');
  }
  const result = await response.json();
  return result.complaint;
}

export async function updateComplaintStatus(
  id: string,
  status: Complaint['status'],
  resolution?: string,
  assignedToId?: string,
): Promise<Complaint> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status, resolution, assignedToId }),
  });
  if (!response.ok) {
    notifySessionExpired(response);
    throw new Error('Failed to update complaint');
  }
  const data = await response.json();
  return data.complaint;
}

export async function getComplaints(
  params: ComplaintListParams = {},
) {
  const complaints = await fetchComplaints(params);
  const page = params.page ?? 1;
  const limit = params.limit ?? complaints.length;
  return {
    data: complaints,
    pagination: {
      total: complaints.length,
      page,
      limit,
      pages: limit > 0 ? Math.ceil(complaints.length / limit) : 0,
    },
  };
}

export async function getComplaint(id: string) {
  return { data: await fetchComplaint(id) };
}

export async function updateComplaint(
  id: string,
  update: { status: Complaint['status']; assignedToId?: string },
) {
  return {
    data: await updateComplaintStatus(id, update.status, undefined, update.assignedToId),
  };
}
