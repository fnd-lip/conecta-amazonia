import type { UserData } from './profile.schema';

interface Props {
  user: UserData;
}

export function ProfileInfo({ user }: Props) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-gray-500">Nome</p>
        <p className="font-medium">{user.name}</p>
      </div>

      <div>
        <p className="text-gray-500">Email</p>
        <p className="font-medium">{user.email}</p>
      </div>

      <div>
        <p className="text-gray-500">Tipo de usuário</p>
        <p className="font-medium">
          {user.typeId === 1 ? 'Administrador' : 'Turista'}
        </p>
      </div>
    </div>
  );
}
