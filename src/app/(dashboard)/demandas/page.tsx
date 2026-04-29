"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ClipboardList, Plus, X, Check, AlertCircle, Loader2,
  Clock, CheckCircle2, XCircle, Ban, AlertTriangle, User,
  GripVertical, Flag, PlayCircle
} from "lucide-react";
import { listarDemandas, criarDemanda, atualizarStatusDemanda, type DemandaData } from "./actions";
import { listarColaboradores } from "../colaboradores/actions";

// ─── Tipos ──────────────────────────────────────────────────────────────────

type Colaborador = { id: string; nome: string; funcao: string };

type Demanda = {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  createdAt: Date;
  prazo: Date;
  colaborador_id: string;
  colaborador: Colaborador;
};

// Now including "Em andamento" as requested by user
const COLUNAS = [
  { id: "Aguardando",    label: "Aguardando",    icon: Clock,         cor: "blue"   },
  { id: "Em andamento",  label: "Em andamento",  icon: PlayCircle,    cor: "orange" },
  { id: "Finalizada",    label: "Finalizada",    icon: CheckCircle2,  cor: "green"  },
  { id: "Recusada",      label: "Recusada",      icon: XCircle,       cor: "red"    },
  { id: "Cancelada",     label: "Cancelada",     icon: Ban,           cor: "gray"   },
] as const;

const COR_MAP = {
  blue:   { header: "bg-blue-500",   badge: "bg-blue-100 text-blue-700",   border: "border-t-blue-500"  },
  orange: { header: "bg-orange-500", badge: "bg-orange-100 text-orange-700", border: "border-t-orange-500" },
  green:  { header: "bg-green-500",  badge: "bg-green-100 text-green-700", border: "border-t-green-500" },
  red:    { header: "bg-red-500",    badge: "bg-red-100 text-red-700",     border: "border-t-red-500"   },
  gray:   { header: "bg-gray-400",   badge: "bg-gray-100 text-gray-600",   border: "border-t-gray-400"  },
};

