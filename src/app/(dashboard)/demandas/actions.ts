"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type DemandaData = {
  titulo: string;
  descricao: string;
  prioridade: string;
  colaborador_id: string;
};

export async function listarDemandas() {
  return prisma.demanda.findMany({
    include: { colaborador: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function criarDemanda(data: DemandaData) {
  try {
    const prazo = new Date();
    prazo.setHours(prazo.getHours() + 24); // SLA automático de 24h

    await prisma.demanda.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade,
        colaborador_id: data.colaborador_id,
        prazo,
      },
    });
    revalidatePath("/demandas");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar demanda." };
  }
}

export async function atualizarStatusDemanda(id: string, status: string) {
  try {
    await prisma.demanda.update({ where: { id }, data: { status } });
    revalidatePath("/demandas");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar status." };
  }
}
