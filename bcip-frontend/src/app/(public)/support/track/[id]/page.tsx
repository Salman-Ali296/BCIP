import { TrackView } from '@/features/Track/TrackView';

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackView id={id} />;
}
