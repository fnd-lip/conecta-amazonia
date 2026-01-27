import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../auth-utils';
import AdminHeaderTabs from './admin/AdminHeaderTabs';
import AdminEventTypesTab from './admin/AdminEventTypesTab';
import AdminEventsTab from './admin/AdminEventsTab';
import AdminUsersTab from './admin/AdminUsersTab';
import type { AdminTab } from './admin/admin.types';
import useAdminData from './admin/useAdminData';
import './admin/styles/AdminLayout.css';
import './admin/styles/AdminEventsTab.css';
import './admin/styles/AdminUsersTab.css';
import './admin/styles/AdminEventTypesTab.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('eventos');
  const navigate = useNavigate();
  const {
    events,
    users,
    eventTypes,
    newTypeName,
    editingTypeId,
    editingTypeName,
    typeBusy,
    loading,
    error,
    setNewTypeName,
    setEditingTypeName,
    handleCreateType,
    handleStartEditType,
    handleCancelEditType,
    handleSaveEditType,
    handleDeleteType,
    loadTab,
  } = useAdminData(navigate);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!isAdmin()) {
      navigate('/gestor/eventos');
      return;
    }

    loadTab(activeTab);
  }, [navigate, activeTab, loadTab]);

  const handleRetry = () => loadTab(activeTab);

  return (
    <div className="admin-container">
      <AdminHeaderTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && (
        <div className="loading-container">
          <h3>Carregando...</h3>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={handleRetry}>Tentar Novamente</button>
        </div>
      )}

      {!loading && !error && activeTab === 'eventos' && (
        <AdminEventsTab
          events={events}
          onView={(id) => navigate(`/eventos/${id}`)}
        />
      )}

      {!loading && !error && activeTab === 'usuarios' && (
        <AdminUsersTab users={users} />
      )}

      {!loading && !error && activeTab === 'tipos' && (
        <AdminEventTypesTab
          eventTypes={eventTypes}
          newTypeName={newTypeName}
          editingTypeId={editingTypeId}
          editingTypeName={editingTypeName}
          typeBusy={typeBusy}
          onNewTypeNameChange={setNewTypeName}
          onEditingTypeNameChange={setEditingTypeName}
          onCreate={handleCreateType}
          onStartEdit={handleStartEditType}
          onCancelEdit={handleCancelEditType}
          onSaveEdit={handleSaveEditType}
          onDelete={handleDeleteType}
        />
      )}
    </div>
  );
}
