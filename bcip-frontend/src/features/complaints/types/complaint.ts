// export type ComplaintPriority =
//     | "LOW"
//     | "MEDIUM"
//     | "HIGH"
//     | "CRITICAL";

// export type ComplaintStatus =
//     | "PENDING"
//     | "AI_PROCESSING"
//     | "OPEN"
//     | "IN_PROGRESS"
//     | "WAITING_FOR_CUSTOMER"
//     | "ESCALATED"
//     | "RESOLVED"
//     | "CLOSED"
//     | "REOPENED";

// export type ComplaintCategory =
//     | "BILLING"
//     | "DELIVERY"
//     | "PRODUCT_QUALITY"
//     | "TECHNICAL"
//     | "CUSTOMER_SERVICE"
//     | "OTHER";


// export interface Complaint {
//     id: string;
//     trackingId: string;
//     title: string;
//     description: string;
//     category: string;
//     status: ComplaintStatus;
//     priority: ComplaintPriority;
//     sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null;
//     aiSentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED" | null;
//     aiSummary?: string | null;
//     suggestedResponse?: string | null;
//     isDuplicate?: boolean;
//     duplicateOf?: string | null;
//     customerEmail?: string | null;
//     assignedToId?: string | null;
//     createdAt: string;
//     updatedAt?: string;
// }


export const STATUS_STEPS = [
  { key: 'submitted', label: 'Complaint submitted' },
  { key: 'analyzed', label: 'Complaint analyzed' },
  { key: 'assigned', label: 'Assigned to support team' },
  { key: 'in_review', label: 'Business review' },
  { key: 'awaiting_customer', label: 'Awaiting your confirmation' },
  { key: 'resolved', label: 'Complaint resolved' },
] as const;

export type ComplaintStatus =
  | (typeof STATUS_STEPS)[number]["key"]
  | "acknowledged"
  | "in_progress"
  | "PENDING"
  | "AI_PROCESSING"
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "ESCALATED"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED";
export type Priority = 'low' | 'medium' | 'high';
export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ComplaintCategory =
  | "BILLING"
  | "DELIVERY"
  | "PRODUCT_QUALITY"
  | "TECHNICAL"
  | "CUSTOMER_SERVICE"
  | "OTHER";
export type Sentiment =
  | 'negative'
  | 'neutral'
  | 'positive'
  | 'NEGATIVE'
  | 'NEUTRAL'
  | 'POSITIVE'
  | 'MIXED';
export const CATEGORIES = ['Product damage', 'Delivery delay', 'Billing', 'Warranty', 'Other'] as const;

export interface Classification {
  category: string;
  priority: Priority | ComplaintPriority;
  sentiment?: Sentiment | null;
}
export interface BusinessResponse {
  message: string;
  proposedResolution: string;
  respondedAt?: string;
}
export interface Feedback { resolved: boolean; rating: number; comment?: string }

export interface Complaint extends Classification {
  id: string;
  trackingId: string;
  title: string;
  status: ComplaintStatus;
  channel: 'text' | 'voice';
  description: string;
  createdAt: number | string;
  updatedAt?: number | string;
  orderRef?: string;
  email: string;
  phone?: string;
  resolved?: boolean;
  feedback?: Feedback;
  response?: BusinessResponse;
  customerName?: string | null;
  customerEmail?: string | null;
  assignedToId?: string | null;
  assignedTo?: string | null;
  sentiment?: Sentiment | null;
  aiSentiment?: Sentiment | null;
  aiSummary?: string | null;
  suggestedResponse?: string | null;
  isDuplicate?: boolean;
  duplicateOf?: string | null;
}

export type NewComplaint = {
  channel: Complaint["channel"];
  description: string;
  email: string;
} & Partial<Pick<Complaint, 'orderRef' | 'phone' | 'category' | 'priority' | 'sentiment'>>;
