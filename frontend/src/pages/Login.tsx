import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

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
      const response = await fetch('http://localhost:3001/auth/login', {
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
          TURISTA: '/perfil',
        };

        // Encontra a rota ou manda para login se não achar
        const targetRoute = roleRoutes[userRole] || '/login';

        console.log(
          'Login efetuado. Role:',
          userRole,
          'Redirecionando para:',
          targetRoute
        );
        navigate(targetRoute);
      } catch (tokenError) {
        console.error('Erro ao decodificar token:', tokenError);
        localStorage.removeItem('token'); // Limpa token ruim
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
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <p className="login-subtitle">
          Acesse a área para gerenciar seus eventos.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="login-alert">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="gestor@exemplo.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Digite sua senha"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="text-center text-sm text-slate-500">
          Ainda possui uma conta?{' '}
          <Link
            to="/cadastro"
            className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-all"
          >
            Cadastre-se!
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
