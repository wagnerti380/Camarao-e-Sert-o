
import React, { useState, useMemo } from 'react';
import { Sale, InventoryItem } from '../types';

interface ProductReportsProps {
  sales: Sale[];
  inventory: InventoryItem[];
}

interface ProductStats {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

const ProductReports: React.FC<ProductReportsProps> = ({ sales, inventory }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportData = useMemo(() => {
    const stats: Record<string, ProductStats> = {};

    // Filter sales by date first
    const filteredSales = sales.filter(sale => {
      if (!sale.productId) return false;
      const saleDate = new Date(sale.date).toISOString().split('T')[0];
      const afterStart = startDate === '' || saleDate >= startDate;
      const beforeEnd = endDate === '' || saleDate <= endDate;
      return afterStart && beforeEnd;
    });

    filteredSales.forEach(sale => {
      const pid = sale.productId!;
      const product = inventory.find(i => i.id === pid);
      const name = product ? product.name : 'Produto Excluído';
      const sku = product ? product.sku : '---';
      const costPerUnit = product ? product.unitCost : 0;
      const qty = sale.quantity || 0;

      if (!stats[pid]) {
        stats[pid] = { id: pid, name, sku, quantity: 0, revenue: 0, cost: 0, profit: 0 };
      }

      stats[pid].quantity += qty;
      stats[pid].revenue += sale.amount;
      stats[pid].cost += (costPerUnit * qty);
      stats[pid].profit = stats[pid].revenue - stats[pid].cost;
    });

    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [sales, inventory, startDate, endDate]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, curr) => ({
      qty: acc.qty + curr.quantity,
      rev: acc.rev + curr.revenue,
      profit: acc.profit + curr.profit
    }), { qty: 0, rev: 0, profit: 0 });
  }, [reportData]);

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Período de Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Período de Fim</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <button
          onClick={() => { setStartDate(''); setEndDate(''); }}
          className="px-4 py-2 text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Volume Total</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totals.qty} <span className="text-sm font-normal text-slate-400">unidades</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Faturamento Período</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totals.rev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Margem Bruta Est.</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totals.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Ranking de Produtos</h3>
          <span className="text-xs text-slate-400 italic">Ordenado por faturamento</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Produto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Quantidade</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Receita Bruta</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Custo Est.</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Lucro Est.</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">
                    Nenhum dado disponível para este período.
                  </td>
                </tr>
              ) : (
                reportData.map((item, index) => {
                  const margin = (item.profit / item.revenue) * 100;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {item.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-500">
                        {item.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-indigo-600 font-bold">
                        {item.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          margin > 40 ? 'bg-green-100 text-green-700' :
                          margin > 20 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductReports;
