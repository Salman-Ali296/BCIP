'use client';
import { useState } from 'react';
import { Button } from '@/components/ui';

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}>
      <span aria-live="polite">{ok ? 'Copied' : 'Copy ID'}</span>
    </Button>
  );
}
