"use client";

import { useCallback, useState } from "react";
import type { FileUploadState } from "@/features/complaints/submission/types/complaint.types";

const MAX_FILES = 3;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export function useFileUpload() {
    const [state, setState] = useState<FileUploadState>({
        files: [],
        progress: {},
        errors: [],
        isUploading: false,
    });

    const addFiles = useCallback((incoming: File[]) => {
        const errors: string[] = [];
        const accepted: File[] = [];

        incoming.forEach((file) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                errors.push(`${file.name}: only JPG, PNG, and PDF files are supported.`);
            } else if (file.size > MAX_SIZE) {
                errors.push(`${file.name}: file must be 5 MB or smaller.`);
            } else {
                accepted.push(file);
            }
        });

        setState((current) => {
            const files = [...current.files, ...accepted].slice(0, MAX_FILES);
            if (current.files.length + accepted.length > MAX_FILES) {
                errors.push("You can upload up to 3 files.");
            }
            return { ...current, files, errors };
        });
    }, []);

    const removeFile = useCallback((name: string) => {
        setState((current) => ({ ...current, files: current.files.filter((file) => file.name !== name) }));
    }, []);

    const setProgress = useCallback((name: string, progress: number) => {
        setState((current) => ({ ...current, progress: { ...current.progress, [name]: progress } }));
    }, []);

    return { ...state, addFiles, removeFile, setProgress };
}
