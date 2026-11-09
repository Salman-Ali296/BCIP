"use client";

import { FileText, Image, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFileUpload } from "@/features/complaints/submission/hooks/useFileUpload";

interface FileUploadProps {
    value: File[];
    onChange: (files: File[]) => void;
    progress?: Record<string, number>;
}

export function FileUpload({ value, onChange, progress = {} }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const upload = useFileUpload();

    function add(files: File[]) {
        upload.addFiles(files);
        const nextFiles = [...value, ...files].filter((file, index, all) => all.findIndex((candidate) => candidate.name === file.name && candidate.size === file.size) === index).slice(0, 3);
        onChange(nextFiles);
    }

    function remove(name: string) {
        upload.removeFile(name);
        onChange(value.filter((file) => file.name !== name));
    }

    return (
        <div className="space-y-3">
            <div onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); add(Array.from(event.dataTransfer.files)); }} onClick={() => inputRef.current?.click()} className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${isDragging ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400"}`}>
                <UploadCloud aria-hidden="true" className="mx-auto h-8 w-8 text-blue-600" />
                <p className="mt-2 text-sm font-medium text-slate-900">Drop files here or browse</p>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG, or PDF. Up to 3 files, 5 MB each.</p>
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,application/pdf" multiple hidden onChange={(event) => add(Array.from(event.target.files ?? []))} />
            </div>
            {upload.errors.map((message) => <p key={message} className="text-sm text-rose-600" role="alert">{message}</p>)}
            {value.map((file) => {
                const isImage = file.type.startsWith("image/");
                const percent = progress[file.name] ?? 0;
                return (
                    <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
                        {isImage ? <Image aria-hidden="true" className="h-5 w-5 text-blue-600" /> : <FileText aria-hidden="true" className="h-5 w-5 text-slate-500" />}
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{file.name}</p><p className="text-xs text-slate-500">{Math.ceil(file.size / 1024)} KB</p>{percent > 0 && percent < 100 && <div className="mt-1 h-1 rounded-full bg-slate-100"><div className="h-1 rounded-full bg-blue-600" style={{ width: `${percent}%` }} /></div>}</div>
                        <button type="button" onClick={() => remove(file.name)} aria-label={`Remove ${file.name}`} className="rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><X aria-hidden="true" className="h-4 w-4" /></button>
                    </div>
                );
            })}
        </div>
    );
}
