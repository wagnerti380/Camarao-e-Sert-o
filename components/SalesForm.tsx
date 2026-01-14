
import React, { useState, useMemo } from 'react';
import { Store, Salesperson, Sale, InventoryItem } from '../types';

interface SalesFormProps {
  onSubmit: (sale: Omit<Sale, 'id'>) => void;
  inventory: InventoryItem[];
}

const SalesForm: React.FC<SalesFormProps> = ({ onSubmit, inventory }) => {
  const [formData, setFormData] = useState({
    amount: '',
    store: Store.FORTALEZA,
    salesperson: Salesperson.STELA,
    description: '',
    date: new Date().toISOString().split('T')[0],
    productId: '',
    quantity: '1'
  });

  const selectedProduct = useMemo(() => 
    inventory.find(p => p.id === formData.productId), 
    [inventory, formData.productId]
  );

  const errors = useMemo(() => {
    const errs: string[] = [];
    const amt = parseFloat(formData.amount);
    const qty = parseInt(formData.quantity);

    if (isNaN(amt) || amt <= 0) errs.push("O valor deve ser maior que zero.");
    if (isNaN(qty) || qty <= 0) errs.push("A quantidade deve ser no mínimo 1.");
    if (selectedProduct && qty > selectedProduct.quantity) {
      errs.push(`Estoque insuficiente! Disponível: ${selectedProduct.quantity}`);
    }
    if (formData.description.trim().length < 3) errs.push("Descrição muito curta.");
    
    return errs;
  }, [formData, selectedProduct]);

  const handleProductChange = (id: string) => {
    const product = inventory.find(p => p.id === id);
    if (product) {
      setFormData({
        ...formData,
        productId: id,
        amount: (product.unitPrice * parseInt(formData.quantity || '1')).toString(),
        description: `Venda de ${product.name}`
      });
    } else {
      setFormData({ ...formData, productId: '', amount: '' });
    }
  };

  const handleQtyChange = (qty: string) => {
    const product = inventory.find(p => p.id === formData.productId);
    setFormData({
      ...formData,
      quantity: qty,
      amount: product ? (product.unitPrice * parseInt(qty || '0')).toString() : formData.amount
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.length > 0) return;

    onSubmit({
      amount: parseFloat(formData.amount),
      store: formData.store,
      salesperson: formData.salesperson,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      productId: formData.productId || undefined,
      quantity: parseInt(formData.quantity) || undefined
    });

    setFormData({
      amount: '',
      store: Store.FORTALEZA,
      salesperson: Salesperson.STELA,
      description: '',
      date: new Date().toISOString().split('T')[0],
      productId: '',
      quantity: '1'
    });
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Produto (Opcional)</label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Lançamento Manual</option>
              {inventory.map(p => (
                <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                  {p.name} ({p.quantity} em estoque)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Quantidade</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleQtyChange(e.target.value)}
              className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.some(e => e.includes("quantidade") || e.includes("Estoque")) ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Valor Total (R$)</label>
            <input
              type="number" step="0.01" required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.some(e => e.includes("valor")) ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Data</label>
            <input
              type="date" required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.store}
            onChange={(e) => setFormData({ ...formData, store: e.target.value as Store })}
            className="p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {Object.values(Store).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={formData.salesperson}
            onChange={(e) => setFormData({ ...formData, salesperson: e.target.value as Salesperson })}
            className="p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {Object.values(Salesperson).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-20 ${
            errors.some(e => e.includes("Descrição")) ? 'border-red-500 bg-red-50' : 'border-slate-200'
          }`}
          placeholder="Descrição da venda..."
        />

        {errors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3">
            <ul className="text-xs text-red-700 list-disc list-inside">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={errors.length > 0}
          className={`w-full text-white font-bold py-3 rounded-lg transition-colors shadow-lg ${
            errors.length > 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          Finalizar Venda
        </button>
      </form>
    </div>
  );
};

export default SalesForm;
