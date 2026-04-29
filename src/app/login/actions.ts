"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type FormState = {
  error?: string;
  success?: boolean;
} | undefined;

export async function loginAction(state: FormState, formData: FormData) {
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;

  if (!email || !senha) {
    return { error: "Preencha todos os campos." };
  }

  try {
    const colaborador = await prisma.colaborador.findUnique({
      where: { email },
    });

    if (!colaborador || !colaborador.ativo) {
      return { error: "Usuário não encontrado ou inativo." };
    }

    const senhaValida = await bcrypt.compare(senha, colaborador.senha);

    if (!senhaValida) {
      return { error: "Senha incorreta." };
    }

    // Criar sessão
    await createSession(colaborador.id, colaborador.role, colaborador.nome);

    // Redirecionar
    redirect("/");
  } catch (error: any) {
    if (error?.digest?.includes("NEXT_REDIRECT")) {
      throw error; // Permitir redirecionamento
    }
    console.error("Login error:", error);
    return { error: "Ocorreu um erro ao tentar entrar. Tente novamente." };
  }
}
