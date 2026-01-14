
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onUpdate: (items: InventoryItem[]) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: '', sku: '', quantity: 0, minQuantity: 0, unitPrice: 0, unitCost: 0, category: ''
  });

  const categories = useMemo(() => {
    const cats = new Set(inventory.map(item => item.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (!selectedCategory) return inventory;
    return inventory.filter(item => item.category === selectedCategory);
  }, [inventory, selectedCategory]);

  const formErrors = useMemo(() => {
    const errs: string[] = [];
    if (!newItem.name.trim()) errs.push("Nome obrigatório");
    if (newItem.quantity < 0) errs.push("Quantidade não pode ser negativa");
    if (newItem.unitPrice <= 0) errs.push("Preço deve ser positivo");
    if (newItem.unitCost <= 0) errs.push("Custo deve ser positivo");
    if (!newItem.category.trim()) errs.push("Categoria obrigatória");
    return errs;
  }, [newItem]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (formErrors.length > 0) return;

    const item: InventoryItem = {
      ...newItem,
      id: Math.random().toString(36).substr(2, 9)
    };
    onUpdate([...inventory, item]);
    setIsAdding(false);
    setNewItem({ name: '', sku: '', quantity: 0, minQuantity: 0, unitPrice: 0, unitCost: 0, category: '' });
  };

  const handleFieldUpdate = (id: string, field: keyof InventoryItem, value: any) => {
    let safeValue = value;
    if (field === 'quantity') safeValue = isNaN(parseInt(value)) ? 0 : Math.max(0, parseInt(value));
    if (field === 'unitPrice' || field === 'unitCost') safeValue = isNaN(parseFloat(value)) ? 0.01 : Math.max(0.01, parseFloat(value));

    onUpdate(inventory.map(item => 
      item.id === id ? { ...item, [field]: safeValue } : item
    ));
  };

  const handleStockUpdate = (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      handleFieldUpdate(id, 'quantity', item.quantity + delta);
    }
  };

  const exportInventoryToCSV = () => {
    if (filteredInventory.length === 0) return;
    
    const headers = ['Produto', 'SKU', 'Categoria', 'Quantidade', 'Qtd Minima', 'Custo Unitario', 'Preco Venda'];
    const rows = filteredInventory.map(item => [
      item.name,
      item.sku,
      item.category,
      item.quantity,
      item.minQuantity,
      item.unitCost.toFixed(2),
      item.unitPrice.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estoque_camarao_sertao_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold text-slate-700">Catálogo de Produtos</h2>
        <div className="flex gap-2">
          <button 
            onClick={exportInventoryToCSV}
            disabled={filteredInventory.length === 0}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar CSV
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {isAdding ? 'Cancelar' : '+ Novo Produto'}
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase mr-2">Filtrar:</span>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!selectedCategory ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome do Produto</label>
              <input type="text" placeholder="Ex: Camarão Médio Limpo" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">SKU</label>
              <input type="text" placeholder="Código" required value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} className="w-full p-2 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Categoria</label>
              <input type="text" list="existing-categories" placeholder="Ex: Frutos do Mar" required value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full p-2 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
              <datalist id="existing-categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Qtd Inicial</label>
              <input type="number" placeholder="0" required value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Qtd Mínima</label>
              <input type="number" placeholder="5" required value={newItem.minQuantity} onChange={e => setNewItem({...newItem, minQuantity: parseInt(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 text-red-500 uppercase">Custo (R$)</label>
              <input type="number" step="0.01" placeholder="0,00" required value={newItem.unitCost} onChange={e => setNewItem({...newItem, unitCost: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-red-200 rounded outline-none focus:ring-1 focus:ring-red-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 text-green-600 uppercase">Venda (R$)</label>
              <input type="number" step="0.01" placeholder="0,00" required value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-green-200 rounded outline-none focus:ring-1 focus:ring-green-400" />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={formErrors.length > 0}
                className={`w-full py-2 rounded font-bold h-[42px] transition-all ${
                  formErrors.length > 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-md active:scale-[0.98]'
                }`}
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Produto & Categoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Estoque</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Custo</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Preço</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                  Nenhum produto encontrado nesta categoria.
                </td>
              </tr>
            ) : (
              filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                      <span className="text-slate-200">|</span>
                      <input 
                        type="text"
                        value={item.category}
                        list={`list-${item.id}`}
                        onChange={(e) => handleFieldUpdate(item.id, 'category', e.target.value)}
                        className="text-[10px] font-bold text-indigo-500 bg-transparent border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 px-1 rounded transition-all focus:ring-0 focus:outline-none focus:bg-white focus:border-indigo-300 w-auto max-w-[120px] uppercase cursor-pointer"
                        title="Clique para editar a categoria"
                      />
                      <datalist id={`list-${item.id}`}>
                        {categories.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${item.quantity <= item.minQuantity ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {item.quantity <= item.minQuantity ? 'Reposição' : 'OK'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleStockUpdate(item.id, -1)} 
                        className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => handleFieldUpdate(item.id, 'quantity', e.target.value)}
                        className={`w-14 text-center py-1 border border-transparent hover:border-slate-300 rounded-md font-bold text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${item.quantity <= item.minQuantity ? 'text-red-600' : ''}`}
                      />
                      <button 
                        onClick={() => handleStockUpdate(item.id, 1)} 
                        className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-500 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">R$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={item.unitCost}
                        onChange={(e) => handleFieldUpdate(item.id, 'unitCost', e.target.value)}
                        className="w-16 p-1 border border-transparent hover:border-slate-200 rounded text-sm text-red-600 font-medium focus:border-indigo-500 focus:bg-white outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">R$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={item.unitPrice}
                        onChange={(e) => handleFieldUpdate(item.id, 'unitPrice', e.target.value)}
                        className="w-16 p-1 border border-transparent hover:border-slate-200 rounded text-sm text-green-700 font-medium focus:border-indigo-500 focus:bg-white outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { if(confirm('Excluir este produto?')) onUpdate(inventory.filter(i => i.id !== item.id)) }} 
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager;
