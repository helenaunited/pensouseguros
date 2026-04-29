"use server";

if (typeof global !== 'undefined' && typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {} as any;
}

import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ParsedData = {
  vigencia: string;
  coberturaCompreensiva: string;
  danosMateriais: string;
  danosCorporais: string;
  assistencia: string;
  carroReserva: string;
  franquia: string;
  condutor: string;
  cep: string;
  modelo: string;
  placa: string;
  uso: string;
  valorTotal: string;
  parcelamento: string;
};

const FALLBACK = "[Não encontrado]";

const PROMPT_TEMPLATE = (text: string) => `
Você é um especialista em seguros automotivos brasileiros com mais de 20 anos de experiência.
Sua tarefa é extrair informações-chave de um documento de seguro auto, independentemente da seguradora de origem.

IMPORTANTE: Cada seguradora usa terminologia e layout diferente. Seja flexível na identificação dos campos.
Analise semanticamente o conteúdo e infira as informações mesmo que os rótulos sejam diferentes dos esperados.

REGRAS:
1. Responda APENAS com JSON válido, sem markdown, sem texto extra.
2. Se um campo não existir no documento, use exatamente: "${FALLBACK}"
3. Nunca invente valores — extraia apenas o que está explicitamente no texto.
4. Remova espaços extras, quebras de linha e caracteres especiais desnecessários dos valores.
5. Para valores monetários, mantenha o formato "R$ X.XXX,XX".
6. Para datas, mantenha o formato "DD/MM/AAAA".

GUIA DE EXTRAÇÃO POR CAMPO:

"vigencia"
  Procure por: Vigência, Período de Cobertura, Validade, Data Início/Fim, Início Vigência, Fim Vigência
  Variações comuns: "De XX/XX/XXXX a XX/XX/XXXX", "Início: XX/XX", "Vencimento: XX/XX"
  Formato esperado: "DD/MM/AAAA a DD/MM/AAAA"

"coberturaCompreensiva"
  Procure por: Cobertura Compreensiva, Casco, Colisão, CASCO, Valor Segurado, % FIPE, Compreensivo, Perda Total
  Variações: pode aparecer como percentual da tabela FIPE (ex: 100% FIPE) ou valor em R$
  Formato esperado: "R$ XX.XXX,XX" ou "XX% FIPE"

"danosMateriais"
  Procure por: Danos Materiais, RCF-DM, RC Danos Materiais, D. Materiais, Danos a Terceiros (Materiais), RCF Material
  Formato esperado: "R$ XXX.XXX,XX"

"danosCorporais"
  Procure por: Danos Corporais, RCF-DC, RC Danos Corporais, D. Corporais, Danos a Terceiros (Corporais), Danos Pessoais, RCF Corporal, RCPD
  Formato esperado: "R$ XXX.XXX,XX"

"assistencia"
  Procure por: Assistência 24h, Guincho, Reboque, Assistência Viagem, Raio de Cobertura Guincho, Assistência Auto
  Variações: pode ser em km ("até 600 km") ou "Ilimitado" ou tipo de plano ("Completa", "Básica")
  Formato esperado: "600 km" ou "Ilimitado" ou nome do plano

"carroReserva"
  Procure por: Carro Reserva, Veículo Reserva, Automóvel Reserva, Locação de Veículo, Diárias Reserva
  Formato esperado: "15 dias" ou "30 diárias"
  Se não houver carro reserva, use "${FALLBACK}"

"franquia"
  Procure por: Franquia, Participação Obrigatória, Coparticipação, Franquia Normal, Franquia Reduzida
  Formato esperado: "R$ X.XXX,XX"

"condutor"
  Procure por: Principal Condutor, Condutor Principal, Segurado, Nome do Segurado, Proponente, Tomador
  Priorize o "Condutor Principal" se houver; caso contrário, use o nome do "Segurado/Proponente"
  Formato esperado: Nome completo em letras maiúsculas ou título de capitalização

"cep"
  Procure por: CEP Pernoite, CEP de Pernoite, CEP Residencial, CEP do Risco, Código Postal, Endereço do Segurado
  Formato esperado: "XXXXX-XXX" ou "XXXXXXXX"

"modelo"
  Procure por: Veículo, Modelo do Veículo, Automóvel, Marca/Modelo, Descrição do Bem
  Inclua marca + modelo + versão se disponível (ex: "VW Polo 1.0 TSI")
  Formato esperado: "Marca Modelo Versão AnoFab/AnoMod"

"placa"
  Procure por: Placa, Placa do Veículo, Identificação do Veículo
  Formato esperado: "ABC1234" ou "ABC1D23" (Mercosul)

"uso"
  Procure por: Uso do Veículo, Utilização, Categoria de Uso, Perfil de Uso
  Variações comuns: "Lazer", "Trabalho", "Comercial Leve", "Particular"
  Formato esperado: palavra ou expressão curta

"valorTotal"
  Procure por: Prêmio Total, Valor Total, Total a Pagar, Prêmio Líquido + IOF, Custo Total do Seguro
  IMPORTANTE: Use o valor TOTAL final incluindo IOF e taxas, não o valor parcial
  Formato esperado: "R$ X.XXX,XX"

"parcelamento"
  Procure por: Forma de Pagamento, Parcelamento, Pagamento, Condições de Pagamento, Débito, Crédito, Boleto
  Variações: "12x cartão Visa", "À vista boleto", "3x débito automático"
  Formato esperado: descrição da forma de pagamento e número de parcelas

TEXTO DO DOCUMENTO:
---
${text.slice(0, 15000)}
---

Retorne apenas o JSON com os 14 campos acima:
`;

