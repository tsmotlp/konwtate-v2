import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PaperUploader } from '@/components/paper-uploader';
import { NoteCreator } from './note-creator';

export const GraphActions = () => {
  const router = useRouter();

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <PaperUploader />
      <NoteCreator availableTags={[]} />
    </div>
  );
}; 