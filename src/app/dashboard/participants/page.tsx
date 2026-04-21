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
  DialogFooter,
  DialogDescription
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
import { Search, Edit2, Trash2, UserPlus, X, Filter, QrCode, Download, CheckCircle, Printer, MoreHorizontal, Mail, UserCheck, UserX, Users, ShieldCheck } from "lucide-react";
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

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
              <div class="event-name">ORION EVENT TECHNOLOGY</div>
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
            .badge-card { width: 300px; height: 450px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); position: relative; border: 1px solid #eee; }
            .badge-header { height: 8px; width: 100%; }
            .badge-content { padding: 30px; text-align: center; display: flex; flex-direction: column; align-items: center; height: 100%; box-sizing: border-box; }
            .event-name { font-size: 9px; font-weight: 800; letter-spacing: 2px; color: #999; margin-bottom: 40px; }
            .participant-name { font-size: 22px; font-weight: 700; color: #111; margin-bottom: 4px; line-height: 1.2; }
            .participant-category { font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; }
            .qr-placeholder { width: 110px; height: 110px; margin-bottom: 30px; padding: 8px; border: 1px solid #eee; border-radius: 8px; }
            .qr-placeholder img { width: 100%; height: 100%; }
            .table-info { margin-top: auto; font-size: 11px; font-weight: 700; color: #999; }
            .table-info span { display: block; font-size: 42px; font-weight: 800; color: #000; line-height: 1; }
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Participantes</h1>
          <p className="text-slate-500 font-medium">Gestão estratégica da lista de convidados</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-white border-2 border-slate-100 shadow-xl p-2 rounded-2xl animate-in slide-in-from-right-8">
              <Badge className="bg-primary text-white px-3 py-1 rounded-lg font-black text-[10px]">{selectedIds.length} SELECIONADOS</Badge>
              <div className="h-6 w-px bg-slate-100 mx-1" />
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-10 px-3 rounded-xl font-bold text-emerald-600 hover:bg-emerald-50" onClick={handleBulkCheckin}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Check-in
                </Button>
                <Button size="sm" variant="ghost" className="h-10 px-3 rounded-xl font-bold text-blue-600 hover:bg-blue-50" onClick={() => handlePrintBadges()}>
                  <Printer className="w-4 h-4 mr-2" /> Crachás
                </Button>
                <Button size="sm" variant="ghost" className="h-10 px-3 rounded-xl font-bold text-destructive hover:bg-destructive/5" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl" onClick={() => setSelectedIds([])}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <Button onClick={handleOpenAdd} className="h-14 px-8 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
            <UserPlus className="w-6 h-6" />
            Novo Participante
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input 
            className="h-14 pl-12 pr-12 rounded-2xl border-none bg-white shadow-lg shadow-slate-200/50 focus-visible:ring-4 focus-visible:ring-primary/10 text-lg font-medium"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-14 rounded-2xl border-none bg-white shadow-lg shadow-slate-200/50 font-bold">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-primary" />
              <SelectValue placeholder="Categoria" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem value="all" className="font-bold">Todas Categorias</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-14 rounded-2xl border-none bg-white shadow-lg shadow-slate-200/50 font-bold">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem value="all" className="font-bold">Todos Status</SelectItem>
            <SelectItem value="presente" className="font-bold text-emerald-600">Presentes</SelectItem>
            <SelectItem value="ausente" className="font-bold text-slate-400">Ausentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-16 text-center py-6">
                  <Checkbox 
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onCheckedChange={handleSelectAll}
                    className="rounded-lg w-5 h-5"
                  />
                </TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">Participante</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">Documento</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">Categoria</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">Mesa</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">Status</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6 pr-8">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-32 text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 opacity-20" />
                      </div>
                      <p className="text-lg font-bold">Nenhum participante encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const category = categories.find(c => c.id === p.categoryId);
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <TableRow key={p.id} className={cn(
                      "group transition-all border-slate-50",
                      isSelected ? "bg-primary/5" : "hover:bg-slate-50/50"
                    )}>
                      <TableCell className="text-center py-6">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(p.id, !!checked)}
                          className="rounded-lg w-5 h-5"
                        />
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-lg shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-slate-900 text-lg truncate">{p.name}</div>
                            <div className="text-xs text-slate-400 font-bold flex items-center gap-2 truncate">
                              <Mail className="w-3 h-3 shrink-0" /> {p.email || 'Sem e-mail'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-slate-600 text-sm tabular-nums">{p.cpf}</TableCell>
                      <TableCell>
                        {category && (
                          <Badge 
                            variant="outline" 
                            className="rounded-xl px-4 py-1 font-black text-[10px] uppercase tracking-widest"
                            style={{ color: category.color, borderColor: `${category.color}30`, backgroundColor: `${category.color}10` }}
                          >
                            {category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-slate-900 font-black text-lg shadow-sm">
                          {p.table}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "rounded-xl px-4 py-1 font-black text-[10px] uppercase tracking-widest border-none",
                            p.status === 'presente' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'
                          )}
                        >
                          {p.status === 'presente' ? 'Presente' : 'Ausente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100">
                              <MoreHorizontal className="w-6 h-6" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 border-none shadow-2xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Ações Rápidas</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-3 font-bold" onClick={() => {
                              setSelectedParticipant(p);
                              setIsQrDialogOpen(true);
                            }}>
                              <QrCode className="w-5 h-5 text-primary" /> QR Code Digital
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-3 font-bold" onClick={() => handlePrintBadges([p.id])}>
                              <Printer className="w-5 h-5 text-primary" /> Imprimir Crachá
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-3 font-bold" onClick={() => handleOpenEdit(p)}>
                              <Edit2 className="w-5 h-5 text-primary" /> Editar Cadastro
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 bg-slate-50" />
                            <DropdownMenuItem 
                              className="rounded-xl gap-3 cursor-pointer py-3 font-bold text-destructive focus:text-destructive focus:bg-destructive/5" 
                              onClick={() => {
                                if(confirm(`Excluir ${p.name}?`)) deleteParticipant(p.id);
                              }}
                            >
                              <Trash2 className="w-5 h-5" /> Remover Registro
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
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="max-w-sm rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black">Acesso Digital</DialogTitle>
            <VisuallyHidden>
              <DialogDescription>QR Code de acesso individual.</DialogDescription>
            </VisuallyHidden>
          </DialogHeader>
          {selectedParticipant && (
            <div className="flex flex-col items-center space-y-8 py-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border-2 border-slate-50 relative group">
                <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <QRCodeSVG 
                  value={selectedParticipant.id} 
                  size={200}
                  level="H"
                  includeMargin={false}
                  className="relative z-10"
                />
              </div>
              <div className="text-center space-y-1">
                <p className="font-black text-2xl text-slate-900 leading-tight">{selectedParticipant.name}</p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-black text-[10px] px-2 py-0.5 rounded-lg">MESA {selectedParticipant.table}</Badge>
                  <Badge className="bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-lg">ATIVO</Badge>
                </div>
              </div>
              <Button className="w-full h-16 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20" onClick={() => window.print()}>
                <Download className="w-6 h-6" />
                Baixar QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight">
              {editingParticipant ? 'Editar Registro' : 'Novo Participante'}
            </DialogTitle>
            <VisuallyHidden>
              <DialogDescription>Formulário de cadastro de participante.</DialogDescription>
            </VisuallyHidden>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</Label>
              <Input 
                id="name" 
                required 
                className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-4 focus-visible:ring-primary/10 text-lg font-bold"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-4 focus-visible:ring-primary/10 text-lg font-bold"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">CPF</Label>
                <Input 
                  id="cpf" 
                  required 
                  className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-4 focus-visible:ring-primary/10 text-lg font-bold"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Categoria</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={v => setFormData({...formData, categoryId: v})}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-4 focus-visible:ring-primary/10 text-lg font-bold">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="table" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mesa</Label>
                <Input 
                  id="table" 
                  type="number" 
                  min="1" 
                  required 
                  className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-4 focus-visible:ring-primary/10 text-lg font-bold"
                  value={formData.table}
                  onChange={e => setFormData({...formData, table: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter className="pt-8">
              <Button type="submit" className="w-full h-20 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                {editingParticipant ? 'Salvar Alterações' : 'Finalizar Cadastro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}