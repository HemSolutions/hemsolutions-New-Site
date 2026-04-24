import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Filter, Eye, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatDate } from '../../lib/utils';
import { getReklamationer, deleteReklamation, createReklamation, updateReklamation } from '../../api/reklamation';
import { getCustomers } from '../../api/customers';
import type { Reklamation } from '../../types/workers';
import { toast } from 'sonner';
import ReklamationForm from './ReklamationForm';

const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  new: 'Ny',
  processing: 'Under behandling',
  resolved: 'Åtgärdad',
  rejected: 'Avslagen',
};

export default function ReklamationList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedReklamation, setSelectedReklamation] = useState<Reklamation | null>(null);

  const queryClient = useQueryClient();

  const { data: reklamationer, isLoading } = useQuery({
    queryKey: ['reklamationer'],
    queryFn: getReklamationer,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReklamation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reklamationer'] });
      toast.success('Reklamation borttagen');
    },
    onError: () => toast.error('Kunde inte ta bort reklamation'),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });
  const customerList = Array.isArray(customers) ? customers : (customers?.customers || []);

  const createMutation = useMutation({
    mutationFn: createReklamation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reklamationer'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateReklamation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reklamationer'] });
    },
  });

  const filteredReklamationer = reklamationer?.filter((r: Reklamation) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (r: Reklamation) => {
    setSelectedReklamation(r);
    setIsEditOpen(true);
  };

  const handleView = (r: Reklamation) => {
    setSelectedReklamation(r);
    setIsViewOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar reklamationer...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reklamationer</h1>
          <p className="text-muted-foreground">Hantera kundreklamationer</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny reklamation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Skapa ny reklamation</DialogTitle>
              <DialogDescription>
                Fyll i uppgifterna för att registrera en ny reklamation.
              </DialogDescription>
            </DialogHeader>
            <ReklamationForm
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              onSubmit={(data) => {
                createMutation.mutate(data, {
                  onSuccess: () => {
                    setIsCreateOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['reklamationer'] });
                    toast.success('Reklamation skapad');
                  },
                });
              }}
              customers={customerList}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök reklamation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla statusar</SelectItem>
            <SelectItem value="new">Ny</SelectItem>
            <SelectItem value="processing">Under behandling</SelectItem>
            <SelectItem value="resolved">Åtgärdad</SelectItem>
            <SelectItem value="rejected">Avslagen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kund</TableHead>
              <TableHead>Ärende</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Skapad</TableHead>
              <TableHead>Dela med</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReklamationer?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Inga reklamationer hittades
                </TableCell>
              </TableRow>
            ) : (
              filteredReklamationer?.map((r: Reklamation) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.customer_name}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[r.status]}>
                      {statusLabels[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(r.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.share_with_customer && (
                        <Badge variant="outline" className="text-xs">Kund</Badge>
                      )}
                      {r.share_with_worker && (
                        <Badge variant="outline" className="text-xs">Arbetare</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleView(r)} title="Visa">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Redigera">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)} title="Ta bort">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reklamation: {selectedReklamation?.title}</DialogTitle>
          </DialogHeader>
          {selectedReklamation && (
            <ReklamationForm
              open={isViewOpen}
              onOpenChange={setIsViewOpen}
              reklamation={selectedReklamation}
              viewOnly
              customers={customerList}
              onSubmit={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redigera reklamation</DialogTitle>
            <DialogDescription>Uppdatera reklamationen nedan.</DialogDescription>
          </DialogHeader>
          {selectedReklamation && (
            <ReklamationForm
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              reklamation={selectedReklamation}
              customers={customerList}
              onSubmit={(data) => {
                updateMutation.mutate({ id: selectedReklamation.id, ...data }, {
                  onSuccess: () => {
                    setIsEditOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['reklamationer'] });
                    toast.success('Reklamation uppdaterad');
                  },
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