async function extractWithGemini(text: string): Promise<ParsedData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1,       // Resposta mais determinística e precisa
      responseMimeType: "application/json", // Forçar saída JSON diretamente
    },
  });

  const prompt = PROMPT_TEMPLATE(text);

  // Retry automático para 429 (rate limit)
  let result;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      result = await model.generateContent(prompt);
      break;
    } catch (err: any) {
      if (err?.status === 429 && attempt < 3) {
        const waitMs = attempt * 10000;
        console.log(`Rate limit 429 - aguardando ${waitMs}ms (tentativa ${attempt}/3)...`);
        await new Promise(res => setTimeout(res, waitMs));
      } else {
        throw err;
      }
    }
  }

  const response = await result!.response;
  const rawText = response.text().trim();

  // Remove markdown code fences caso existam
  const jsonText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: ParsedData;
  try {
    parsed = JSON.parse(jsonText) as ParsedData;
  } catch {
    console.error("JSON inválido retornado pelo Gemini:", jsonText.slice(0, 500));
    throw new Error("Resposta da IA em formato inválido.");
  }

  // Garante que todos os campos existem e limpa valores vazios
  const fields: (keyof ParsedData)[] = [
    "vigencia", "coberturaCompreensiva", "danosMateriais", "danosCorporais",
    "assistencia", "carroReserva", "franquia", "condutor", "cep",
    "modelo", "placa", "uso", "valorTotal", "parcelamento"
  ];

  for (const field of fields) {
    const val = parsed[field];
    if (!val || val.trim() === "" || val.toLowerCase() === "null" || val.toLowerCase() === "n/a") {
      parsed[field] = FALLBACK;
    } else {
      parsed[field] = val.trim();
    }
  }

  return parsed;
}

export async function parsePdfAction(formData: FormData): Promise<{ success: boolean; data?: ParsedData; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Nenhum arquivo enviado." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";
    try {
      const data = await pdfParse(buffer);
      text = data.text;
    } catch (err) {
      console.error("Erro no pdfParse:", err);
      return { success: false, error: "Falha ao ler o conteúdo do PDF. O arquivo pode estar corrompido ou protegido." };
    }

    if (!text || text.trim().length < 50) {
      return {
        success: false,
        error: "O PDF não contém texto legível. Pode ser um arquivo escaneado (imagem). Tente um PDF nativo gerado digitalmente."
      };
    }

    console.log("=== TEXTO EXTRAÍDO DO PDF ===");
    console.log(`Caracteres: ${text.length}`);
    console.log(text.slice(0, 3000));
    console.log("============================");

    try {
      const parsedData = await extractWithGemini(text);
      console.log("=== DADOS EXTRAÍDOS ===");
      console.log(JSON.stringify(parsedData, null, 2));
      console.log("======================");
      return { success: true, data: parsedData };
    } catch (geminiError: any) {
      console.error("Erro no Gemini:", geminiError);
      const msg = geminiError?.message || "";
      if (msg.includes("429") || geminiError?.status === 429) {
        return { success: false, error: "Limite de requisições atingido. Aguarde 1 minuto e tente novamente." };
      }
      return { success: false, error: "Erro ao interpretar o PDF com IA. Tente novamente em alguns segundos." };
    }

  } catch (error) {
    console.error("Erro inesperado:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}
