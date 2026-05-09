"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const { categories, addCategory, deleteCategory } = useStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addCategory(name, color);
    setName("");
  };

  return (
    <AdminGuard>
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-muted-foreground">Defina os tipos de participantes e suas cores de identificação</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nome</Label>
                <Input 
                  id="cat-name" 
                  placeholder="Ex: VIP, Staff..." 
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-color">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input 
                    id="cat-color" 
                    type="color" 
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                  />
                  <Input 
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
              Nenhuma categoria cadastrada.
            </div>
          ) : (
            categories.map(cat => (
              <Card key={cat.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: cat.color }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold">{cat.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if(confirm(`Excluir categoria ${cat.name}?`)) deleteCategory(cat.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}