import { z } from "zod";

export const complaintSubmissionSchema = z.object({
    fullName: z.string().trim().min(3, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().optional(),
    category: z.array(z.string()).min(1, "Select at least one category."),
    subject: z.string().trim().min(10, "Subject must be at least 10 characters.").max(200, "Subject must be 200 characters or fewer."),
    description: z.string().trim().min(20, "Description must be at least 20 characters.").max(5000, "Description must be 5000 characters or fewer."),
});
