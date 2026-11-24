import type {
  Complaint,
  NewComplaint,
} from "@/features/complaints/types/complaint";
import {
  readStoredComplaints,
  writeStoredComplaints,
} from "@/lib/api/complaint-storage";

type DraftChannel = "text" | "voice";

const draftKey = (channel: DraftChannel) => `bcip:complaint-draft:${channel}`;
const draftChangedEvent = "bcip:draft-changed";

export function getDraftSnapshot(channel: DraftChannel): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(draftKey(channel));
}

export function subscribeToDraft(
  channel: DraftChannel,
  onChange: () => void,
): () => void {
  const key = draftKey(channel);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) onChange();
  };
  const onDraftChanged = (event: Event) => {
    if ((event as CustomEvent<DraftChannel>).detail === channel) onChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(draftChangedEvent, onDraftChanged);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(draftChangedEvent, onDraftChanged);
  };
}

export function loadDraft<T>(channel: DraftChannel): T | null {
  const serialized = getDraftSnapshot(channel);
  if (!serialized) return null;

  try {
    return JSON.parse(serialized) as T;
  } catch {
    throw new Error("The saved complaint draft could not be read.");
  }
}

export function saveDraft<T>(channel: DraftChannel, draft: T): void {
  window.localStorage.setItem(draftKey(channel), JSON.stringify(draft));
  window.dispatchEvent(new CustomEvent(draftChangedEvent, { detail: channel }));
}

export function clearDraft(channel: DraftChannel): void {
  window.localStorage.removeItem(draftKey(channel));
  window.dispatchEvent(new CustomEvent(draftChangedEvent, { detail: channel }));
}

export async function createComplaint(payload: NewComplaint): Promise<Complaint> {
  const createdAt = Date.now();
  const id = `BCIP-${crypto.randomUUID()}`;
  const complaint: Complaint = {
    ...payload,
    id,
    trackingId: id,
    title: payload.description.trim().split(/\s+/).slice(0, 8).join(" "),
    status: "submitted",
    category: payload.category ?? "Other",
    priority: payload.priority ?? "medium",
    sentiment: payload.sentiment ?? "negative",
    createdAt,
    updatedAt: createdAt,
  };

  writeStoredComplaints([...readStoredComplaints(), complaint]);
  return complaint;
}