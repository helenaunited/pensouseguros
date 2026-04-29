"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, Copy, FileIcon, Loader2, AlertCircle } from "lucide-react";
import { parsePdfAction, type ParsedData } from "./actions";

export default function GeradorEmailPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Por favor, selecione um arquivo PDF.");
      return;
    }

    setError(null);
    setFileName(file.name);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const result = await parsePdfAction(formData);

    if (result.success && result.data) {
      setParsedData(result.data);
    } else {
      setError(result.error || "Erro ao processar o arquivo.");
      setParsedData(null);
    }

    setIsLoading(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const generateEmailText = () => {
    if (!parsedData) return "";
    return `Agradeço pelo seguro fechado conosco! Segue em anexo o contrato do seu seguro. Peço que confira os dados atentamente e me envie o documento assinado, ou apenas responda a este e-mail confirmando que está de acordo com o contrato.

Abaixo estão alguns dados do seu seguro:

Vigência: ${parsedData.vigencia}
Cobertura Compreensiva: ${parsedData.coberturaCompreensiva}
${parsedData.danosMateriais} de cobertura para terceiros - Danos materiais
${parsedData.danosCorporais} de cobertura para terceiros - Danos corporais
Assistência 24 horas: ${parsedData.assistencia}
Carro reserva: ${parsedData.carroReserva}
Franquia: ${parsedData.franquia}

Dados do Veículo e Perfil:

Principal Condutor: ${parsedData.condutor}
CEP pernoite: ${parsedData.cep}
Modelo: ${parsedData.modelo}
Placa: ${parsedData.placa}
Uso: ${parsedData.uso}

Pagamento:

Valor Total: ${parsedData.valorTotal}
Parcelamento: ${parsedData.parcelamento}

Atenciosamente,
Pensou Seguros`;
  };

  const emailText = generateEmailText();

  const handleCopy = async () => {
    if (!emailText) return;
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header com Azul Porto Seguro */}
      <div className="bg-[#004b8d] text-white py-12 px-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold tracking-tight">Gerador de E-mail via PDF</h1>
          </div>
          <p className="text-blue-100 text-lg">Faça upload da apólice ou proposta e gere automaticamente o e-mail de fechamento.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          
          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={handleFileInput}
            />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-700 font-medium">Processando documento...</p>
                <p className="text-gray-500 text-sm mt-1">Extraindo dados importantes com inteligência artificial.</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center justify-center">
                <FileIcon className="w-12 h-12 text-blue-600 mb-4" />
                <p className="text-gray-900 font-semibold">{fileName}</p>
                <p className="text-blue-600 text-sm mt-2 font-medium hover:underline">Clique para trocar de arquivo</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-gray-900 font-semibold text-lg mb-1">Clique para enviar ou arraste o PDF aqui</p>
                <p className="text-gray-500 text-sm">Suporta apólices e propostas no formato .pdf</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Template Area */}
          {parsedData && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">E-mail Gerado</h2>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm focus:ring-4 focus:ring-yellow-500/20"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copiado!' : 'Copiar E-mail'}
                </button>
              </div>
              
              <div className="relative">
                <textarea 
                  readOnly
                  className="w-full h-[400px] bg-[#f8fafc] border border-gray-200 text-gray-800 text-sm rounded-xl p-6 resize-none focus:ring-blue-500 focus:border-blue-500 shadow-inner font-mono"
                  value={emailText}
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Por favor, confira os dados extraídos acima antes de enviá-los ao cliente. O preenchimento pode conter omissões dependendo do formato da seguradora.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
