import type { Complaint } from "@/features/complaints/types/complaint";

const complaintsKey = "bcip:customer-complaints";

export function readStoredComplaints(): Complaint[] {
  const serialized = window.localStorage.getItem(complaintsKey);
  if (!serialized) return [];

  try {
    return JSON.parse(serialized) as Complaint[];
  } catch {
    throw new Error("Saved complaints could not be read.");
  }
}

export function writeStoredComplaints(complaints: Complaint[]): void {
  window.localStorage.setItem(complaintsKey, JSON.stringify(complaints));
}
