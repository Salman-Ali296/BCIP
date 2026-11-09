"use client";

import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface VerificationCodeInputProps {
    length?: number;
    value: string;
    onChange: (code: string) => void;
    disabled?: boolean;
    error?: boolean;
    autoFocus?: boolean;
    className?: string;
}

export function VerificationCodeInput({
    length = 6,
    value,
    onChange,
    disabled = false,
    error = false,
    autoFocus = true,
    className = "",
}: VerificationCodeInputProps) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const [digits, setDigits] = useState<string[]>(() => {
        const arr = new Array(length).fill("");
        for (let i = 0; i < Math.min(value.length, length); i++) {
            arr[i] = value[i];
        }
        return arr;
    });

    useEffect(() => {
        const arr = new Array(length).fill("");
        for (let i = 0; i < Math.min(value.length, length); i++) {
            arr[i] = value[i];
        }
        setDigits(arr);
    }, [value, length]);

    useEffect(() => {
        if (autoFocus && inputsRef.current[0]) {
            inputsRef.current[0].focus();
        }
    }, [autoFocus]);

    const handleInputChange = (index: number, char: string) => {
        // Only accept numbers
        const cleanChar = char.replace(/[^0-9]/g, "").slice(-1);
        const newDigits = [...digits];
        newDigits[index] = cleanChar;
        setDigits(newDigits);
        onChange(newDigits.join(""));

        // If filled, jump to next box
        if (cleanChar && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!digits[index] && index > 0) {
                // If current is empty, focus previous and clear it
                inputsRef.current[index - 1]?.focus();
                const newDigits = [...digits];
                newDigits[index - 1] = "";
                setDigits(newDigits);
                onChange(newDigits.join(""));
            } else {
                const newDigits = [...digits];
                newDigits[index] = "";
                setDigits(newDigits);
                onChange(newDigits.join(""));
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            e.preventDefault();
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").replace(/[^0-9]/g, "").slice(0, length);
        if (!pastedData) return;

        const newDigits = [...digits];
        for (let i = 0; i < length; i++) {
            newDigits[i] = pastedData[i] || "";
        }
        setDigits(newDigits);
        onChange(newDigits.join(""));

        // Focus the input corresponding to length or end
        const nextIdx = Math.min(pastedData.length, length - 1);
        inputsRef.current[nextIdx]?.focus();
    };

    return (
        <div className={`flex items-center justify-between gap-2 sm:gap-2.5 ${className}`}>
            {Array.from({ length }).map((_, idx) => (
                <input
                    key={idx}
                    ref={(el) => {
                        inputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digits[idx] || ""}
                    disabled={disabled}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${idx + 1} of ${length}`}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-lg border transition-all duration-150 select-all
                        ${
                            error
                                ? "border-red-300 bg-red-50/30 text-red-950 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                                : digits[idx]
                                ? "border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                                : "border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        }
                        ${disabled ? "cursor-not-allowed opacity-50 bg-slate-100" : ""}
                        focus:outline-none
                    `}
                />
            ))}
        </div>
    );
}
