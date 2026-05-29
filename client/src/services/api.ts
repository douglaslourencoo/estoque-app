/**
 * Serviço de API para integração com backend
 * Design: Minimalismo Corporativo Moderno
 */

import axios from "axios";
import type {
  CreateMovimentacaoPayload,
  CreatePedidoPayload,
  CreateProdutoPayload,
  Movimentacao,
  Pedido,
  Produto,
  UpdateProdutoPayload,
} from "@/types";

const API_BASE_URL = "https://pedro.flaminio.com.br/socksco-api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * PRODUTOS
 */

export const produtosAPI = {
  /**
   * Listar todos os produtos
   */
  list: async (): Promise<Produto[]> => {
    const response = await apiClient.get<Produto[]>("/produto/lista");
    return response.data;
  },

  /**
   * Criar novo produto
   */
  create: async (payload: CreateProdutoPayload): Promise<Produto> => {
    const response = await apiClient.post<Produto>("/produto/insere", payload);
    return response.data;
  },

  /**
   * Atualizar produto
   */
  update: async (payload: UpdateProdutoPayload): Promise<Produto> => {
    const response = await apiClient.put<Produto>("/produto/atualiza", payload);
    return response.data;
  },

  /**
   * Ativar produto
   */
  activate: async (id: number): Promise<void> => {
    await apiClient.put(`/produto/ativa?id=${id}`);
  },

  /**
   * Inativar produto
   */
  deactivate: async (id: number): Promise<void> => {
    await apiClient.put(`/produto/inativa?id=${id}`);
  },
};

/**
 * MOVIMENTAÇÕES
 */

export const movimentacoesAPI = {
  /**
   * Listar todas as movimentações
   */
  list: async (): Promise<Movimentacao[]> => {
    const response = await apiClient.get<Movimentacao[]>("/movimentacao/lista");
    return response.data;
  },

  /**
   * Inserir estoque (entrada de produtos)
   */
  insertEstoque: async (
    payload: CreateMovimentacaoPayload
  ): Promise<Movimentacao> => {
    const response = await apiClient.post<Movimentacao>(
      "/movimentacao/insereEstoque",
      payload
    );
    return response.data;
  },

  /**
   * Realizar pedido (saída de produtos)
   */
  realizarPedido: async (payload: CreatePedidoPayload): Promise<Pedido> => {
    const response = await apiClient.post<Pedido>(
      "/movimentacao/realizarPedido",
      payload
    );
    return response.data;
  },
};

/**
 * Tratamento de erros
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message || "Erro ao comunicar com o servidor";
  }
  return "Erro desconhecido";
};
