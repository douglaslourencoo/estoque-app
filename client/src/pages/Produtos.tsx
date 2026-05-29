/**
 * Página de Listagem de Produtos
 * Design: Minimalismo Corporativo Moderno - Tabela clara com ações
 */

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit2, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { produtosAPI, handleApiError } from "@/services/api";
import type { Produto, CreateProdutoPayload } from "@/types";
import { cn } from "@/lib/utils";

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{
    id: number;
    action: "activate" | "deactivate";
  } | null>(null);

  const [formData, setFormData] = useState<CreateProdutoPayload>({
    produto: "",
    codBarras: "",
    tipo: "",
    preco: "",
  });

  // Carregar produtos
  const loadProdutos = async () => {
    try {
      setLoading(true);
      const data = await produtosAPI.list();
      setProdutos(data);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  // Abrir modal para criar novo
  const handleNewProduto = () => {
    setEditingId(null);
    setFormData({
      produto: "",
      codBarras: "",
      tipo: "",
      preco: "",
    });
    setOpenModal(true);
  };

  // Abrir modal para editar
  const handleEditProduto = (produto: Produto) => {
    setEditingId(produto.id);
    setFormData({
      produto: produto.produto,
      codBarras: produto.codBarras,
      tipo: produto.tipo,
      preco: produto.preco,
    });
    setOpenModal(true);
  };

  // Salvar produto
  const handleSaveProduto = async () => {
    try {
      if (
        !formData.produto ||
        !formData.codBarras ||
        !formData.tipo ||
        !formData.preco
      ) {
        toast.error("Preencha todos os campos");
        return;
      }

      if (editingId) {
        await produtosAPI.update({
          id: editingId,
          ...formData,
        });
        toast.success("Produto atualizado com sucesso");
      } else {
        await produtosAPI.create(formData);
        toast.success("Produto criado com sucesso");
      }

      setOpenModal(false);
      loadProdutos();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  // Ativar/Inativar produto
  const handleToggleProduto = async (
    id: number,
    action: "activate" | "deactivate"
  ) => {
    try {
      if (action === "activate") {
        await produtosAPI.activate(id);
        toast.success("Produto ativado");
      } else {
        await produtosAPI.deactivate(id);
        toast.success("Produto inativado");
      }
      setToggleConfirm(null);
      loadProdutos();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Produtos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Gerenciar catálogo de produtos
            </p>
          </div>
          <Button onClick={handleNewProduto} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>

        {/* Tabela */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-muted-foreground">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-xs sm:text-sm font-semibold text-foreground text-center">
                      Produto
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-center text-sm font-semibold text-foreground">
                      Código de Barras
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-2 md:py-3 text-center text-xs sm:text-sm font-semibold text-foreground">
                      Tipo
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-center text-xs sm:text-sm font-semibold text-foreground">
                      Preço
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-center text-xs sm:text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-center text-xs sm:text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto, idx) => (
                    <tr
                      key={produto.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-secondary/50",
                        idx % 2 === 0 && "bg-background"
                      )}
                    >
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm text-foreground font-medium">
                        {produto.produto}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm text-muted-foreground font-mono">
                        {produto.codBarras}
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm text-muted-foreground">
                        {produto.tipo}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm text-foreground font-medium">
                        {produto.preco}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm justify-center flex">
                        <Badge
                          variant={produto.active ? "default" : "secondary"}
                          className="text-xs font-medium"
                        >
                          {produto.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2 justify-center hover:text-neutral-400">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduto(produto)}
                            className="gap-1 h-8 px-2 text-xs sm:text-sm"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setToggleConfirm({
                                id: produto.id,
                                action: produto.active
                                  ? "deactivate"
                                  : "activate",
                              })
                            }
                            className={cn(
                              "gap-1 h-8 px-2 text-xs sm:text-sm",
                              produto.active
                                ? "text-destructive hover:text-destructive"
                                : "text-green-600 hover:text-green-700"
                            )}
                          >
                            {produto.active ? (
                              <>
                                <PowerOff className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">
                                  Inativar
                                </span>
                              </>
                            ) : (
                              <>
                                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Ativar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Atualize os dados do produto"
                : "Preencha os dados do novo produto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="produto">Nome do Produto</Label>
              <Input
                id="produto"
                placeholder="Ex: Meião Profissional Antiderrapante"
                value={formData.produto}
                onChange={e =>
                  setFormData({ ...formData, produto: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="codBarras">Código de Barras</Label>
              <Input
                id="codBarras"
                placeholder="Ex: 7891234567001"
                value={formData.codBarras}
                onChange={e =>
                  setFormData({ ...formData, codBarras: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                placeholder="Ex: Futebol"
                value={formData.tipo}
                onChange={e =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="preco">Preço</Label>
              <Input
                id="preco"
                placeholder="Ex: 45.90"
                value={formData.preco}
                onChange={e =>
                  setFormData({ ...formData, preco: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpenModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveProduto} className="flex-1">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Ativar/Inativar */}
      <AlertDialog
        open={toggleConfirm !== null}
        onOpenChange={open => !open && setToggleConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleConfirm?.action === "activate"
                ? "Ativar Produto?"
                : "Inativar Produto?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleConfirm?.action === "activate"
                ? "Este produto será ativado e ficará disponível para venda."
                : "Este produto será inativado e não ficará disponível para venda."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toggleConfirm) {
                  handleToggleProduto(toggleConfirm.id, toggleConfirm.action);
                }
              }}
            >
              Confirmar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
