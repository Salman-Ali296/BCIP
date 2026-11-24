import { apiClient } from "@/lib/api/client";

export interface ComplaintPortalBusiness {
    id: string;
    name: string;
    slug: string;
}

interface BusinessDirectoryResponse {
    success: boolean;
    data: ComplaintPortalBusiness[];
}

export async function searchComplaintPortals(
    search = "",
): Promise<ComplaintPortalBusiness[]> {
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());

    const suffix = query.size ? `?${query.toString()}` : "";
    const response = await apiClient<BusinessDirectoryResponse>(
        `/api/complaints/businesses${suffix}`,
    );

    return response.data;
}
