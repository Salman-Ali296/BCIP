export type VoiceDraft = {
  blob: Blob;
  duration: number;
  transcript: string;
};

let currentVoiceDraft: VoiceDraft | null = null;

export function setVoiceDraft(draft: VoiceDraft): void {
  currentVoiceDraft = draft;
}

export function getVoiceDraft(): VoiceDraft | null {
  return currentVoiceDraft;
}

export function clearVoiceDraft(): void {
  currentVoiceDraft = null;
}