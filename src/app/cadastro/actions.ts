"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export type CadastroFormState = {
  error?: string;
  success?: boolean;
} | undefined;

export async function cadastroAction(state: CadastroFormState, formData: FormData) {
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const funcao = formData.get("funcao") as string;
  const senha = formData.get("senha") as string;

  if (!nome || !email || !telefone || !funcao || !senha) {
    return { error: "Preencha todos os campos." };
  }

  try {
    const existingUser = await prisma.colaborador.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Já existe um cadastro com este e-mail." };
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await prisma.colaborador.create({
      data: {
        nome,
        email,
        telefone,
        funcao,
        senha: hashedPassword,
        ativo: false, // Entra bloqueado por padrão
        role: "colaborador",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Cadastro error:", error);
    return { error: "Ocorreu um erro ao processar o cadastro. Tente novamente." };
  }
}
