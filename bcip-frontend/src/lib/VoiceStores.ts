// Hands the recording from /report/voice to /report/voice/review (client-side navigation only).
let current: { blob: Blob; duration: number } | null = null;
export const setVoice = (v: typeof current) => { current = v; };
export const getVoice = () => current;
