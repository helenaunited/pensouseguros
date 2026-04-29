import { prisma } from "@/lib/prisma";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Hourglass, 
  Search, 
  AlertTriangle,
  Plus
} from "lucide-react";
import { EmailGenerator } from "@/components/EmailGenerator";

export default async function DashboardPage() {
  const propostas = await prisma.proposta.findMany({
    include: { especialista: true },
    orderBy: { data_ultima_alteracao: "desc" },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendente":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Emitida":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "Recusada":
      case "Cancelada":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const isDelayed = (status: string, date: Date) => {
    return status === "Pendente" && differenceInDays(new Date(), date) > 3;
  };

  // KPIs calculados a partir dos dados reais
  const totalPendentes = propostas.filter((p) => p.status === "Pendente").length;
  const aguardandoVistoria = propostas.filter((p) => p.motivo_pendencia === "Vistoria_Previa").length;
  const pendentesMaisDe3Dias = propostas.filter((p) => isDelayed(p.status, p.data_ultima_alteracao)).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard de Propostas</h1>
          <p className="text-gray-500 mt-1">Acompanhe e gerencie as propostas de seguro em andamento.</p>
        </div>
        <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm focus:ring-4 focus:ring-yellow-500/20">
          <Plus className="w-5 h-5" />
          Nova Proposta
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="bg-blue-50 p-4 rounded-full text-blue-600">
            <Hourglass className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Pendentes</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalPendentes}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="bg-purple-50 p-4 rounded-full text-purple-600">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Aguardando Vistoria</p>
            <h3 className="text-3xl font-bold text-gray-900">{aguardandoVistoria}</h3>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="bg-red-100 p-4 rounded-full text-red-600">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-1">Pendentes &gt; 3 dias</p>
            <h3 className="text-3xl font-bold text-red-900">{pendentesMaisDe3Dias}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seguradora</label>
          <select className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 shadow-sm transition-colors cursor-pointer">
            <option>Todas as seguradoras</option>
            <option>Porto Seguro</option>
            <option>Tokio Marine</option>
            <option>Suhai</option>
            <option>Allianz</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Especialista</label>
          <select className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 shadow-sm transition-colors cursor-pointer">
            <option>Todos os especialistas</option>
            <option>João Silva</option>
            <option>Maria Oliveira</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
          <select className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 shadow-sm transition-colors cursor-pointer">
            <option>Todos os status</option>
            <option>Pendente</option>
            <option>Emitida</option>
            <option>Recusada</option>
            <option>Cancelada</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Cliente</th>
                <th className="py-4 px-6 font-semibold">Seguradora</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Motivo Pendência</th>
                <th className="py-4 px-6 font-semibold">Atualização</th>
                <th className="py-4 px-6 font-semibold">Especialista</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {propostas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400 mb-3" />
                      <p className="text-base font-medium text-gray-900">Nenhuma proposta encontrada</p>
                      <p className="text-sm text-gray-500 mt-1">Ajuste os filtros ou crie uma nova proposta.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                propostas.map((proposta) => {
                  const delayed = isDelayed(proposta.status, proposta.data_ultima_alteracao);
                  return (
                    <tr 
                      key={proposta.id} 
                      className={`transition-colors hover:bg-gray-50 ${delayed ? 'bg-red-50/30 hover:bg-red-50/60' : ''}`}
                    >
                      <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-3">
                        {delayed && (
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Atrasado" />
                        )}
                        {proposta.cliente}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                          {proposta.seguradora.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(proposta.status)}
                          <span className="text-sm font-medium text-gray-700">{proposta.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {proposta.motivo_pendencia === 'Nenhum' ? (
                          <span className="text-gray-400 italic">-</span>
                        ) : (
                          proposta.motivo_pendencia.replace('_', ' ')
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatDistanceToNow(proposta.data_ultima_alteracao, { addSuffix: true, locale: ptBR })}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 font-medium">
                        {proposta.especialista.nome}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Generator Module */}
      <EmailGenerator />
    </div>
  );
}
