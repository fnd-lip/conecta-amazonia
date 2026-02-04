import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@/config/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react';

type LoginForm = {
  email: string;
  password: string;
};

type LoginErrors = Partial<LoginForm> & {
  general?: string;
};

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  function validate(values: LoginForm): LoginErrors {
    const newErrors: LoginErrors = {};

    if (!values.email.trim()) {
      newErrors.email = 'Informe o e-mail.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.email.trim())) {
        newErrors.email = 'Informe um e-mail válido.';
      }
    }

    if (!values.password.trim()) {
      newErrors.password = 'Informe a senha.';
    } else if (values.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
      general: undefined,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.message || 'E-mail ou senha inválidos.',
        });
        return;
      }

      localStorage.setItem('token', data.token);

      try {
        const payload = jwtDecode<TokenPayload>(data.token);

        const userRole = payload.role ? payload.role.toUpperCase().trim() : '';

        const roleRoutes: Record<string, string> = {
          ADMIN: '/admin',
          ADMINISTRADOR: '/admin',
          GESTOR: '/gestor/eventos',
          'GESTOR LOCAL': '/gestor/eventos',
          TURISTA: '/',
        };

        const targetRoute = roleRoutes[userRole] || '/';

        console.log(
          'Login efetuado. Role:',
          userRole,
          'Redirecionando para:',
          targetRoute
        );
        navigate(targetRoute);
      } catch (tokenError) {
        console.error('Erro ao decodificar token:', tokenError);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      setErrors({
        general: 'Ocorreu um erro ao tentar fazer login. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 relative overflow-hidden">
      {/* Blobs animados de fundo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-96 h-96 translate-y-1/2 bg-teal-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 z-10 px-4">
        {/* Card de Login */}
        <Card className="border-0 shadow-2xl shadow-emerald-900/10 bg-white/90 backdrop-blur-sm order-2 lg:order-1">
          <CardHeader className="space-y-1 pb-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors mb-2 group w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Voltar ao início
            </Link>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Bem-vindo de volta!
            </CardTitle>
            <CardDescription className="text-slate-500">
              Entre com suas credenciais para acessar sua conta.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {errors.general && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 pt-4 bg-slate-50/50">
            <div className="text-center text-sm text-slate-500">
              Ainda não possui uma conta?{' '}
              <Link
                to="/cadastro"
                className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-all"
              >
                Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Painel lateral informativo */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 p-4 order-1 lg:order-2">
          <div>
            <h1 className="text-3xl font-extrabold mb-3 leading-tight">
              Conecte-se à cultura{' '}
              <span className="text-emerald-600">Amazônica</span>
            </h1>
            <p className="text-lg text-slate-600">
              Acesse eventos exclusivos, gerencie ingressos e descubra as
              maravilhas da região Norte.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-white/40 shadow-sm backdrop-blur-md transition-transform hover:scale-105 duration-300">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Gestão de Eventos</h3>
                <p className="text-sm text-slate-600">
                  Organize e controle seus eventos culturais com facilidade.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-white/40 shadow-sm backdrop-blur-md transition-transform hover:scale-105 duration-300 delay-100">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Turismo Regional</h3>
                <p className="text-sm text-slate-600">
                  Explore festas, feiras e eventos pela Amazônia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-white/40 shadow-sm backdrop-blur-md transition-transform hover:scale-105 duration-300 delay-200">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Seguro e Confiável</h3>
                <p className="text-sm text-slate-600">
                  Plataforma segura para compra e validação de ingressos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
