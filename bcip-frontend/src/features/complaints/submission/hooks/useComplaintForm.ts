"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitComplaint } from "@/features/complaints/submission/services/complaintService";
import type { ComplaintFormData, ComplaintResponse, SubmissionStep, ValidationErrors } from "@/features/complaints/submission/types/complaint.types";
import { complaintSubmissionSchema } from "@/features/complaints/submission/schemas/complaint.schema";

const emptyForm: ComplaintFormData = { fullName: "", email: "", phone: "", category: [], subject: "", description: "" };

export function useComplaintForm(tenantId?: string) {
    const [step, setStep] = useState<SubmissionStep>(1);
    const [formData, setFormData] = useState<ComplaintFormData>(emptyForm);
    const [files, setFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [result, setResult] = useState<ComplaintResponse | null>(null);
    const mutation = useMutation({ mutationFn: () => submitComplaint({ ...formData, tenantId: tenantId ?? "", files }), onSuccess: setResult });

    function updateField<K extends keyof ComplaintFormData>(field: K, value: ComplaintFormData[K]) { setFormData((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); }
    function validateStep(): boolean { const parsed = complaintSubmissionSchema.safeParse(formData); const next: ValidationErrors = {}; if (!parsed.success) { parsed.error.issues.forEach((issue) => { const field = issue.path[0] as keyof ComplaintFormData; if (!next[field]) next[field] = issue.message; }); } const stepFields: Array<keyof ComplaintFormData> = step === 1 ? ["fullName", "email"] : step === 2 ? ["category", "subject", "description"] : []; const stepErrors = Object.fromEntries(Object.entries(next).filter(([field]) => stepFields.includes(field as keyof ComplaintFormData))) as ValidationErrors; setErrors(stepErrors); return Object.keys(stepErrors).length === 0; }
    function nextStep() { if (validateStep()) setStep((current) => Math.min(4, current + 1) as SubmissionStep); }
    function previousStep() { setStep((current) => Math.max(1, current - 1) as SubmissionStep); }
    function reset() { setStep(1); setFormData(emptyForm); setFiles([]); setErrors({}); setResult(null); mutation.reset(); }
    return { step, formData, files, errors, result, mutation, setFiles, updateField, nextStep, previousStep, validateStep, reset };
}
