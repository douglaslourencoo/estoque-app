/**
 * Página de Cadastrar Pedidos
 * Design: Minimalismo Corporativo Moderno - Formulário com itens dinâmicos
 */

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { produtosAPI, movimentacoesAPI, handleApiError } from "@/services/api";
import type { Produto } from "@/types";
import { format } from "date-fns";

interface ItemPedido {
  id_produto: number;
  quantidade: number;
  preco: string;
  data: string;
}

export default function Pedidos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    cliente: "",
    data: format(new Date(), "yyyy-MM-dd"),
    total: "",
  });

  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [novoItem, setNovoItem] = useState({
    id_produto: "",
    quantidade: "",
  });

  // Carregar produtos
  const loadProdutos = async () => {
    try {
      setLoading(true);
      const data = await produtosAPI.list();
      setProdutos(data.filter(p => p.active));
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  // Calcular total
  const calcularTotal = () => {
    const total = itens.reduce((sum, item) => {
      const preco = parseFloat(item.preco.replace("R$", "").replace(",", "."));
      return sum + preco * item.quantidade;
    }, 0);
    return `R$ ${total.toFixed(2).replace(".", ",")}`;
  };

  // Adicionar item ao pedido
  const handleAdicionarItem = () => {
    if (!novoItem.id_produto || !novoItem.quantidade) {
      toast.error("Selecione um produto e quantidade");
      return;
    }

    const produto = produtos.find(p => p.id === parseInt(novoItem.id_produto));
    if (!produto) {
      toast.error("Produto não encontrado");
      return;
    }

    // Verificar se o produto já está no pedido
    if (itens.some(i => i.id_produto === parseInt(novoItem.id_produto))) {
      toast.error("Produto já adicionado ao pedido");
      return;
    }

    setItens([
      ...itens,
      {
        id_produto: parseInt(novoItem.id_produto),
        quantidade: parseInt(novoItem.quantidade),
        preco: produto.preco,
        data: formData.data,
      },
    ]);

    setNovoItem({ id_produto: "", quantidade: "" });
  };

  // Remover item do pedido
  const handleRemoverItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  // Submeter pedido
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.cliente || !formData.total || itens.length === 0) {
        toast.error("Preencha todos os campos e adicione itens ao pedido");
        return;
      }

      setSubmitting(true);

      await movimentacoesAPI.realizarPedido({
        cliente: formData.cliente,
        data: formData.data,
        total: formData.total,
        movimentacoes: itens.map(item => ({
          id_produto: item.id_produto,
          data: item.data,
          quantidade: item.quantidade,
        })),
      });

      toast.success("Pedido criado com sucesso");

      // Limpar formulário
      setFormData({
        cliente: "",
        data: format(new Date(), "yyyy-MM-dd"),
        total: "",
      });
      setItens([]);
      setNovoItem({ id_produto: "", quantidade: "" });
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Cadastrar Pedido
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Criar novo pedido de venda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Informações do Pedido */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
              Informações do Pedido
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  placeholder="Nome do cliente"
                  value={formData.cliente}
                  onChange={e =>
                    setFormData({ ...formData, cliente: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={e =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="total">Total</Label>
                <Input
                  id="total"
                  placeholder="R$ 0,00"
                  value={formData.total || calcularTotal()}
                  onChange={e =>
                    setFormData({ ...formData, total: e.target.value })
                  }
                  disabled
                  className="mt-1 bg-secondary"
                />
              </div>
            </div>
          </Card>

          {/* Adicionar Itens */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
              Itens do Pedido
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Formulário para adicionar item */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-border">
                <div>
                  <Label
                    htmlFor="produto-select"
                    className="text-xs sm:text-sm"
                  >
                    Produto
                  </Label>
                  <Select
                    value={novoItem.id_produto}
                    onValueChange={value =>
                      setNovoItem({ ...novoItem, id_produto: value })
                    }
                  >
                    <SelectTrigger
                      id="produto-select"
                      className="mt-1 text-xs sm:text-sm w-full"
                    >
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map(produto => (
                        <SelectItem
                          key={produto.id}
                          value={produto.id.toString()}
                        >
                          {produto.produto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="quantidade-input"
                    className="text-xs sm:text-sm"
                  >
                    Quantidade
                  </Label>
                  <Input
                    id="quantidade-input"
                    type="number"
                    placeholder="0"
                    min="1"
                    value={novoItem.quantidade}
                    onChange={e =>
                      setNovoItem({ ...novoItem, quantidade: e.target.value })
                    }
                    className="mt-1 text-xs sm:text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleAdicionarItem}
                    className="w-full gap-2 text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Adicionar</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>

              {/* Lista de itens */}
              {itens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item adicionado ao pedido
                </div>
              ) : (
                <div className="space-y-2">
                  {itens.map((item, index) => {
                    const produto = produtos.find(
                      p => p.id === item.id_produto
                    );
                    const subtotal =
                      parseFloat(
                        item.preco.replace("R$", "").replace(",", ".")
                      ) * item.quantidade;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {produto?.produto}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantidade}x {item.preco} = R${" "}
                            {subtotal.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Resumo e Botões */}
          {itens.length > 0 && (
            <Card className="p-6 bg-secondary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total do Pedido
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {calcularTotal()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        cliente: "",
                        data: format(new Date(), "yyyy-MM-dd"),
                        total: "",
                      });
                      setItens([]);
                      setNovoItem({ id_produto: "", quantidade: "" });
                    }}
                  >
                    Limpar
                  </Button>
                  <Button type="submit" disabled={submitting} className="gap-2">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar Pedido
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </form>
      </div>
    </Layout>
  );
}
