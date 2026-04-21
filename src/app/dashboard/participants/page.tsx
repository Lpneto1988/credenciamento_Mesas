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
import { Search, Edit2, Trash2, UserPlus, X, Filter, QrCode, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Participant } from "@/types";
import { QRCodeSVG } from "qrcode.react";

export default function ParticipantsPage() {
  const { participants, categories, addParticipant, updateParticipant, deleteParticipant } = useStore();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    categoryId: '',
    table: '1'
  });

  const filtered = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search);
    const matchesCategory = filterCategory === "all" || p.categoryId === filterCategory;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingParticipant(null);
    setFormData({ name: '', email: '', cpf: '', categoryId: categories[0]?.id || '', table: '1' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (p: Participant) => {
    setEditingParticipant(p);
    setFormData({
      name: p.name,
      email: p.email,
      cpf: p.cpf,
      categoryId: p.categoryId,
      table: p.table.toString()
    });
    setIsDialogOpen(true);
  };

  const handleOpenQr = (p: Participant) => {
    setSelectedParticipant(p);
    setIsQrDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      email: formData.email,
      cpf: formData.cpf,
      categoryId: formData.categoryId,
      table: parseInt(formData.table)
    };

    if (editingParticipant) {
      updateParticipant(editingParticipant.id, data);
    } else {
      addParticipant(data);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Participantes</h1>
          <p className="text-muted-foreground">Gerencie a lista de convidados do evento</p>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Participante
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            className="pl-10 pr-10"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <Filter className="w-4 h-4 mr-2 opacity-50" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="presente">Presentes</SelectItem>
            <SelectItem value="ausente">Ausentes</SelectItem>
          </SelectContent>
        </Select>
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
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <p>Nenhum participante encontrado com os filtros atuais.</p>
                  </div>
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => handleOpenQr(p)}
                          title="Ver QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if(confirm(`Excluir ${p.name}?`)) deleteParticipant(p.id);
                          }}
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

      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">QR Code de Acesso</DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <div className="flex flex-col items-center space-y-6 py-6">
              <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-slate-100">
                <QRCodeSVG 
                  value={selectedParticipant.id} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center">
                <p className="font-black text-xl text-slate-900">{selectedParticipant.name}</p>
                <p className="text-sm text-muted-foreground">Mesa {selectedParticipant.table}</p>
              </div>
              <Button className="w-full gap-2" onClick={() => window.print()}>
                <Download className="w-4 h-4" />
                Imprimir QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingParticipant ? 'Editar Participante' : 'Adicionar Participante'}</DialogTitle>
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
              <Button type="submit" className="w-full">
                {editingParticipant ? 'Salvar Alterações' : 'Cadastrar Participante'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}