import { z } from "zod";

export const complaintSchema = z.object({
    title: z
        .string()
        .min(10, "Title must be at least 10 characters.")
        .max(200, "Title must not exceed 200 characters."),

    description: z
        .string()
        .min(20, "Description must be at least 20 characters.")
        .max(5000, "Description must not exceed 5000 characters."),

    customerEmail: z.string().email("Enter a valid email address."),
    customerName: z.string().min(2, "Name must be at least 2 characters."),
    tenantId: z.string().uuid("Enter a valid business tenant ID."),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;