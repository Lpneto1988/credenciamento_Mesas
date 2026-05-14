"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings, Save, Calendar, MapPin, Hash, Users } from "lucide-react";

export default function SettingsPage() {
  const { eventSettings, updateSettings } = useStore();
  const [formData, setFormData] = useState(eventSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <AdminGuard>
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configurações do Evento</h1>
        <p className="text-muted-foreground">Personalize as informações básicas do seu evento</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Informações Gerais
            </CardTitle>
            <CardDescription>Estes dados aparecerão nos relatórios e etiquetas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event-name">Nome do Evento</Label>
              <Input 
                id="event-name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Conferência de Tecnologia 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data
                </Label>
                <Input 
                  id="event-date" 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-tables" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Total de Mesas
                </Label>
                <Input 
                  id="event-tables"
                  type="text"
                  pattern="\d*"
                  inputMode="numeric"
                  min="1"
                  value={formData.totalTables}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, totalTables: parseInt(value, 10) || 0})
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-capacity" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Capacidade por Mesa
                </Label>
                <Input 
                  id="event-capacity"
                  type="text"
                  pattern="\d*"
                  inputMode="numeric"
                  min="1"
                  value={formData.capacityPerTable}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, capacityPerTable: parseInt(value, 10) || 0})
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Localização
                </Label>
                <Input 
                  id="event-location" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="Ex: Hotel Transamérica, São Paulo"
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive text-lg">Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis para o banco de dados local</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => {
              if(confirm("Isso apagará TODOS os participantes e categorias. Tem certeza?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            Resetar Todo o Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
    </AdminGuard>
  );
}