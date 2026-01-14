
import React from 'react';
import { Transaction, FinancialCategory } from '../types';

interface FinanceListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const FinanceList: React.FC<FinanceListProps> = ({ transactions, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Categoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Loja</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Valor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Sem lançamentos registrados.</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm font-medium">{t.description}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      t.category === FinancialCategory.RECEITA ? 'bg-green-100 text-green-700' :
                      t.category.includes('FIXO') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{t.store}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${t.category === FinancialCategory.RECEITA ? 'text-green-600' : 'text-red-600'}`}>
                    {t.category === FinancialCategory.RECEITA ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDelete(t.id)} className="text-slate-300 hover:text-red-500 transition-colors">
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

export default FinanceList;
