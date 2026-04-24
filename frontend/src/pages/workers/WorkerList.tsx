import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Mail, Phone, UserCheck, UserX } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { formatDate } from '../../lib/utils';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../../api/workers';
import type { Worker } from '../../types/workers';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  unavailable: 'bg-gray-100 text-gray-800',
  sick: 'bg-red-100 text-red-800',
  vacation: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  available: 'Tillgänglig',
  unavailable: 'Inte tillgänglig',
  sick: 'Sjuk',
  vacation: 'Semester',
};

export default function WorkerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const queryClient = useQueryClient();

  const { data: workers, isLoading } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: getWorkers,
  });

  const createMutation = useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      setIsCreateOpen(false);
      toast.success('Medarbetare skapad');
    },
    onError: () => toast.error('Kunde inte skapa medarbetare'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Worker> }) => updateWorker(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      setIsEditOpen(false);
      setSelectedWorker(null);
      toast.success('Medarbetare uppdaterad');
    },
    onError: () => toast.error('Kunde inte uppdatera medarbetare'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Medarbetare borttagen');
    },
    onError: () => toast.error('Kunde inte ta bort medarbetare'),
  });

  const filteredWorkers = (workers || [])?.filter(
    (worker: Worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.phone?.includes(searchTerm)
  );

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar medarbetare...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medarbetare</h1>
          <p className="text-muted-foreground">Hantera anställda och arbetare</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny medarbetare
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Skapa ny medarbetare</DialogTitle>
              <DialogDescription>
                Fyll i uppgifterna nedan för att skapa en ny medarbetare.
              </DialogDescription>
            </DialogHeader>
            <WorkerForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Sök namn, e-post eller telefon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Konto</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Inga medarbetare hittades
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkers?.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold">
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      {worker.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm">{worker.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{worker.phone || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[worker.status]}`}>
                      {statusLabels[worker.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {worker.active ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <UserCheck className="h-4 w-4" /> Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                        <UserX className="h-4 w-4" /> Inaktiv
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(worker)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(worker.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redigera medarbetare</DialogTitle>
            <DialogDescription>Uppdatera medarbetaruppgifter.</DialogDescription>
          </DialogHeader>
          {selectedWorker && (
            <WorkerForm
              worker={selectedWorker}
              onSubmit={(data) => updateMutation.mutate({ id: selectedWorker.id, data })}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedWorker(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface WorkerFormProps {
  worker?: Worker;
  onSubmit: (data: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

function WorkerForm({ worker, onSubmit, onCancel }: WorkerFormProps) {
  const [formData, setFormData] = useState({
    name: worker?.name || '',
    person_number: worker?.person_number || '',
    email: worker?.email || '',
    phone: worker?.phone || '',
    address: worker?.address || '',
    password: '',
    status: worker?.status || 'available',
    active: worker?.active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Namn *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="person_number">Personnummer</Label>
          <Input
            id="person_number"
            value={formData.person_number}
            onChange={(e) => handleChange('person_number', e.target.value)}
            placeholder="YYYYMMDD-XXXX"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-post *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adress</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {worker ? 'Nytt lösenord (lämna tomt för att behålla)' : 'Lösenord *'}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          required={!worker}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="available">Tillgänglig</option>
          <option value="unavailable">Inte tillgänglig</option>
          <option value="sick">Sjuk</option>
          <option value="vacation">Semester</option>
        </select>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => handleChange('active', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="active" className="text-sm font-medium cursor-pointer mb-0">
          Aktivera konto
        </Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit">
          {worker ? 'Spara ändringar' : 'Skapa medarbetare'}
        </Button>
      </DialogFooter>
    </form>
  );
}
