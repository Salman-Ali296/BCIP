import type { ValidationErrors } from "@/features/complaints/submission/types/complaint.types";

interface FormValidationProps { errors: ValidationErrors; }

export function FormValidation({ errors }: FormValidationProps) {
    const messages = Object.values(errors).filter((message): message is string => Boolean(message));
    if (messages.length === 0) return null;
    return <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert"><p className="font-semibold">Please review the following:</p><ul className="mt-2 list-disc space-y-1 pl-5">{messages.map((message) => <li key={message}>{message}</li>)}</ul></div>;
}
