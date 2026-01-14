
import React, { useState, useMemo } from 'react';
import { Store, FinancialCategory, Transaction } from '../types';

interface FinanceFormProps {
  onSubmit: (entry: Omit<Transaction, 'id'>) => void;
}

const FinanceForm: React.FC<FinanceFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: FinancialCategory.CUSTO_FIXO,
    store: Store.FORTALEZA,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const errors = useMemo(() => {
    const errs: string[] = [];
    const val = parseFloat(formData.amount);
    if (isNaN(val) || val <= 0) errs.push("O valor deve ser positivo.");
    if (formData.description.trim().length < 3) errs.push("Descrição requerida.");
    return errs;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.length > 0) return;

    onSubmit({
      amount: parseFloat(formData.amount),
      category: formData.category,
      store: formData.store,
      description: formData.description,
      date: new Date(formData.date).toISOString()
    });

    setFormData(prev => ({ ...prev, amount: '', description: '' }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Valor</label>
            <input
              type="number" step="0.01" required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.some(e => e.includes("valor")) ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Categoria</label>
            <select
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as FinancialCategory})}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.values(FinancialCategory).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Loja</label>
            <select
              value={formData.store}
              onChange={e => setFormData({...formData, store: e.target.value as Store})}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.values(Store).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Data</label>
            <input
              type="date" required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Descrição</label>
          <input
            type="text" required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.some(e => e.includes("Descrição")) ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            placeholder="Ex: Aluguel, Internet, Fornecedor..."
          />
        </div>

        {errors.length > 0 && formData.amount && (
           <p className="text-[10px] text-red-500 italic">* Verifique os dados inseridos.</p>
        )}

        <button 
          type="submit" 
          disabled={errors.length > 0}
          className={`w-full font-bold py-2 rounded-lg transition-colors ${
            errors.length > 0 ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-slate-800 text-white hover:bg-slate-900'
          }`}
        >
          Registrar Lançamento
        </button>
      </form>
    </div>
  );
};

export default FinanceForm;
