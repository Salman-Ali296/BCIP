import type { Complaint, ComplaintPriority, ComplaintStatus, Priority } from "@/features/complaints/types/complaint";

export interface ComplaintListItem extends Complaint { customerName?: string | null; assignedToName?: string | null; }
export interface ComplaintDetail extends Complaint { customerName?: string | null; attachments?: Array<{ id: string; fileName: string; fileUrl: string; mimeType: string }>; history?: Array<{ id: string; status: string; message?: string; timestamp: string }>; }
export interface FilterState { search: string; statuses: ComplaintStatus[]; priorities: (ComplaintPriority | Priority)[]; categories: string[]; assignedTo: "all" | "current" | "unassigned"; page: number; pageSize: 10 | 25 | 50; }
export interface DashboardStats { totalOpen: number; averageResolutionTime: string; highPriority: number; unassigned: number; todayNew: number; }
export interface BulkOperation { type: "status" | "priority" | "assign"; value: string; complaintIds: string[]; }
export type SortKey = "createdAt" | "priority" | "status";
export type SortDirection = "asc" | "desc";
