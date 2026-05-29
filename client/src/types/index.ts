/**
 * Tipos compartilhados da aplicação de gerenciamento de estoque
 * Design: Minimalismo Corporativo Moderno
 */

export interface Produto {
  id: number;
  produto: string;
  codBarras: string;
  tipo: string;
  preco: string;
  active: boolean;
}

export interface Movimentacao {
  id: number;
  id_produto: number;
  id_pedido: number | null;
  data: string;
  quantidade: number;
  operacao: string;
  produto?: Produto;
  pedido?: Pedido;
}

export interface Pedido {
  id: number;
  cliente: string;
  data: string;
  total: string;
  movimentacoes?: Movimentacao[];
}

export interface CreateProdutoPayload {
  produto: string;
  codBarras: string;
  tipo: string;
  preco: string;
}

export interface UpdateProdutoPayload extends CreateProdutoPayload {
  id: number;
}

export interface CreateMovimentacaoPayload {
  id_produto: number;
  data: string;
  quantidade: number;
}

export interface CreatePedidoPayload {
  cliente: string;
  data: string;
  total: string;
  movimentacoes: Array<{
    id_produto: number;
    data: string;
    quantidade: number;
  }>;
}

export type OperacaoType = "entrada" | "saida" | "ajuste";
