
import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'sales' | 'finance' | 'inventory' | 'reports' | 'new-entry' | 'consolidated';
  setActiveTab: (tab: 'dashboard' | 'sales' | 'finance' | 'inventory' | 'reports' | 'new-entry' | 'consolidated') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { id: 'consolidated', label: 'Fluxo Caixa', icon: 'M11.5 2c6.5 0 11.75 5.25 11.75 11.75S18 25.5 11.5 25.5S-.25 20.25-.25 13.75S5 2 11.5 2zm0 21c5.11 0 9.25-4.14 9.25-9.25S16.61 4.5 11.5 4.5S2.25 8.64 2.25 13.75S6.39 23 11.5 23zm.75-13v4h3.25v2H10.25v-8h2zm0-2h-2v2h2v-2z' },
    { id: 'sales', label: 'Vendas', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z' },
    { id: 'finance', label: 'Financeiro', icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
    { id: 'inventory', label: 'Estoque', icon: 'M20 13H4v-2h16v2zm0-4H4V7h16v2zm0 8H4v-2h16v2zM4 19h16v-2H4v2z' },
    { id: 'reports', label: 'Ranking Prod.', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-3H8v-2h2V9h2v3h2v2h-2v3z' },
    { id: 'new-entry', label: 'Lançamentos', icon: 'M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-448 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
  ];

  const sidebarIcon = (path: string) => (
    <svg className="w-6 h-6 md:mr-3" fill="currentColor" viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  );

  return (
    <aside className="w-20 md:w-64 bg-indigo-950 text-white flex flex-col transition-all duration-300 shadow-xl z-20">
      <div className="p-4 md:p-6 flex flex-col items-center md:items-start mb-2">
        {/* Reverted to Text Branding */}
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-white md:block hidden">
            CAMARÃO <span className="text-indigo-400">&</span> SERTÃO
          </span>
          <span className="text-2xl font-black text-white md:hidden block">CS</span>
          <div className="mt-1 hidden md:block">
            <div className="h-0.5 w-12 bg-indigo-500 rounded-full mb-1"></div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-300">Gestão de Unidades</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' 
                : 'text-indigo-300 hover:bg-indigo-900/50 hover:text-white'
            }`}
          >
            {sidebarIcon(item.icon)}
            <span className="hidden md:inline font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-indigo-900/50 bg-indigo-950/80">
        <div className="hidden md:flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-800 flex items-center justify-center font-black text-xs border border-indigo-700 text-white">CS</div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Administrador</span>
            <span className="text-[10px] text-indigo-400 font-medium">Controle Interno</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
