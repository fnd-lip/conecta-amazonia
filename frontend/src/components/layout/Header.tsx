import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  BadgeInfo,
  CalendarCheck2,
  CircleUser,
  LogIn,
  Menu,
  Sparkles,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import AssistantChat from '../assistant/AssistantChat';

import logo from '@/assets/conecta.svg';
import { getUserInfo, isAdmin } from '../../auth-utils';

interface UserInfo {
  email: string;
  role: string;
  id?: string;
  name?: string;
}

const commonLinks = [
  {
    label: 'Sobre Nós',
    to: '/sobre',
    icon: BadgeInfo,
  },
];

const adminLinks = [
  {
    label: 'Painel Administrativo',
    to: '/admin',
    icon: User,
  },
];

const gestorLinks = [
  {
    label: 'Meus Eventos',
    to: '/gestor/eventos',
    icon: CalendarCheck2,
  },
];

function MobileMenu({
  token,
  adminUser,
  userInfo,
  onLogout,
}: {
  token: string | null;
  adminUser: boolean;
  userInfo: UserInfo | null;
  onLogout: () => void;
}) {
  const closeSheet = () => document.dispatchEvent(new Event('sheet-close'));

  const links = [...(adminUser ? adminLinks : gestorLinks), ...commonLinks];

  return (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-75 sm:w-95 bg-white p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
        {/* Header */}
        <div className="p-6 bg-green-950 text-white">
          <img src={logo} alt="Conecta Amazônia" className="h-8 mb-2" />
          <SheetDescription className="text-white/80">
            Turismo e integração cultural na Amazônia
          </SheetDescription>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map(({ label, to, icon: Icon }) => (
            <Link key={to} to={to} onClick={closeSheet}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-base"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Rodapé */}
        <div className="border-t p-4">
          {!token ? (
            <Link to="/login" onClick={closeSheet}>
              <Button className="w-full bg-green-800 hover:bg-green-900">
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            </Link>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <CircleUser />
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {userInfo?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userInfo?.role}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  onLogout();
                  closeSheet();
                }}
              >
                Sair
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userInfo = getUserInfo() as UserInfo | null;
  const adminUser = isAdmin();
  const [assistantOpen, setAssistantOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-green-950/80 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Logo Conecta Amazônia" className="h-14 w-auto" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-green-900 hover:bg-green-100"
            onClick={() => setAssistantOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Nara
          </Button>
          {adminUser ? (
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <User className="mr-1 h-4 w-4" />
                Painel Administrativo
              </Button>
            </Link>
          ) : (
            <Link to="/gestor/eventos">
              <Button variant="ghost" size="sm">
                <CalendarCheck2 className="mr-1 h-4 w-4" />
                Meus Eventos
              </Button>
            </Link>
          )}

          {/* Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="ml-2 bg-white text-green-900 hover:bg-green-100"
              >
                Menu
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="text-sm font-medium text-green-900">
              {!token ? (
                <DropdownMenuItem asChild>
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </Link>
                </DropdownMenuItem>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar>
                      <CircleUser className="h-8 w-8 text-green-800" />
                    </Avatar>
                    <div>
                      <span className="block text-sm font-medium">
                        {userInfo?.role}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {userInfo?.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />

                  {adminUser ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <User className="mr-2 h-4 w-4" />
                        Painel Administrativo
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/gestor/eventos">
                        <CalendarCheck2 className="mr-2 h-4 w-4" />
                        Meus Eventos
                      </Link>
                    </DropdownMenuItem>
                  )}
                </>
              )}

              <DropdownMenuItem asChild>
                <Link to="/sobre">
                  <BadgeInfo className="mr-2 h-4 w-4" />
                  Sobre Nós
                </Link>
              </DropdownMenuItem>

              {token && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogIn className="mr-2 h-4 w-4 rotate-180" />
                    Sair
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir assistente"
            onClick={() => setAssistantOpen(true)}
          >
            <Sparkles className="h-5 w-5" />
          </Button>
          <MobileMenu
            token={token}
            adminUser={adminUser}
            userInfo={userInfo}
            onLogout={handleLogout}
          />
        </div>
      </div>
      <AssistantChat
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </header>
  );
}
