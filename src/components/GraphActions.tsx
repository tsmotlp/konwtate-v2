import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export const GraphActions = () => {
  const router = useRouter();

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <Button
        onClick={() => router.push('/papers/upload')}
        size="sm"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
      >
        Upload Paper
      </Button>
      <Button
        onClick={() => router.push('/notes/create')}
        size="sm"
        className="bg-green-500 hover:bg-green-600 text-white font-bold"
      >
        Create Note
      </Button>
    </div>
  );
}; 