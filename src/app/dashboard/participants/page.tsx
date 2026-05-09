"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { AdminGuard } from "@/components/admin-guard";
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
import { Search, Edit2, Trash2, UserPlus, X, Filter, QrCode, Download, CheckCircle, Printer, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Participant } from "@/types";
import { QRCodeSVG } from "qrcode.react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    setFormData({ name: '', cpf: '', categoryId: categories[0]?.id || '', table: '1' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (p: Participant) => {
    setEditingParticipant(p);
    setFormData({
      name: p.name,
      cpf: p.cpf,
      categoryId: p.categoryId,
      table: p.table.toString()
    });
    // Pequeno atraso para evitar conflito com o fechamento do DropdownMenu
    setTimeout(() => setIsDialogOpen(true), 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
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
    <AdminGuard>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Participantes</h1>
          <p className="text-sm text-slate-500">Gestão completa da lista de convidados.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-200 shadow-sm p-1 rounded-xl animate-in slide-in-from-right-4">
              <span className="text-[10px] font-bold px-2 text-slate-500">{selectedIds.length} selecionados</span>
              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-8 px-2 rounded-lg font-bold text-emerald-600 hover:bg-emerald-50" onClick={handleBulkCheckin}>
                  <CheckCircle className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 px-2 rounded-xl font-bold text-blue-600 hover:bg-blue-50" onClick={() => handlePrintBadges()}>
                  <Printer className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 px-2 rounded-lg font-bold text-destructive hover:bg-destructive/5" onClick={handleBulkDelete}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg" onClick={() => setSelectedIds([])}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
          <Button onClick={handleOpenAdd} className="h-10 px-4 rounded-lg font-bold gap-2 shadow-sm w-full sm:w-auto">
            <UserPlus className="w-4 h-4" />
            Novo Participante
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-slate-900 transition-colors" />
          <Input 
            className="h-10 pl-10 pr-10 rounded-lg border-slate-200 bg-white shadow-sm focus-visible:ring-slate-900/10"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 opacity-50" />
              <SelectValue placeholder="Categoria" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="presente">Presentes</SelectItem>
            <SelectItem value="ausente">Ausentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="min-w-[800px] md:min-w-full">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onCheckedChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 py-3">Participante</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 py-3">Documento</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 py-3">Categoria</TableHead>
                <TableHead className="text-center font-bold text-[10px] uppercase tracking-widest text-slate-400 py-3">Mesa</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 py-3">Status</TableHead>
                <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-400 py-3">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-8 h-8 opacity-10" />
                      <p className="text-xs font-medium">Nenhum participante encontrado</p>
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
                      isSelected ? "bg-slate-50" : "hover:bg-slate-50/30"
                    )}>
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(p.id, !!checked)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px] shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm truncate max-w-[150px] md:max-w-none">{p.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600 text-xs whitespace-nowrap">{p.cpf}</TableCell>
                      <TableCell>
                        {category && (
                          <Badge 
                            variant="outline" 
                            className="rounded-md px-2 py-0 font-bold text-[9px] uppercase tracking-wider whitespace-nowrap"
                            style={{ color: category.color, borderColor: `${category.color}20`, backgroundColor: `${category.color}05` }}
                          >
                            {category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">
                          {p.table}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={p.status === 'presente' ? 'default' : 'secondary'} 
                          className={cn(
                            "rounded-md px-2 py-0 font-bold text-[9px] uppercase tracking-wider whitespace-nowrap",
                            p.status === 'presente' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-100 text-slate-400'
                          )}
                        >
                          {p.status === 'presente' ? 'Presente' : 'Ausente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                            <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1">Opções</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-xs" onClick={() => {
                              setSelectedParticipant(p);
                              // Pequeno atraso para evitar conflito com o fechamento do DropdownMenu
                              setTimeout(() => setIsQrDialogOpen(true), 10);
                            }}>
                              <QrCode className="w-3.5 h-3.5" /> QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-xs" onClick={() => handlePrintBadges([p.id])}>
                              <Printer className="w-3.5 h-3.5" /> Imprimir Crachá
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-xs" onClick={() => handleOpenEdit(p)}>
                              <Edit2 className="w-3.5 h-3.5" /> Editar Dados
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem 
                              className="rounded-lg gap-2 cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/5" 
                              onClick={() => {
                                if(confirm(`Excluir ${p.name}?`)) deleteParticipant(p.id);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
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
        <DialogContent className="max-w-[90vw] sm:max-w-xs rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">Acesso Digital</DialogTitle>
            <DialogDescription className="sr-only">QR Code de acesso.</DialogDescription>
          </DialogHeader>
          {selectedParticipant && (
            <div className="flex flex-col items-center space-y-6 py-2">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <QRCodeSVG 
                  value={selectedParticipant.id} 
                  size={140}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-slate-900 leading-tight">{selectedParticipant.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mesa {selectedParticipant.table}</p>
              </div>
              <Button className="w-full h-11 rounded-lg font-bold gap-2 shadow-sm" onClick={() => window.print()}>
                <Download className="w-4 h-4" />
                Salvar QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingParticipant ? 'Editar Participante' : 'Novo Participante'}
            </DialogTitle>
            <DialogDescription className="sr-only">Formulário de cadastro.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-slate-700 ml-0.5">Nome Completo</Label>
                <Input
                  id="name"
                  required
                  className="h-10 rounded-lg border-slate-200"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpf" className="text-xs font-bold text-slate-700 ml-0.5">CPF</Label>
                <Input
                  id="cpf"
                  className="h-10 rounded-lg border-slate-200"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-bold text-slate-700 ml-0.5">Categoria</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={v => setFormData({...formData, categoryId: v})}
                >
                  <SelectTrigger className="h-10 rounded-lg border-slate-200">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="table" className="text-xs font-bold text-slate-700 ml-0.5">Mesa</Label>
                <Input 
                  id="table" 
                  type="number" 
                  min="1" 
                  required 
                  className="h-10 rounded-lg border-slate-200"
                  value={formData.table}
                  onChange={e => setFormData({...formData, table: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-11 rounded-lg font-bold text-sm shadow-sm">
                {editingParticipant ? 'Salvar Alterações' : 'Cadastrar Participante'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </AdminGuard>
  );
}