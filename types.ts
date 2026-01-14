
export enum Store {
  FORTALEZA = 'Fortaleza',
  JAGUARUANA = 'Jaguaruana',
  DIRETA = 'Direta'
}

export enum Salesperson {
  STELA = 'Stela',
  THIAGO = 'Thiago',
  REGIS = 'Regis'
}

export enum FinancialCategory {
  RECEITA = 'Receita',
  CUSTO_FIXO = 'Custo Fixo',
  CUSTO_VARIAVEL = 'Custo Variável',
  DESPESA_FIXA = 'Despesa Fixa',
  DESPESA_VARIAVEL = 'Despesa Variável'
}

export interface Sale {
  id: string;
  date: string;
  amount: number;
  store: Store;
  salesperson: Salesperson;
  description: string;
  productId?: string;
  quantity?: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: FinancialCategory;
  description: string;
  store: Store;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  unitCost: number; // Added field
  category: string;
}

export interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  type: 'currency' | 'number';
}
