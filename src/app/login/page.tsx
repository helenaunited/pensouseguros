"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { ShieldAlert, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#004b8d] rounded-2xl shadow-lg mb-4 text-white">
            <ShieldAlert className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pensou Seguros</h1>
          <p className="text-gray-500 mt-2">Acesse sua conta para gerenciar demandas</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form action={action} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="exemplo@pensou.com.br"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004b8d]/20 focus:border-[#004b8d] outline-none transition-all text-gray-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Senha</label>
                <a href="#" className="text-xs font-medium text-[#004b8d] hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  name="senha"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004b8d]/20 focus:border-[#004b8d] outline-none transition-all text-gray-900"
                />
              </div>
            </div>

            {state?.error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{state.error}</p>
              </div>
            )}

            <button
              disabled={isPending}
              type="submit"
              className="w-full bg-[#004b8d] hover:bg-[#003d75] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/10 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar na plataforma"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem acesso?{" "}
              <Link href="/cadastro" className="text-[#004b8d] font-semibold hover:underline">
                Solicitar cadastro
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-8">
          © 2024 Pensou Seguros • Sistema de Gestão Interna
        </p>
      </div>
    </div>
  );
}
