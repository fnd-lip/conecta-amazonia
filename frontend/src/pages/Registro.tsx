import { Link } from 'react-router-dom';
import { UserRegistrationForm } from '@/components/auth/Cadastro';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, MapPin, Ticket, Music } from 'lucide-react';

export default function RegistrationPage() {
  return (
    <div className="min-h-screen  w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-96 h-96 translate-y-1/2 bg-teal-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full w-full flex items-center justify-center max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 z-10 px-4 items-start overflow-hidden">
        <Card className="border-0 shadow-2xl shadow-emerald-900/10 bg-white/90 backdrop-blur-sm order-2 lg:order-1 max-h-[90vh] overflow-hidden flex flex-col">
          <CardHeader className="space-y-0.5 pb-1">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors mb-2 group w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Voltar ao início
            </Link>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Crie sua conta
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Preencha seus dados para acessar eventos exclusivos.
            </CardDescription>
          </CardHeader>

          <CardContent className="overflow-y-auto">
            <UserRegistrationForm />
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 pt-2 bg-slate-50/50 rounded-b-xl">
            <div className="text-center text-sm text-slate-500">
              Já possui cadastro?{' '}
              <Link
                to="/login"
                className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-all"
              >
                Faça login
              </Link>
            </div>
          </CardFooter>
        </Card>
        <div className="hidden lg:flex flex-col justify-center space-y-4 p-2 max-h-[90vh] overflow-hidden">
          <div>
            <h1 className="text-3xl font-extrabold mb-3 leading-tight">
              O coração da cultura{' '}
              <span className="text-emerald-600">Amazônica</span> espera por
              você.
            </h1>
            <p className="text-lg text-slate-600">
              Gerencie seus ingressos e descubra experiências únicas em um só
              lugar.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/60 border border-white/40 shadow-sm backdrop-blur-md transition-transform hover:scale-105 duration-300">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Ingressos Digitais</h3>
                <p className="text-sm text-slate-600">
                  Acesso rápido e seguro aos seus eventos favoritos .
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/60 border border-white/40 shadow-sm backdrop-blur-md transition-transform hover:scale-105 duration-300 delay-100">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Cobertura Regional</h3>
                <p className="text-sm text-slate-600">
                  Eventos em a região Norte.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/60 border border-white/40 shadow-sm backdrop-blur-md transition-transform hover:scale-105 duration-300 delay-200">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
                <Music className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Agenda Cultural</h3>
                <p className="text-sm text-slate-600">
                  Fique por dentro de shows, teatro, feiras e festivais
                  folclóricos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
