/**
 * Página de Inserir Estoque
 * Design: Minimalismo Corporativo Moderno - Formulário claro e direto
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
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { produtosAPI, movimentacoesAPI, handleApiError } from "@/services/api";
import type { Produto } from "@/types";
import { format } from "date-fns";

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_produto: "",
    codBarras: "",
    quantidade: "",
    data: format(new Date(), "yyyy-MM-dd"),
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

  // Quando seleciona um produto, preenche o código de barras
  const handleSelectProduto = (id: string) => {
    const produto = produtos.find(p => p.id === parseInt(id));
    setFormData({
      ...formData,
      id_produto: id,
      codBarras: produto?.codBarras || "",
    });
  };

  // Quando escaneia código de barras, seleciona o produto
  const handleCodeBarrasChange = (value: string) => {
    const produto = produtos.find(p => p.codBarras === value);
    if (produto) {
      setFormData({
        ...formData,
        codBarras: value,
        id_produto: produto.id.toString(),
      });
    } else {
      setFormData({
        ...formData,
        codBarras: value,
      });
    }
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.id_produto || !formData.quantidade) {
        toast.error("Preencha todos os campos");
        return;
      }

      setSubmitting(true);

      await movimentacoesAPI.insertEstoque({
        id_produto: parseInt(formData.id_produto),
        data: formData.data,
        quantidade: parseInt(formData.quantidade),
      });

      toast.success("Estoque inserido com sucesso");

      // Limpar formulário
      setFormData({
        id_produto: "",
        codBarras: "",
        quantidade: "",
        data: format(new Date(), "yyyy-MM-dd"),
      });
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
            Inserir Estoque
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Registrar entrada de produtos recém fabricados
          </p>
        </div>

        {/* Formulário */}
        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Seleção de Produto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div>
                <Label htmlFor="produto">Produto</Label>
                <Select
                  value={formData.id_produto}
                  onValueChange={handleSelectProduto}
                >
                  <SelectTrigger id="produto" className="mt-1 w-full">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map(produto => (
                      <SelectItem
                        key={produto.id}
                        value={produto.id.toString()}
                      >
                        <div className="flex flex-col">
                          <span>{produto.produto}</span>
                          <span className="text-xs text-muted-foreground">
                            {produto.codBarras}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Código de Barras */}
              <div>
                <Label htmlFor="codBarras">Código de Barras</Label>
                <Input
                  id="codBarras"
                  placeholder="Escanear ou digitar"
                  value={formData.codBarras}
                  onChange={e => handleCodeBarrasChange(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
            </div>

            {/* Data e Quantidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
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
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={formData.quantidade}
                  onChange={e =>
                    setFormData({ ...formData, quantidade: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Informações do Produto Selecionado */}
            {formData.id_produto && (
              <div className="p-3 sm:p-4 bg-secondary rounded-lg">
                {(() => {
                  const produto = produtos.find(
                    p => p.id === parseInt(formData.id_produto)
                  );
                  return (
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <p className="font-medium text-foreground">
                          {produto?.tipo}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preço:</span>
                        <p className="font-medium text-foreground">
                          {produto?.preco}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    id_produto: "",
                    codBarras: "",
                    quantidade: "",
                    data: format(new Date(), "yyyy-MM-dd"),
                  })
                }
                className="flex-1"
              >
                Limpar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Inserir Estoque
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info */}
        <div className="p-3 sm:p-4 bg-secondary rounded-lg text-xs sm:text-sm text-muted-foreground">
          <p>
            💡 <strong>Dica:</strong> Você pode escanear o código de barras
            diretamente no campo de código de barras para selecionar o produto
            automaticamente.
          </p>
        </div>
      </div>
    </Layout>
  );
}
