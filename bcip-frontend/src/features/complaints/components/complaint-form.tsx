"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import {
    complaintSchema,
    type ComplaintFormData,
} from "@/features/complaints/schemas/complaint.schema";
import { useCreateComplaint } from "@/features/complaints/hooks/use-complaints";
import { ErrorMessage } from "@/components/feedback/error-message";

export function ComplaintForm() {
    const router = useRouter();
    const createMutation = useCreateComplaint();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ComplaintFormData>({
        resolver: zodResolver(complaintSchema),
    });

    const onSubmit = async (data: ComplaintFormData) => {
        const result = await createMutation.mutateAsync(data);
        router.push(`/support/submitted/${result.trackingId}`);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormField
                label="Your name"
                htmlFor="customerName"
                error={errors.customerName?.message}
            >
                <Input
                    id="customerName"
                    type="text"
                    placeholder="Enter your full name"
                    aria-invalid={!!errors.customerName}
                    aria-describedby={
                        errors.customerName ? "customerName-error" : undefined
                    }
                    {...register("customerName")}
                />
            </FormField>

            <FormField label="Email address" htmlFor="customerEmail" error={errors.customerEmail?.message}>
                <Input id="customerEmail" type="email" placeholder="you@example.com" aria-invalid={!!errors.customerEmail} {...register("customerEmail")} />
            </FormField>

            <FormField label="Business tenant ID" htmlFor="tenantId" error={errors.tenantId?.message}>
                <Input id="tenantId" placeholder="The business tenant UUID" aria-invalid={!!errors.tenantId} {...register("tenantId")} />
            </FormField>

            <FormField
                label="Title"
                htmlFor="title"
                error={errors.title?.message}
            >
                <Input id="title" type="text" placeholder="Summarize the issue" aria-invalid={!!errors.title} {...register("title")} />
            </FormField>

            <FormField
                label="Description"
                htmlFor="description"
                error={errors.description?.message}
            >
                <Textarea
                    id="description"
                    rows={6}
                    placeholder="Describe your complaint in detail"
                    aria-invalid={!!errors.description}
                    aria-describedby={
                        errors.description ? "description-error" : undefined
                    }
                    {...register("description")}
                />
            </FormField>

            {createMutation.isError && (
                <ErrorMessage message={createMutation.error.message} />
            )}

            <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Submitting..." : "Submit Complaint"}
            </Button>
        </form>
    );
}