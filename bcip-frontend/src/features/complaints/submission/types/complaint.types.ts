import type { ComplaintPriority, ComplaintStatus, Priority } from "@/features/complaints/types/complaint";

export interface ComplaintFormData {
    fullName: string;
    email: string;
    phone?: string;
    category: string[];
    subject: string;
    description: string;
}

export interface ComplaintSubmissionPayload extends ComplaintFormData {
    tenantId: string;
    files?: File[];
}

export interface ComplaintResponse {
    id: string;
    trackingId: string;
    status: ComplaintStatus;
    priority: ComplaintPriority | Priority;
    category: string;
    submittedAt: string;
    message?: string;
}

export interface FileUploadState {
    files: File[];
    progress: Record<string, number>;
    errors: string[];
    isUploading: boolean;
}

export type ValidationErrors = Partial<Record<keyof ComplaintFormData, string>>;

export type SubmissionStep = 1 | 2 | 3 | 4;
