import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

import { useProfile } from './useProfile';
import { ProfileInfo } from './ProfileView';
import { ProfileEditForm } from './ProfileForm';
import type { ProfileFormData } from './profile.schema';

export default function Perfil() {
  const { user, loading, saving, error, updateUser, deleteAccount } =
    useProfile();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: ProfileFormData) => {
    const success = await updateUser(data);
    if (success) {
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="text-center p-10 text-red-600">
        {error || 'Erro ao carregar perfil.'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Meu Perfil</h1>

            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar Perfil
              </Button>
            )}
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {isEditing ? (
            <ProfileEditForm
              user={user}
              saving={saving}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileInfo user={user} />
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-red-600">Zona de Perigo</h2>
          <p className="text-sm text-gray-600">
            Excluir sua conta removerá permanentemente todos os seus dados.
          </p>
          <Button
            variant="destructive"
            onClick={deleteAccount}
            disabled={saving}
          >
            Excluir Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
