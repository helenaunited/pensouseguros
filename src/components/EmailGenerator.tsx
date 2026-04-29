"use client";

import { useState } from "react";
import { Copy, FileText, CheckCircle2 } from "lucide-react";

export function EmailGenerator() {
  const [formData, setFormData] = useState({
    cliente: "",
    seguradora: "",
    produto: "",
    premio: "",
    vigencia: "",
  });

  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);

  const defaultTemplate = `Olá, {{cliente}}.

Gostaríamos de confirmar a emissão da sua apólice junto à {{seguradora}}.

Detalhes do Seguro:
- Produto: {{produto}}
- Valor do Prêmio: R$ {{premio}}
- Vigência: {{vigencia}}

Agradecemos a confiança na Pensou Seguros. Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Pensou Seguros`;

  const handleGenerate = () => {
    let text = defaultTemplate;
    text = text.replace(/{{cliente}}/g, formData.cliente || "[Nome do Cliente]");
    text = text.replace(/{{seguradora}}/g, formData.seguradora || "[Seguradora]");
    text = text.replace(/{{produto}}/g, formData.produto || "[Produto]");
    text = text.replace(/{{premio}}/g, formData.premio || "[Valor do Prêmio]");
    text = text.replace(/{{vigencia}}/g, formData.vigencia || "[Vigência]");
    setGeneratedText(text);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Gerador de E-mail de Confirmação</h2>
          <p className="text-sm text-gray-500">Crie modelos rápidos para envio aos clientes</p>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Cliente</label>
            <input 
              type="text" 
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm transition-colors"
              placeholder="Ex: João da Silva"
              value={formData.cliente}
              onChange={(e) => setFormData({...formData, cliente: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seguradora</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm transition-colors"
                placeholder="Ex: Porto Seguro"
                value={formData.seguradora}
                onChange={(e) => setFormData({...formData, seguradora: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Produto</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm transition-colors"
                placeholder="Ex: Seguro Auto"
                value={formData.produto}
                onChange={(e) => setFormData({...formData, produto: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor do Prêmio</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm transition-colors"
                placeholder="Ex: 2.500,00"
                value={formData.premio}
                onChange={(e) => setFormData({...formData, premio: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vigência</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm transition-colors"
                placeholder="Ex: 20/04/2026 a 20/04/2027"
                value={formData.vigencia}
                onChange={(e) => setFormData({...formData, vigencia: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm focus:ring-4 focus:ring-blue-500/20 flex justify-center items-center gap-2"
          >
            Gerar Texto
          </button>
        </div>

        <div className="flex flex-col h-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resultado</label>
          <div className="flex-1 relative flex flex-col">
            <textarea 
              readOnly
              className="flex-1 w-full min-h-[250px] bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-5 resize-none focus:ring-blue-500 focus:border-blue-500 shadow-inner"
              value={generatedText || "Preencha os campos e clique em 'Gerar Texto' para visualizar o modelo de e-mail aqui..."}
            />
            {generatedText && (
              <button 
                onClick={handleCopy}
                className={`absolute bottom-4 right-4 flex items-center gap-2 border border-gray-200 font-medium py-2 px-4 rounded-md transition-all shadow-sm ${
                  copied 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar para Área de Transferência'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
