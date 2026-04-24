import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

interface ReklamationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reklamation?: any;
  onSubmit: (data: any) => void;
  customers?: any[];
  viewOnly?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReklamationForm({ open, onOpenChange, reklamation, onSubmit, customers = [], viewOnly = false, onSuccess, onCancel }: ReklamationFormProps) {
  const [formData, setFormData] = useState({
    customer_id: reklamation?.customer_id || '',
    title: reklamation?.title || '',
    description: reklamation?.description || '',
    status: reklamation?.status || 'new',
    assigned_to: reklamation?.assigned_to || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    onSubmit(formData);
    onOpenChange(false);
    onSuccess?.();
    toast.success('Reklamation sparad');
  };

  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{reklamation ? 'Redigera reklamation' : 'Ny reklamation'}</DialogTitle>
          <DialogDescription>Fyll i reklamationens detaljer</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kund</Label>
            <Select
              value={String(formData.customer_id)}
              onValueChange={(v) => setFormData({ ...formData, customer_id: v })}
            >
              <SelectTrigger className={viewOnly ? "opacity-50 cursor-not-allowed" : ""}>
                <SelectValue placeholder="Välj kund" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ärende</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ärendebeskrivning"
              readOnly={viewOnly}
              className={viewOnly ? "bg-gray-50" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Beskrivning</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detaljerad beskrivning av problemet"
              rows={4}
              readOnly={viewOnly}
              className={viewOnly ? "bg-gray-50" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger className={viewOnly ? "opacity-50 cursor-not-allowed" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Ny</SelectItem>
                <SelectItem value="processing">Under behandling</SelectItem>
                <SelectItem value="resolved">Åtgärdad</SelectItem>
                <SelectItem value="rejected">Avslagen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Avbryt
            </Button>
            {!viewOnly && <Button type="submit">Spara</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
