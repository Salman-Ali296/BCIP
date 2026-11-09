import type { ComplaintListItem, SortDirection, SortKey } from "@/features/dashboard/types/dashboard.types";

const priorityRank = {
    LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
    low: 1, medium: 2, high: 3,
};
export function sortComplaints(complaints: ComplaintListItem[], key: SortKey, direction: SortDirection): ComplaintListItem[] {
    const factor = direction === "asc" ? 1 : -1;
    return [...complaints].sort((left, right) => {
        const a = key === "priority" ? priorityRank[left.priority] : key === "createdAt" ? new Date(left.createdAt).getTime() : left.status;
        const b = key === "priority" ? priorityRank[right.priority] : key === "createdAt" ? new Date(right.createdAt).getTime() : right.status;
        return (a < b ? -1 : a > b ? 1 : 0) * factor;
    });
}
