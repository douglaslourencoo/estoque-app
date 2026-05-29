/**
 * Página de Movimentações
 * Design: Minimalismo Corporativo Moderno - Tabela com filtros
 */

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { movimentacoesAPI, handleApiError } from "@/services/api";
import type { Movimentacao } from "@/types";
import { cn } from "@/lib/utils";

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroOperacao, setFiltroOperacao] = useState<string>("all");
  const [filtroProduto, setFiltroProduto] = useState<string>("all");

  // Carregar movimentações
  const loadMovimentacoes = async () => {
    try {
      setLoading(true);
      const data = await movimentacoesAPI.list();
      setMovimentacoes(data);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovimentacoes();
  }, []);

  // Filtrar movimentações
  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const operacaoMatch =
      filtroOperacao === "all" || mov.operacao === filtroOperacao;
    const produtoMatch =
      filtroProduto === "all" ||
      mov.produto?.produto.toLowerCase().includes(filtroProduto.toLowerCase());
    return operacaoMatch && produtoMatch;
  });

  // Obter lista única de operações
  const operacoes = Array.from(new Set(movimentacoes.map(m => m.operacao)));

  // Obter lista única de produtos
  const produtos = Array.from(
    new Set(
      movimentacoes
        .map(m => m.produto?.produto)
        .filter((p): p is string => Boolean(p))
    )
  );

  // Função para renderizar badge de operação
  const renderOperacaoBadge = (operacao: string) => {
    const config: Record<string, { variant: any; icon: any; label: string }> = {
      ENTRADA: {
        variant: "default",
        icon: TrendingUp,
        label: "Entrada",
      },
      SAIDA: {
        variant: "secondary",
        icon: TrendingDown,
        label: "Saída",
      },
      ajuste: {
        variant: "outline",
        icon: null,
        label: "Ajuste",
      },
    };

    const cfg = config[operacao] || config.ajuste;
    const Icon = cfg.icon;

    return (
      <Badge variant={cfg.variant} className="gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {cfg.label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Movimentações
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Histórico de entrada e saída de produtos
          </p>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary rounded-lg">
          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Filtrar por Operação
            </label>
            <Select value={filtroOperacao} onValueChange={setFiltroOperacao}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Todas as operações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as operações</SelectItem>
                {operacoes.map(op => (
                  <SelectItem key={op} value={op}>
                    {op.charAt(0).toUpperCase() + op.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Filtrar por Produto
            </label>
            <Select value={filtroProduto} onValueChange={setFiltroProduto}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Todos os produtos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {produtos.map((prod: string) => (
                  <SelectItem key={prod} value={prod}>
                    {prod}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-muted-foreground">
                {movimentacoes.length === 0
                  ? "Nenhuma movimentação registrada"
                  : "Nenhuma movimentação encontrada com os filtros selecionados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                      Data
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                      Produto
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                      Operação
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                      Qtd
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Pedido
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoesFiltradas.map((mov, idx) => (
                    <tr
                      key={mov.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-secondary/50",
                        idx % 2 === 0 && "bg-background"
                      )}
                    >
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm text-foreground font-medium">
                        {new Date(mov.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm text-muted-foreground">
                        {mov.produto?.produto || "Produto removido"}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm">
                        {renderOperacaoBadge(mov.operacao)}
                      </td>
                      <td
                        className={cn(
                          "px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm font-semibold text-right",
                          mov.operacao === "ENTRADA"
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {mov.operacao === "ENTRADA" ? "+" : "-"}
                        {mov.quantidade}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm text-muted-foreground">
                        {mov.id_pedido ? `Pedido #${mov.id_pedido}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumo */}
        {movimentacoesFiltradas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-secondary rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total de Movimentações
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {movimentacoesFiltradas.length}
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-secondary rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total de Entradas
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                +
                {movimentacoesFiltradas
                  .filter(m => m.operacao === "ENTRADA")
                  .reduce((sum, m) => sum + m.quantidade, 0)}
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-secondary rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total de Saídas
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                -
                {movimentacoesFiltradas
                  .filter(m => m.operacao === "SAIDA")
                  .reduce((sum, m) => sum + m.quantidade, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
