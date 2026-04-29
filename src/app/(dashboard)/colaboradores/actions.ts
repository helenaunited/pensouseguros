"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export type ColaboradorData = {
  nome: string;
  email: string;
  telefone: string;
  funcao: string;
  senha?: string;
  role?: string;
};

export async function listarColaboradores() {
  return prisma.colaborador.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });
}

export async function listarTodosColaboradores() {
  return prisma.colaborador.findMany({
    orderBy: { nome: "asc" },
  });
}

export async function criarColaborador(data: ColaboradorData) {
  try {
    const hashedPassword = await bcrypt.hash(data.senha || "pensou@123", 10);
    
    await prisma.colaborador.create({ 
      data: {
        ...data,
        senha: hashedPassword,
        role: data.role || "colaborador"
      } 
    });
    
    revalidatePath("/colaboradores");
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "Já existe um colaborador com esse e-mail." };
    }
    return { success: false, error: "Erro ao criar colaborador." };
  }
}

export async function editarColaborador(id: string, data: ColaboradorData) {
  try {
    const updateData: any = { ...data };
    
    if (data.senha) {
      updateData.senha = await bcrypt.hash(data.senha, 10);
    } else {
      delete updateData.senha; // Não alterar se vazio
    }

    await prisma.colaborador.update({ 
      where: { id }, 
      data: updateData 
    });
    
    revalidatePath("/colaboradores");
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "Já existe um colaborador com esse e-mail." };
    }
    return { success: false, error: "Erro ao editar colaborador." };
  }
}

export async function desativarColaborador(id: string) {
  try {
    await prisma.colaborador.update({ where: { id }, data: { ativo: false } });
    revalidatePath("/colaboradores");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao desativar colaborador." };
  }
}

export async function reativarColaborador(id: string) {
  try {
    await prisma.colaborador.update({ where: { id }, data: { ativo: true } });
    revalidatePath("/colaboradores");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao reativar colaborador." };
  }
}
