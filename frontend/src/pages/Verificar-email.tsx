import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRef } from 'react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const effectRan = useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Verificando suas credenciais...');

  useEffect(() => {
    if (effectRan.current === true) return;
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    effectRan.current = true;

    const verifyToken = async () => {
      try {
        const response = await fetch(
          'http://localhost:3001/auth/verify-email',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Falha na verificação');
        }

        setStatus('success');
        toast.success('Email verificado com sucesso!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(
          'O link é inválido ou já foi utilizado. Tente fazer login se já tiver ativado sua conta.'
        );

        if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage('Ocorreu um erro inesperado.');
        }
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-emerald-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-slate-800">
            {status === 'loading' && 'Verificando...'}
            {status === 'success' && 'Email Confirmado!'}
            {status === 'error' && 'Falha na Verificação'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-6">
            {status === 'loading' && 'Aguarde enquanto validamos seu cadastro.'}
            {status === 'success' &&
              'Sua conta foi ativada com sucesso. Você já pode fazer login.'}
            {status === 'error' && message}
          </p>

          <div className="flex justify-center">
            {status === 'success' ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full text-white"
                onClick={() => navigate('/login')}
              >
                Ir para Login
              </Button>
            ) : status === 'error' ? (
              <Button
                variant="outline"
                className="w-full border-slate-300"
                onClick={() => navigate('/cadastro')}
              >
                Voltar ao Cadastro
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
