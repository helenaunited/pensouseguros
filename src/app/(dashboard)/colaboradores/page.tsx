"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Users, Plus, Pencil, UserX, UserCheck, Phone, Mail, Briefcase,
  X, Check, AlertCircle, Loader2, Search, Lock, Shield
} from "lucide-react";
import {
  listarTodosColaboradores,
  criarColaborador,
  editarColaborador,
  desativarColaborador,
  reativarColaborador,
  type ColaboradorData,
} from "./actions";

type Colaborador = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  funcao: string;
  ativo: boolean;
  role: string;
  createdAt: Date;
};

const FUNCOES = [
  "Corretor", "Assistente", "Gerente", "Analista", "Consultor",
  "Supervisor", "Coordenador", "Diretor", "Outro"
];

const emptyForm: ColaboradorData = { 
  nome: "", email: "", telefone: "", funcao: "Corretor", senha: "", role: "colaborador" 
};

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Colaborador | null>(null);
  const [form, setForm] = useState<ColaboradorData>(emptyForm);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const carregar = () => {
    startTransition(async () => {
      const data = await listarTodosColaboradores();
      setColaboradores(data as Colaborador[]);
    });
  };

  useEffect(() => { carregar(); }, []);

  const abrirModal = (colaborador?: Colaborador) => {
    if (colaborador) {
      setEditando(colaborador);
      setForm({ 
        nome: colaborador.nome, 
        email: colaborador.email, 
        telefone: colaborador.telefone, 
        funcao: colaborador.funcao,
        senha: "", // Não carregar senha atual por segurança
        role: colaborador.role 
      });
    } else {
      setEditando(null);
      setForm(emptyForm);
    }
    setErro(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
    setForm(emptyForm);
    setErro(null);
  };

  const mostrarSucesso = (msg: string) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    
    if (!editando && !form.senha) {
      setErro("A senha é obrigatória para novos colaboradores.");
      return;
    }

    startTransition(async () => {
      const result = editando
        ? await editarColaborador(editando.id, form)
        : await criarColaborador(form);

      if (result.success) {
        fecharModal();
        carregar();
        mostrarSucesso(editando ? "Colaborador atualizado!" : "Colaborador cadastrado com sucesso!");
      } else {
        setErro(result.error || "Erro desconhecido.");
      }
    });
  };

  const handleDesativar = (id: string) => {
    startTransition(async () => {
      await desativarColaborador(id);
      carregar();
      mostrarSucesso("Colaborador desativado.");
    });
  };

  const handleReativar = (id: string) => {
    startTransition(async () => {
      await reativarColaborador(id);
      carregar();
      mostrarSucesso("Colaborador reativado.");
    });
  };

  const filtrados = colaboradores.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase()) ||
      c.funcao.toLowerCase().includes(busca.toLowerCase());
    const matchAtivo = mostrarInativos ? true : c.ativo;
    return matchBusca && matchAtivo;
  });

  const totalAtivos = colaboradores.filter(c => c.ativo).length;
  const totalInativos = colaboradores.filter(c => !c.ativo).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[#004b8d]" />
            Colaboradores
          </h1>
          <p className="text-gray-500 mt-1">Gerencie a equipe e permissões de acesso.</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm focus:ring-4 focus:ring-yellow-500/20"
        >
          <Plus className="w-5 h-5" />
          Novo Colaborador
        </button>
      </div>

      {/* Sucesso */}
      {sucesso && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <Check className="w-5 h-5" /> {sucesso}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ativos</p>
            <p className="text-3xl font-bold text-gray-900">{totalAtivos}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-full text-gray-500">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aguardando / Inativos</p>
            <p className="text-3xl font-bold text-gray-700">{totalInativos}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou função..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-[#004b8d] focus:border-[#004b8d] outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mostrarInativos}
            onChange={e => setMostrarInativos(e.target.checked)}
            className="w-4 h-4 accent-[#004b8d]"
          />
          Mostrar inativos
        </label>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Nome</th>
                <th className="py-4 px-6 font-semibold">Função / Role</th>
                <th className="py-4 px-6 font-semibold">Contato</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isPending ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#004b8d] mx-auto" />
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Users className="w-8 h-8" />
                      <p className="font-medium text-gray-600">Nenhum colaborador encontrado</p>
                      <p className="text-sm">Clique em "Novo Colaborador" para começar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map((c) => (
                  <tr key={c.id} className={`transition-colors hover:bg-gray-50 ${!c.ativo ? "opacity-50" : ""}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#004b8d] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {c.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{c.nome}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold w-fit">
                          <Briefcase className="w-3 h-3" />
                          {c.funcao}
                        </span>
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded w-fit ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {c.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {c.telefone}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {c.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Aguardando Aprovação
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModal(c)}
                          title="Editar"
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {c.ativo ? (
                          <button
                            onClick={() => handleDesativar(c.id)}
                            title="Desativar"
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReativar(c.id)}
                            title="Aprovar Acesso"
                            className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editando ? <Pencil className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-green-600" />}
                {editando ? "Editar Colaborador" : "Novo Colaborador"}
              </h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome completo *</label>
                <input
                  required
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail corporativo *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Ex: joao@pensou.com.br"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone *</label>
                  <input
                    required
                    type="tel"
                    value={form.telefone}
                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Função *</label>
                  <select
                    required
                    value={form.funcao}
                    onChange={e => setForm({ ...form, funcao: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none bg-white"
                  >
                    {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> 
                    Senha {editando ? "(deixe vazio para não alterar)" : "*"}
                  </label>
                  <input
                    required={!editando}
                    type="password"
                    value={form.senha}
                    onChange={e => setForm({ ...form, senha: e.target.value })}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Nível de Acesso *
                  </label>
                  <select
                    required
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none bg-white"
                  >
                    <option value="colaborador">Colaborador (Normal)</option>
                    <option value="admin">Administrador (Total)</option>
                  </select>
                </div>
              </div>

              {erro && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {erro}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-[#004b8d] hover:bg-[#003d75] text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editando ? "Salvar alterações" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
