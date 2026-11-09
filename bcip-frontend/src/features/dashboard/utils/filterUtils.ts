import type { ComplaintListItem, FilterState } from "@/features/dashboard/types/dashboard.types";

export function filterComplaints(complaints: ComplaintListItem[], filters: FilterState): ComplaintListItem[] {
    const query = filters.search.trim().toLowerCase();
    return complaints.filter((complaint) => {
        const matchesSearch = !query || [complaint.trackingId, complaint.title, complaint.description, complaint.customerName, complaint.customerEmail].some((value) => value?.toLowerCase().includes(query));
        const matchesStatus = !filters.statuses.length || filters.statuses.includes(complaint.status);
        const matchesPriority = !filters.priorities.length || filters.priorities.includes(complaint.priority);
        const matchesCategory = !filters.categories.length || filters.categories.includes(complaint.category);
        const matchesAssignee = filters.assignedTo === "all" || (filters.assignedTo === "unassigned" ? !complaint.assignedToId : Boolean(complaint.assignedToId));
        return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee;
    });
}
