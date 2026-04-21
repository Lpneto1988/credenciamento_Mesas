"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Edit2, Trash2, UserPlus, X, Filter, QrCode, Download, CheckCircle, Printer, MoreHorizontal, Mail, UserCheck, UserX, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Participant } from "@/types";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ParticipantsPage() {
  const { 
    participants, 
    categories, 
    addParticipant, 
    updateParticipant, 
    deleteParticipant,
    bulkDeleteParticipants,
    bulkCheckinParticipants
  } = useStore();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
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

  const stats = {
    total: filtered.length,
    present: filtered.filter(p => p.status === 'presente').length,
    absent: filtered.filter(p => p.status === 'ausente').length,
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} participantes?`)) {
      bulkDeleteParticipants(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkCheckin = () => {
    bulkCheckinParticipants(selectedIds);
    setSelectedIds([]);
  };

  const handlePrintBadges = (ids?: string[]) => {
    const targetIds = ids || selectedIds;
    const selectedParticipants = participants.filter(p => targetIds.includes(p.id));
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const badgesHtml = selectedParticipants.map(p => {
      const category = categories.find(c => c.id === p.categoryId);
      return `
        <div class="badge-container">
          <div class="badge-card">
            <div class="badge-header" style="background-color: ${category?.color || '#000'}"></div>
            <div class="badge-content">
              <div class="event-name">EVENTCHECK 2024</div>
              <div class="participant-name">${p.name}</div>
              <div class="participant-category">${category?.name || 'Participante'}</div>
              <div class="qr-placeholder">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${p.id}" />
              </div>
              <div class="table-info">MESA <span>${p.table}</span></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background: #f4f4f4; }
            .badge-container { display: inline-block; margin: 10px; page-break-inside: avoid; }
            .badge-card { width: 300px; height: 450px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); position: relative; border: 1px solid #eee; }
            .badge-header { height: 15px; width: 100%; }
            .badge-content { padding: 30px; text-align: center; display: flex; flex-direction: column; align-items: center; height: 100%; box-sizing: border-box; }
            .event-name { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: #999; margin-bottom: 40px; }
            .participant-name { font-size: 24px; font-weight: 800; color: #111; margin-bottom: 5px; line-height: 1.2; }
            .participant-category { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; }
            .qr-placeholder { width: 120px; height: 120px; margin-bottom: 30px; padding: 10px; border: 1px solid #eee; border-radius: 15px; }
            .qr-placeholder img { width: 100%; height: 100%; }
            .table-info { margin-top: auto; font-size: 12px; font-weight: 700; color: #999; }
            .table-info span { display: block; font-size: 48px; font-weight: 900; color: #000; line-height: 1; }
            @media print { 
              body { background: white; padding: 0; }
              .badge-card { box-shadow: none; border: 1px solid #ddd; margin: 0; }
            }
          </style>
        </head>
        <body>
          ${badgesHtml}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Participantes</h1>
          <p className="text-slate-500">Gerencie a lista de convidados e emita credenciais.</p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-white border shadow-sm p-1.5 rounded-2xl animate-in slide-in-from-right-4">
              <span className="text-xs font-black px-3 text-primary">{selectedIds.length} selecionados</span>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <Button size="sm" variant="ghost" className="h-9 rounded-xl gap-2 font-bold text-emerald-600 hover:bg-emerald-50" onClick={handleBulkCheckin}>
                <CheckCircle className="w-4 h-4" /> Check-in
              </Button>
              <Button size="sm" variant="ghost" className="h-9 rounded-xl gap-2 font-bold text-blue-600 hover:bg-blue-50" onClick={() => handlePrintBadges()}>
                <Printer className="w-4 h-4" /> Crachás
              </Button>
              <Button size="sm" variant="ghost" className="h-9 rounded-xl gap-2 font-bold text-destructive hover:bg-destructive/5" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4" /> Excluir
              </Button>
              <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-xl" onClick={() => setSelectedIds([])}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20">
            <UserPlus className="w-5 h-5" />
            Novo Participante
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-xl">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrados</p>
            <p className="text-xl font-black text-slate-900">{stats.total}</p>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Presentes</p>
            <p className="text-xl font-black text-slate-900">{stats.present}</p>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl">
            <UserX className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Ausentes</p>
            <p className="text-xl font-black text-slate-900">{stats.absent}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input 
            className="h-12 pl-12 pr-10 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 opacity-50" />
              <SelectValue placeholder="Categoria" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="presente">Presentes</SelectItem>
            <SelectItem value="ausente">Ausentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-14 text-center">
                <Checkbox 
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onCheckedChange={handleSelectAll}
                  className="rounded-md"
                />
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Participante</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Documento</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Categoria</TableHead>
              <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-400">Mesa</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-24 text-slate-400">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                      <Search className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">Nenhum participante encontrado</p>
                      <p className="text-sm">Tente ajustar seus filtros ou busca.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const category = categories.find(c => c.id === p.categoryId);
                const isSelected = selectedIds.includes(p.id);
                return (
                  <TableRow key={p.id} className={cn(
                    "group transition-colors border-slate-50",
                    isSelected ? "bg-primary/5" : "hover:bg-slate-50/50"
                  )}>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectOne(p.id, !!checked)}
                        className="rounded-md"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {p.email || 'Sem e-mail'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">{p.cpf}</TableCell>
                    <TableCell>
                      {category && (
                        <Badge 
                          variant="outline" 
                          className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider"
                          style={{ color: category.color, borderColor: `${category.color}30`, backgroundColor: `${category.color}10` }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs">
                        {p.table}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={p.status === 'presente' ? 'default' : 'secondary'} 
                        className={cn(
                          "rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider",
                          p.status === 'presente' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        {p.status === 'presente' ? 'Presente' : 'Ausente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1.5">Ações</DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer" onClick={() => {
                            setSelectedParticipant(p);
                            setIsQrDialogOpen(true);
                          }}>
                            <QrCode className="w-4 h-4" /> QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer" onClick={() => handlePrintBadges([p.id])}>
                            <Printer className="w-4 h-4" /> Imprimir Crachá
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer" onClick={() => handleOpenEdit(p)}>
                            <Edit2 className="w-4 h-4" /> Editar Dados
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem 
                            className="rounded-xl gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5" 
                            onClick={() => {
                              if(confirm(`Excluir ${p.name}?`)) deleteParticipant(p.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <DialogContent className="max-w-xs rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-black">Acesso Digital</DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <div className="flex flex-col items-center space-y-8 py-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-200 border-2 border-slate-50">
                <QRCodeSVG 
                  value={selectedParticipant.id} 
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="font-black text-2xl text-slate-900 leading-tight">{selectedParticipant.name}</p>
                <p className="text-sm font-bold text-primary uppercase tracking-widest">Mesa {selectedParticipant.table}</p>
              </div>
              <Button className="w-full h-14 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20" onClick={() => window.print()}>
                <Download className="w-5 h-5" />
                Salvar QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {editingParticipant ? 'Editar Participante' : 'Novo Participante'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold text-slate-700 ml-1">Nome Completo</Label>
              <Input 
                id="name" 
                required 
                className="h-12 rounded-xl border-slate-200"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700 ml-1">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="h-12 rounded-xl border-slate-200"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="font-bold text-slate-700 ml-1">CPF</Label>
                <Input 
                  id="cpf" 
                  required 
                  className="h-12 rounded-xl border-slate-200"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="font-bold text-slate-700 ml-1">Categoria</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={v => setFormData({...formData, categoryId: v})}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="table" className="font-bold text-slate-700 ml-1">Mesa</Label>
                <Input 
                  id="table" 
                  type="number" 
                  min="1" 
                  required 
                  className="h-12 rounded-xl border-slate-200"
                  value={formData.table}
                  onChange={e => setFormData({...formData, table: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
                {editingParticipant ? 'Salvar Alterações' : 'Cadastrar Participante'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}