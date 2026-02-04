'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, User, Mail, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

interface UserRegistrationFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const formSchema = z
  .object({
    nome: z
      .string()
      .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
      .max(100, { message: 'Nome muito longo' }),
    email: z.string().email({ message: 'Email inválido' }),
    senha: z
      .string()
      .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
      .regex(/[A-Z]/, { message: 'Deve conter letra maiúscula' })
      .regex(/[0-9]/, { message: 'Deve conter número' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.senha === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

export function UserRegistrationForm({
  onCancel,
  onSuccess,
}: UserRegistrationFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const senhaValor = form.watch('senha');

  const passwordRequirements = [
    { label: 'Pelo menos 8 caracteres', pass: (senhaValor || '').length >= 8 },
    { label: 'Uma letra maiúscula', pass: /[A-Z]/.test(senhaValor || '') },
    { label: 'Um número', pass: /[0-9]/.test(senhaValor || '') },
  ];

  const allRequirementsValid = passwordRequirements.every((req) => req.pass);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.nome,
          email: data.email,
          password: data.senha,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Falha ao conectar com o servidor');
      }

      toast.success('Cadastro realizado com sucesso!', {
        description: `Confirme seu endereço de e-mail, ${data.nome}!`,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao criar conta', {
        description:
          error instanceof Error
            ? error.message
            : 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        {/* Nome */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium text-sm">
                Nome Completo
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Seu nome completo"
                    className="h-9 pl-10 text-sm border-slate-200 bg-slate-50/50"
                    disabled={isSubmitting}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium text-sm">
                Email
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="h-9 pl-10 text-sm border-slate-200 bg-slate-50/50"
                    disabled={isSubmitting}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Senha */}
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium text-sm">
                Senha
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Crie sua senha"
                    className="h-9 pl-10 text-sm border-slate-200 bg-slate-50/50"
                    disabled={isSubmitting}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>

              {!isConfirmFocused && !allRequirementsValid && senhaValor && (
                <div className="mt-1 space-y-0.5">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs"
                    >
                      {req.pass ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                      )}
                      <span
                        className={
                          req.pass ? 'text-emerald-600' : 'text-slate-500'
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Confirmar senha */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium text-sm">
                Confirmar Senha
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita sua senha"
                    className="h-9 pl-10 text-sm border-slate-200 bg-slate-50/50"
                    disabled={isSubmitting}
                    {...field}
                    onFocus={() => setIsConfirmFocused(true)}
                    onBlur={() => {
                      field.onBlur();
                      setIsConfirmFocused(false);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="pt-0.5 flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 text-sm w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? 'Cadastrando...' : 'Criar Conta'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
