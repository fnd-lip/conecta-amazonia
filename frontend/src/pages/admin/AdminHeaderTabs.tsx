import type { AdminTab } from './admin.types';

interface AdminHeaderTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export default function AdminHeaderTabs({
  activeTab,
  onTabChange,
}: AdminHeaderTabsProps) {
  return (
    <>
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
        <p>Gerencie todos os eventos e usuários do sistema</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'eventos' ? 'active' : ''}`}
          onClick={() => onTabChange('eventos')}
        >
          Eventos
        </button>
        <button
          className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => onTabChange('usuarios')}
        >
          Usuários
        </button>
        <button
          className={`tab-button ${activeTab === 'tipos' ? 'active' : ''}`}
          onClick={() => onTabChange('tipos')}
        >
          Tipos de Evento
        </button>
      </div>
    </>
  );
}