const PRIORIDADE_MAP: Record<string, { cls: string; dot: string }> = {
  Urgente: { cls: "bg-red-100 text-red-700",    dot: "bg-red-500"    },
  Alta:    { cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  Normal:  { cls: "bg-blue-50 text-blue-600",   dot: "bg-blue-500"   },
  Baixa:   { cls: "bg-gray-100 text-gray-500",  dot: "bg-gray-400"   },
};

const PRIORIDADE_OPTIONS = ["Baixa", "Normal", "Alta", "Urgente"];
const emptyForm: DemandaData = { titulo: "", descricao: "", prioridade: "Normal", colaborador_id: "" };

// ─── Helpers SLA ─────────────────────────────────────────────────────────────

function getSLAInfo(prazo: Date, status: string) {
  // Only show SLA warning if not finalized/cancelled/refused
  if (status !== "Aguardando" && status !== "Em andamento") return null;
  
  const diff = new Date(prazo).getTime() - Date.now();
  if (diff < 0) {
    const h = Math.abs(Math.floor(diff / 3600000));
    return { label: `Vencido há ${h}h`, level: "vencido" as const };
  }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (diff < 6 * 3600000) return { label: `${h}h ${m}min`, level: "alerta" as const };
  return { label: `${h}h ${m}min`, level: "ok" as const };
}

const SLA_STYLE = {
  vencido: "bg-red-100 text-red-700 border border-red-200",
  alerta:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  ok:      "bg-green-50 text-green-700 border border-green-200",
};

const SLA_DOT = {
  vencido: "bg-red-500 animate-pulse",
  alerta:  "bg-yellow-400",
  ok:      "bg-green-500",
};

// ─── Componente Card ─────────────────────────────────────────────────────────

function DemandaCard({ demanda, isDragging = false, canMove = true }: { demanda: Demanda; isDragging?: boolean; canMove?: boolean }) {
  const sla = getSLAInfo(demanda.prazo, demanda.status);
  const prio = PRIORIDADE_MAP[demanda.prioridade] ?? PRIORIDADE_MAP.Normal;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 select-none transition-all
        ${(demanda.status === "Aguardando" || demanda.status === "Em andamento") && sla?.level === "vencido" ? "border-l-4 border-l-red-500" : ""}
        ${isDragging ? "shadow-2xl rotate-2 scale-105 opacity-90" : "shadow-sm hover:shadow-md hover:-translate-y-0.5"}
        ${!canMove ? "opacity-75 cursor-not-allowed" : "cursor-grab"}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{demanda.titulo}</p>
        {canMove && <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />}
      </div>

      {/* Descrição */}
      {demanda.descricao && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{demanda.descricao}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${prio.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
          {demanda.prioridade}
        </span>
        {sla && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${SLA_STYLE[sla.level]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${SLA_DOT[sla.level]}`} />
            {sla.label}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#004b8d] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {demanda.colaborador.nome.charAt(0)}
          </div>
          <span className="text-xs text-gray-600 font-medium truncate max-w-[100px]">{demanda.colaborador.nome}</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(demanda.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
      </div>
      {!canMove && (
        <p className="text-[10px] text-red-400 font-bold mt-2 uppercase tracking-tighter italic">Atribuída a outro colaborador</p>
      )}
    </div>
  );
}

// ─── Card Draggable ───────────────────────────────────────────────────────────

function SortableCard({ demanda, canMove }: { demanda: Demanda; canMove: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: demanda.id,
    disabled: !canMove 
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...(canMove ? { ...attributes, ...listeners } : {})}>
      <DemandaCard demanda={demanda} canMove={canMove} />
    </div>
  );
}

// ─── Coluna Kanban ────────────────────────────────────────────────────────────

function KanbanColumn({
  coluna, demandas, onAddClick, currentUser
}: {
  coluna: typeof COLUNAS[number];
  demandas: Demanda[];
  onAddClick: () => void;
  currentUser: any;
}) {
  const cor = COR_MAP[coluna.cor];
  const Icon = coluna.icon;
  const ids = demandas.map(d => d.id);

  // Torna a coluna uma zona de drop
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id });

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Cabeçalho da coluna */}
      <div className={`${cor.header} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-white">
          <Icon className="w-4 h-4" />
          <span className="font-bold text-sm">{coluna.label}</span>
        </div>
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {demandas.length}
        </span>
      </div>

      {/* Área de cards — droppable */}
      <div
        ref={setNodeRef}
        className={`rounded-b-xl flex-1 p-3 min-h-[400px] flex flex-col gap-2.5 transition-colors ${
          isOver ? "bg-blue-50/80 ring-2 ring-inset ring-blue-300" : "bg-gray-100/80"
        }`}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {demandas.map(d => {
            const canMove = currentUser.role === 'admin' || d.colaborador_id === currentUser.userId;
            return (
              <SortableCard key={d.id} demanda={d} canMove={canMove} />
            );
          })}
        </SortableContext>

        {demandas.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className={`text-xs text-center ${isOver ? "text-blue-500 font-semibold" : "text-gray-400"}`}>
              {isOver ? "Soltar aqui" : "Nenhuma demanda aqui"}
            </p>
          </div>
        )}

        {/* Botão adicionar na coluna Aguardando */}
        {coluna.id === "Aguardando" && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-white/70 transition-colors border border-dashed border-gray-300 hover:border-gray-400 mt-1"
          >
            <Plus className="w-4 h-4" />
            Adicionar demanda
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────

export default function DemandasPage() {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState<DemandaData>(emptyForm);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeDemanda, setActiveDemanda] = useState<Demanda | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const carregar = useCallback(() => {
    startTransition(async () => {
      // Get current user session from the server-side passed via layout or fetch it? 
      // For simplicity in this demo, we'll fetch it or rely on the fact that it's protected.
      // But let's fetch it from an action to be sure about roles.
      const response = await fetch('/api/auth/me'); // We need this route
      const user = await response.json();
      setCurrentUser(user);

      const [d, c] = await Promise.all([listarDemandas(), listarColaboradores()]);
      setDemandas(d as Demanda[]);
      setColaboradores(c as Colaborador[]);
    });
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (colaboradores.length > 0 && !form.colaborador_id) {
      setForm(f => ({ ...f, colaborador_id: colaboradores[0].id }));
    }
  }, [colaboradores]);

  const mostrarSucesso = (msg: string) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(null), 3000);
  };

  // ─── Drag and Drop ────────────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const found = demandas.find(d => d.id === event.active.id);
    setActiveDemanda(found ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDemanda(null);
    const { active, over } = event;
    if (!over) return;

    let novoStatus = COLUNAS.find(c => c.id === over.id)?.id;
    if (!novoStatus) {
      const cardDestino = demandas.find(d => d.id === over.id);
      novoStatus = COLUNAS.find(c => c.id === cardDestino?.status)?.id;
    }
    if (!novoStatus) return;

    const demandaAtual = demandas.find(d => d.id === active.id);
    if (!demandaAtual || demandaAtual.status === novoStatus) return;

    // Check permissions
    if (currentUser.role !== 'admin' && demandaAtual.colaborador_id !== currentUser.userId) {
      setErro("Você só pode mover demandas atribuídas a você.");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    setDemandas(prev =>
      prev.map(d => d.id === active.id ? { ...d, status: novoStatus! } : d)
    );

    const result = await atualizarStatusDemanda(String(active.id), novoStatus);
    if (result.success) {
      mostrarSucesso(`Movido para "${novoStatus}" ✓`);
    } else {
      carregar();
    }
  };

  // ─── Modal ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!form.colaborador_id) { setErro("Selecione um colaborador."); return; }
    startTransition(async () => {
      const result = await criarDemanda(form);
      if (result.success) {
        setModalAberto(false);
        setForm({ ...emptyForm, colaborador_id: colaboradores[0]?.id || "" });
        carregar();
        mostrarSucesso("Demanda criada com sucesso!");
      } else {
        setErro(result.error || "Erro desconhecido.");
      }
    });
  };

  if (!currentUser) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const kpiEmitidas  = demandas.filter(d => d.status === "Aguardando").length;
  const kpiAndamento = demandas.filter(d => d.status === "Em andamento").length;
  const kpiTratadas  = demandas.filter(d => d.status === "Finalizada").length;
  const vencidas     = demandas.filter(d => getSLAInfo(d.prazo, d.status)?.level === "vencido").length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f4f5f7]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-[#004b8d]" />
              Demandas
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Gestão visual de tarefas e SLA de 24h.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                {kpiEmitidas} Aguardando
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                {kpiAndamento} Em andamento
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                {kpiTratadas} Finalizadas
              </div>
              {vencidas > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  {vencidas} Vencida{vencidas > 1 ? "s" : ""}
                </div>
              )}
            </div>

            <button
              onClick={() => { setModalAberto(true); setErro(null); }}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nova Demanda
            </button>
          </div>
        </div>

        {sucesso && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> {sucesso}
          </div>
        )}
        {erro && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {erro}
          </div>
        )}
      </div>

      {/* ── Kanban Board ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 h-full items-start pb-4">
            {COLUNAS.map(coluna => (
              <KanbanColumn
                key={coluna.id}
                coluna={coluna}
                demandas={demandas.filter(d => d.status === coluna.id)}
                onAddClick={() => { setModalAberto(true); setErro(null); }}
                currentUser={currentUser}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {activeDemanda ? <DemandaCard demanda={activeDemanda} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── Modal Nova Demanda ──────────────────────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nova Demanda</h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {colaboradores.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Nenhum colaborador cadastrado</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título *</label>
                  <input
                    required
                    type="text"
                    value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ex: Enviar proposta para cliente"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    placeholder="Detalhes da demanda..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Atribuir para *</label>
                    <select
                      required
                      value={form.colaborador_id}
                      onChange={e => setForm({ ...form, colaborador_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      {colaboradores.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prioridade</label>
                    <select
                      value={form.prioridade}
                      onChange={e => setForm({ ...form, prioridade: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#004b8d]/30 focus:border-[#004b8d] outline-none bg-white"
                    >
                      {PRIORIDADE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-[#004b8d] hover:bg-[#003d75] text-white rounded-lg py-2.5 font-bold transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Criar Demanda
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
