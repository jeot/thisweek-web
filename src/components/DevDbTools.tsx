import { backupDB, restoreDB } from '@/lib/dev-db-tools';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function DevDBTools() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="p-2 border rounded">
      <Button onClick={() => backupDB()} className="mr-2">Backup DB</Button>
      <Input
        type="file"
        accept=".db"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) restoreDB(file);
        }}
      />
    </div>
  );
}
