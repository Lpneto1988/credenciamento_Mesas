"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit2, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ParticipantsPage() {
  const { participants, categories, addParticipant, deleteParticipant } = useStore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    categoryId: '',
    table: '1'
  });

  const filtered = participants.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.cpf.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addParticipant({
      name: formData.name,
      email: formData.email,
      cpf: formData.cpf,
      categoryId: formData.categoryId || categories[0]?.id,
      table: parseInt(formData.table)
    });
    setIsAddOpen(false);
    setFormData({ name: '', email: '', cpf: '', categoryId: '', table: '1' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Participantes</h1>
          <p className="text-muted-foreground">Gerencie a lista de convidados do evento</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Novo Participante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Participante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf" 
                    required 
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={v => setFormData({...formData, categoryId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table">Mesa (1-20)</Label>
                  <Input 
                    id="table" 
                    type="number" 
                    min="1" 
                    max="20" 
                    required 
                    value={formData.table}
                    onChange={e => setFormData({...formData, table: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Salvar Participante</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          className="pl-10"
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Mesa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum participante encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const category = categories.find(c => c.id === p.categoryId);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div>{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </TableCell>
                    <TableCell>{p.cpf}</TableCell>
                    <TableCell>
                      {category && (
                        <Badge variant="outline" style={{ color: category.color, borderColor: category.color }}>
                          {category.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">{p.table}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'presente' ? 'default' : 'secondary'} className={p.status === 'presente' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {p.status === 'presente' ? 'Presente' : 'Ausente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteParticipant(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}