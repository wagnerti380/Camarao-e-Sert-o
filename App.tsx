
import React, { useState, useEffect } from 'react';
import { Store, Salesperson, Sale, Transaction, FinancialCategory, InventoryItem } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SalesForm from './components/SalesForm';
import SalesList from './components/SalesList';
import FinanceForm from './components/FinanceForm';
import FinanceList from './components/FinanceList';
import InventoryManager from './components/InventoryManager';
import ProductReports from './components/ProductReports';
import ConsolidatedReport from './components/ConsolidatedReport';

const App: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('vendas_app_data_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('vendas_app_data_finance');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('vendas_app_data_inventory');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'Camarão Rosa G', sku: 'CAM-RG', quantity: 50, minQuantity: 10, unitPrice: 85.00, unitCost: 45.00, category: 'Frutos do Mar' },
      { id: 'p2', name: 'Carne de Sol Especial', sku: 'CS-ESP', quantity: 30, minQuantity: 5, unitPrice: 65.00, unitCost: 35.00, category: 'Carnes' }
    ];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'finance' | 'inventory' | 'reports' | 'new-entry' | 'consolidated'>('dashboard');

  useEffect(() => {
    localStorage.setItem('vendas_app_data_sales', JSON.stringify(sales));
    localStorage.setItem('vendas_app_data_finance', JSON.stringify(transactions));
    localStorage.setItem('vendas_app_data_inventory', JSON.stringify(inventory));
  }, [sales, transactions, inventory]);

  const processSaleImpact = (sale: Sale, isReversal: boolean = false) => {
    const multiplier = isReversal ? -1 : 1;
    const transactionUpdates: Transaction[] = [];

    if (!isReversal) {
      transactionUpdates.push({
        id: `t-rev-${sale.id}`,
        date: sale.date,
        amount: sale.amount,
        category: FinancialCategory.RECEITA,
        description: `Venda: ${sale.description}`,
        store: sale.store
      });
    }

    if (sale.productId && sale.quantity) {
      const product = inventory.find(i => i.id === sale.productId);
      if (product) {
        const qtyToChange = multiplier * sale.quantity;
        setInventory(prev => prev.map(item => 
          item.id === sale.productId 
            ? { ...item, quantity: Math.max(0, item.quantity - qtyToChange) }
            : item
        ));

        if (!isReversal) {
          transactionUpdates.push({
            id: `t-cost-${sale.id}`,
            date: sale.date,
            amount: product.unitCost * sale.quantity,
            category: FinancialCategory.CUSTO_VARIAVEL,
            description: `CMV: ${product.name} (x${sale.quantity})`,
            store: sale.store
          });
        }
      }
    }

    return transactionUpdates;
  };

  const handleAddSale = (newSale: Omit<Sale, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const sale: Sale = { ...newSale, id };
    const newFinancials = processSaleImpact(sale);
    setSales(prev => [sale, ...prev]);
    setTransactions(prev => [...newFinancials, ...prev]);
    setActiveTab('sales');
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    const oldSale = sales.find(s => s.id === updatedSale.id);
    if (!oldSale) return;
    processSaleImpact(oldSale, true);
    const filteredTransactions = transactions.filter(t => 
      t.id !== `t-rev-${updatedSale.id}` && t.id !== `t-cost-${updatedSale.id}`
    );
    const newFinancials = processSaleImpact(updatedSale);
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
    setTransactions([...newFinancials, ...filteredTransactions]);
  };

  const handleDeleteSale = (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (saleToDelete) {
      processSaleImpact(saleToDelete, true);
      setTransactions(prev => prev.filter(t => t.id !== `t-rev-${id}` && t.id !== `t-cost-${id}`));
    }
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const handleAddTransaction = (newEntry: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newEntry,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [transaction, ...prev]);
    setActiveTab('finance');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'dashboard' && 'Visão Geral do Negócio'}
            {activeTab === 'sales' && 'Histórico de Vendas'}
            {activeTab === 'finance' && 'Controle Financeiro'}
            {activeTab === 'inventory' && 'Controle de Estoque'}
            {activeTab === 'reports' && 'Performance de Produtos'}
            {activeTab === 'consolidated' && 'Fluxo de Caixa Consolidado'}
            {activeTab === 'new-entry' && 'Novo Lançamento'}
          </h1>
          <p className="text-slate-500 text-sm">Gestão Camarão & Sertão.</p>
        </header>

        {activeTab === 'dashboard' && <Dashboard sales={sales} transactions={transactions} inventory={inventory} />}
        {activeTab === 'sales' && (
          <SalesList 
            sales={sales} 
            inventory={inventory}
            onDelete={handleDeleteSale} 
            onUpdate={handleUpdateSale}
          />
        )}
        {activeTab === 'finance' && <FinanceList transactions={transactions} onDelete={(id) => setTransactions(t => t.filter(x => x.id !== id))} />}
        {activeTab === 'inventory' && <InventoryManager inventory={inventory} onUpdate={setInventory} />}
        {activeTab === 'reports' && <ProductReports sales={sales} inventory={inventory} />}
        {activeTab === 'consolidated' && <ConsolidatedReport transactions={transactions} />}
        {activeTab === 'new-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <h2 className="text-lg font-semibold mb-4 text-slate-700">Registrar Venda</h2>
              <SalesForm onSubmit={handleAddSale} inventory={inventory} />
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-4 text-slate-700">Lançamento Financeiro</h2>
              <FinanceForm onSubmit={handleAddTransaction} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
