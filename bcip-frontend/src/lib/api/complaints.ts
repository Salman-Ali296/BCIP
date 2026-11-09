import {
  clearDraft,
  createComplaint as persistComplaint,
  loadDraft,
  saveDraft,
} from "@/features/Customer-portal/api/portal-api";
import type {
  Classification,
  Complaint,
  Feedback,
  NewComplaint,
} from "@/features/complaints/types/complaint";
import { MOCK_ENTERPRISE_COMPLAINTS } from "@/features/dashboard/data/mockComplaints";

const complaintsKey = "bcip:customer-complaints";

export { clearDraft, loadDraft, saveDraft };

function pause(milliseconds = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function readComplaints(): Complaint[] {
  const serialized = window.localStorage.getItem(complaintsKey);
  if (!serialized) return [];

  try {
    return JSON.parse(serialized) as Complaint[];
  } catch {
    throw new Error("Saved complaints could not be read.");
  }
}

function writeComplaints(complaints: Complaint[]): void {
  window.localStorage.setItem(complaintsKey, JSON.stringify(complaints));
}

export async function createComplaint(
  payload: NewComplaint,
): Promise<Complaint> {
  await pause();
  return persistComplaint(payload);
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  await pause();
  const normalizedId = id.toUpperCase();
  const stored = readComplaints().find(
    (c) => c.id.toUpperCase() === normalizedId || c.trackingId.toUpperCase() === normalizedId
  );
  if (stored) return stored;

  const mock = MOCK_ENTERPRISE_COMPLAINTS.find(
    (c) => c.id.toUpperCase() === normalizedId || c.trackingId.toUpperCase() === normalizedId
  );
  if (mock) {
    return {
      ...mock,
      status: mock.status.toLowerCase() as any,
      priority: mock.priority.toLowerCase() as any,
      sentiment: mock.sentiment?.toLowerCase() as any,
    };
  }

  return null;
}

export async function getComplaints(): Promise<Complaint[]> {
  await pause();
  const stored = readComplaints();
  if (stored.length > 0) return stored;
  return MOCK_ENTERPRISE_COMPLAINTS.map((mock) => ({
    ...mock,
    status: mock.status.toLowerCase() as any,
    priority: mock.priority.toLowerCase() as any,
    sentiment: mock.sentiment?.toLowerCase() as any,
  }));
}


export async function classify(text: string): Promise<Classification> {
  await pause();
  const normalized = text.toLowerCase();
  const category = normalized.includes("deliver") || normalized.includes("late")
    ? "Delivery delay"
    : normalized.includes("bill") || normalized.includes("charg")
      ? "Billing"
      : normalized.includes("warrant")
        ? "Warranty"
        : normalized.includes("damage") || normalized.includes("broken")
          ? "Product damage"
          : "Other";
  const priority = /urgent|danger|immediately|asap/.test(normalized)
    ? "high"
    : /frustrat|unacceptable|again|still/.test(normalized)
      ? "medium"
      : "low";
  const sentiment = /thank|great|happy|pleased/.test(normalized)
    ? "positive"
    : /angry|frustrat|terrible|unacceptable|disappointed/.test(normalized)
      ? "negative"
      : "neutral";

  return { category, priority, sentiment };
}

export async function transcribeVoice(_recording: Blob): Promise<string> {
  await pause(500);
  return "I need help resolving a problem with my recent purchase.";
}

async function updateComplaint(
  id: string,
  update: (complaint: Complaint) => Complaint,
): Promise<void> {
  await pause();
  const complaints = readComplaints();
  const index = complaints.findIndex((complaint) => complaint.id === id);
  if (index < 0) throw new Error("The complaint could not be found.");

  complaints[index] = update(complaints[index]);
  writeComplaints(complaints);
}

export function acceptResolution(id: string): Promise<void> {
  return updateComplaint(id, (complaint) => ({
    ...complaint,
    status: "resolved",
    resolved: true,
  }));
}

export function requestAlternative(id: string): Promise<void> {
  return updateComplaint(id, (complaint) => ({
    ...complaint,
    status: "in_review",
    resolved: false,
    response: undefined,
  }));
}

export function submitFeedback(
  id: string,
  feedback: Feedback,
): Promise<void> {
  if (feedback.rating < 1 || feedback.rating > 5) {
    return Promise.reject(new Error("Choose a rating from 1 to 5."));
  }
  if ((feedback.comment?.length ?? 0) > 500) {
    return Promise.reject(new Error("Feedback must be 500 characters or fewer."));
  }

  return updateComplaint(id, (complaint) => ({
    ...complaint,
    feedback,
    resolved: feedback.resolved,
    status: feedback.resolved ? "resolved" : "in_review",
  }));
}
