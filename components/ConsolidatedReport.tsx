
import React, { useState, useMemo } from 'react';
import { Transaction, Store, FinancialCategory } from '../types';

interface ConsolidatedReportProps {
  transactions: Transaction[];
}

const ConsolidatedReport: React.FC<ConsolidatedReportProps> = ({ transactions }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | 'TODAS'>('TODAS');

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      const afterStart = startDate === '' || dateStr >= startDate;
      const beforeEnd = endDate === '' || dateStr <= endDate;
      const matchStore = selectedStore === 'TODAS' || t.store === selectedStore;
      return afterStart && beforeEnd && matchStore;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, startDate, endDate, selectedStore]);

  const summary = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      if (curr.category === FinancialCategory.RECEITA) {
        acc.income += curr.amount;
      } else {
        acc.expense += curr.amount;
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [filteredData]);

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['Data', 'Descricao', 'Loja', 'Categoria', 'Valor'];
    const rows = filteredData.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description,
      t.store,
      t.category,
      t.amount.toFixed(2)
    ]);
    const csvContent = ["\ufeff" + headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `consolidado_${selectedStore}_${new Date().getTime()}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Loja</label>
          <select 
            value={selectedStore} 
            onChange={(e) => setSelectedStore(e.target.value as any)}
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="TODAS">Todas as Lojas</option>
            {Object.values(Store).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Início</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Fim</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => {setStartDate(''); setEndDate(''); setSelectedStore('TODAS');}} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">Limpar</button>
          <button onClick={exportToCSV} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors">Exportar</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Receitas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{summary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Despesas/Custos</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{summary.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-xl border-l-4 border-indigo-300 shadow-md text-white">
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Saldo Final</p>
          <p className="text-2xl font-bold mt-1">{summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <h3 className="font-bold text-slate-700">Movimentações Detalhadas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Loja</th>
                <th className="px-6 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Nenhum lançamento no período/filtro selecionado.</td></tr>
              ) : (
                filteredData.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        t.category === FinancialCategory.RECEITA ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{t.store}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${
                      t.category === FinancialCategory.RECEITA ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.category === FinancialCategory.RECEITA ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedReport;
