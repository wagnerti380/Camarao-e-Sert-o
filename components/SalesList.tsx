
import React, { useState, useMemo } from 'react';
import { Sale, InventoryItem, Store, Salesperson } from '../types';

interface SalesListProps {
  sales: Sale[];
  inventory: InventoryItem[];
  onDelete: (id: string) => void;
  onUpdate: (sale: Sale) => void;
}

const SalesList: React.FC<SalesListProps> = ({ sales, inventory, onDelete, onUpdate }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('TODOS');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date).toISOString().split('T')[0];
      const afterStart = startDate === '' || saleDate >= startDate;
      const beforeEnd = endDate === '' || saleDate <= endDate;
      const matchesSalesperson = selectedSalesperson === 'TODOS' || sale.salesperson === selectedSalesperson;
      return afterStart && beforeEnd && matchesSalesperson;
    });
  }, [sales, startDate, endDate, selectedSalesperson]);

  const totalAmount = useMemo(() => {
    return filteredSales.reduce((acc, sale) => acc + sale.amount, 0);
  }, [filteredSales]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSale) {
      onUpdate(editingSale);
      setEditingSale(null);
    }
  };

  const exportToCSV = () => {
    if (filteredSales.length === 0) return;
    const headers = ['Data', 'Descricao', 'Loja', 'Vendedor', 'Valor'];
    const rows = filteredSales.map(sale => [
      new Date(sale.date).toLocaleDateString('pt-BR'),
      sale.description,
      sale.store,
      sale.salesperson,
      sale.amount.toFixed(2)
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_${new Date().getTime()}.csv`);
    link.click();
  };

  return (
    <div className="space-y-4 relative">
      {/* Edit Modal */}
      {editingSale && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Editar Venda</h3>
              <button onClick={() => setEditingSale(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                  <input 
                    type="number" step="0.01" required
                    value={editingSale.amount}
                    onChange={e => setEditingSale({...editingSale, amount: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                  <input 
                    type="date" required
                    value={new Date(editingSale.date).toISOString().split('T')[0]}
                    onChange={e => setEditingSale({...editingSale, date: new Date(e.target.value).toISOString()})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loja</label>
                  <select 
                    value={editingSale.store}
                    onChange={e => setEditingSale({...editingSale, store: e.target.value as Store})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {Object.values(Store).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendedor</label>
                  <select 
                    value={editingSale.salesperson}
                    onChange={e => setEditingSale({...editingSale, salesperson: e.target.value as Salesperson})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {Object.values(Salesperson).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <textarea 
                  required
                  value={editingSale.description}
                  onChange={e => setEditingSale({...editingSale, description: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingSale(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Data Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Data Fim</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Vendedor</label>
          <select
            value={selectedSalesperson}
            onChange={(e) => setSelectedSalesperson(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="TODOS">Todos os Vendedores</option>
            {Object.values(Salesperson).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {(startDate || endDate || selectedSalesperson !== 'TODOS') && (
            <button 
              onClick={() => {setStartDate(''); setEndDate(''); setSelectedSalesperson('TODOS');}} 
              className="px-4 py-2 text-sm text-slate-500 hover:text-indigo-600 font-medium"
            >
              Limpar
            </button>
          )}
          <button
            onClick={exportToCSV}
            disabled={filteredSales.length === 0}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loja</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">Nenhuma venda encontrada.</td></tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{sale.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">{sale.store}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{sale.salesperson}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                      {sale.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex justify-end gap-2">
                      <button
                        onClick={() => setEditingSale(sale)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors p-1"
                        title="Editar Venda"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => onDelete(sale.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Excluir Venda"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredSales.length > 0 && (
              <tfoot className="bg-slate-100/50 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm font-bold text-slate-600 text-right uppercase tracking-wider">
                    Total do Período:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-700">
                    {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesList;
