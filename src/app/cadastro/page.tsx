"use client";

import { useActionState } from "react";
import { cadastroAction } from "./actions";
import { Shield, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

const initialState = {
  error: undefined,
  success: false,
};

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState(cadastroAction, initialState);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo Area */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-[#00427A] rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Shield className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Pensou Seguros</h1>
        <p className="text-slate-500 mt-2 text-center max-w-md">
          Crie sua conta para acessar o sistema interno
        </p>
      </div>

      {/* Cadastro Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        {state?.success ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Cadastro Recebido!</h2>
            <p className="text-slate-600 mb-6">
              Sua conta foi criada com sucesso, mas está <strong>aguardando aprovação</strong> da diretoria. Você será avisado quando o acesso for liberado.
            </p>
            <Link
              href="/login"
              className="w-full py-3 bg-[#00427A] hover:bg-[#00315a] text-white rounded-xl font-medium transition-all text-center"
            >
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <div className="relative">
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Ex: João da Silva"
                  className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00427A] focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="exemplo@pensou.com.br"
                  className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00427A] focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                <div className="relative">
                  <input
                    type="text"
                    name="telefone"
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00427A] focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
                <select
                  name="funcao"
                  required
                  className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00427A] focus:border-transparent transition-all bg-slate-50 focus:bg-white text-slate-700"
                >
                  <option value="">Selecione...</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Sinistro">Sinistro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type="password"
                  name="senha"
                  required
                  placeholder="Crie uma senha forte"
                  className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00427A] focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {state?.error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-[#00427A] hover:bg-[#00315a] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isPending ? "Enviando Cadastro..." : "Solicitar Acesso"}
              {!isPending && <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            </button>
          </form>
        )}
      </div>

      {!state?.success && (
        <Link
          href="/login"
          className="mt-8 flex items-center gap-2 text-slate-500 hover:text-[#00427A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o login</span>
        </Link>
      )}

      {/* Footer */}
      <p className="mt-auto pt-8 text-sm text-slate-400">
        © 2024 Pensou Seguros • Sistema de Gestão Interna
      </p>
    </div>
  );
}
