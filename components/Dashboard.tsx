
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend, LineChart, Line 
} from 'recharts';
import { Sale, Transaction, Store, FinancialCategory, InventoryItem } from '../types';

interface DashboardProps {
  sales: Sale[];
  transactions: Transaction[];
  inventory: InventoryItem[];
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ sales, transactions, inventory }) => {
  // Store comparison data
  const storeData = useMemo(() => {
    return Object.values(Store).map(store => {
      const storeSales = sales.filter(s => s.store === store).reduce((acc, curr) => acc + curr.amount, 0);
      const storeExpenses = transactions
        .filter(t => t.store === store && t.category !== FinancialCategory.RECEITA)
        .reduce((acc, curr) => acc + curr.amount, 0);
      return { name: store, vendas: storeSales, despesas: storeExpenses };
    });
  }, [sales, transactions]);

  // Category distribution for Pie Chart
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.values(FinancialCategory).forEach(cat => totals[cat] = 0);
    
    transactions.forEach(t => {
      if (totals[t.category] !== undefined) {
        totals[t.category] += t.amount;
      }
    });

    return Object.entries(totals)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Evolution over time data (last 30 days)
  const evolutionData = useMemo(() => {
    const datesMap: Record<string, { date: string, receita: number, despesa: number }> = {};
    
    // Sort transactions by date to get chronological flow
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTransactions.forEach(t => {
      const dateStr = new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!datesMap[dateStr]) {
        datesMap[dateStr] = { date: dateStr, receita: 0, despesa: 0 };
      }
      if (t.category === FinancialCategory.RECEITA) {
        datesMap[dateStr].receita += t.amount;
      } else {
        datesMap[dateStr].despesa += t.amount;
      }
    });

    return Object.values(datesMap).slice(-15); // Show last 15 active days
  }, [transactions]);

  const lowStockItems = useMemo(() => inventory.filter(i => i.quantity <= i.minQuantity), [inventory]);

  const totalRevenue = transactions.filter(t => t.category === FinancialCategory.RECEITA).reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.category !== FinancialCategory.RECEITA).reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Receita Bruta</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">{totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Despesas Totais</p>
          <h3 className="text-2xl font-bold text-red-500 mt-1">{totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Lucro Líquido</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">{(totalRevenue - totalExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Alertas de Estoque</p>
          <h3 className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-orange-500' : 'text-slate-900'}`}>{lowStockItems.length}</h3>
        </div>
      </div>

      {/* Evolution Chart (Full Width) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-800 mb-6">Evolução Financeira (Receita vs Despesas)</h4>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
              <Line name="Receita" type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              <Line name="Despesa" type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-6">Desempenho por Unidade</h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                />
                <Legend iconType="rect" />
                <Bar name="Vendas" dataKey="vendas" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar name="Despesas" dataKey="despesas" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-6">Composição Financeira</h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  contentStyle={{ borderRadius: '8px', border: 'none' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-y-auto max-h-[400px]">
        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
          Alertas de Reposição de Estoque
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lowStockItems.length === 0 ? (
            <div className="col-span-full text-slate-400 text-sm italic py-4 text-center">Nenhum item com estoque baixo.</div>
          ) : (
            lowStockItems.map(item => (
              <div key={item.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm font-bold text-orange-900">{item.name}</p>
                <p className="text-xs text-orange-700 font-medium">
                  Restante: <span className="underline font-bold">{item.quantity}</span> | Mínimo: {item.minQuantity}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
