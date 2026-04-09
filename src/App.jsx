import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Users, 
  ShieldCheck, 
  Lock, 
  Send, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  User,
  Download,
  Briefcase,
  Plug
} from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Estado do Admin
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadsCapturados, setLeadsCapturados] = useState([]); // <--- NOVO ESTADO ADICIONADO

  // Estado do Webhook (carrega do localStorage se existir)
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);

  useEffect(() => {
    const savedWebhook = localStorage.getItem('webhookUrl');
    if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }
  }, []);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    whatsapp: '',
    // Trabalhista
    trab_qtd_empregados: '',
    trab_pj: '',
    trab_cct: '',
    trab_processos: '',
    // Contratual
    cont_padrao: '',
    cont_inadimplencia: '',
    cont_societario: '',
    cont_propriedade: '',
    // Compliance
    comp_lgpd: '',
    comp_conduta: '',
    comp_denuncia: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    window.scrollTo(0, 0);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    window.scrollTo(0, 0);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Dispara para o Webhook (n8n)
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch (error) {
        console.error('Erro ao enviar dados para o Webhook:', error);
      }
    }

    // NOVO: Salva os dados permanentemente no nosso Servidor Backend (SQLite)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (error) {
      console.error('Erro ao salvar no banco de dados local:', error);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    // NOVO: Valida a senha no backend e já puxa os leads salvos
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      
      if (res.ok) {
        const data = await res.json();
        setLeadsCapturados(data); // Preenche a lista com os dados do banco
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminPassword('');
        setLoginError('');
      } else {
        setLoginError('Senha incorreta ou acesso negado.');
      }
    } catch (error) {
      setLoginError('Erro de conexão com o servidor. Verifique o backend.');
    }
  };

  const saveWebhookConfig = () => {
    localStorage.setItem('webhookUrl', webhookUrl);
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 3000);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  // Renderiza a área administrativa
  if (isAdmin) {
    return (
      <>
        <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-800 print:hidden">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Lock className="text-blue-600" />
                Painel Administrativo
              </h1>
              <button 
                onClick={() => setIsAdmin(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition-colors"
              >
                Sair
              </button>
            </div>

            {/* Seção de Integração Webhook */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-3 text-slate-800">
                <Plug size={20} className="text-blue-600" />
                Integração Webhook (n8n, Make, Zapier)
              </h2>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL de Destino do POST</label>
                  <input 
                    type="url" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-lg border-slate-300 border py-2.5 px-3 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                    placeholder="https://seu-n8n.com/webhook/checkup-lead"
                  />
                </div>
                <button 
                  onClick={saveWebhookConfig}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${webhookSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                >
                  {webhookSaved ? 'URL Salva!' : 'Salvar URL'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Os dados de cada lead serão enviados automaticamente em formato JSON para esta URL ao concluir o checkup.
              </p>
            </div>
          
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
              <h2 className="text-xl font-semibold mb-6 border-b pb-4">Leads Capturados (Histórico Completo)</h2>
              
              {leadsCapturados.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-sm">
                        <th className="p-4 border-b font-medium">Data</th>
                        <th className="p-4 border-b font-medium">Empresa & Nome</th>
                        <th className="p-4 border-b font-medium">Contato</th>
                        <th className="p-4 border-b font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadsCapturados.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 border-b text-sm text-slate-500">
                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4 border-b">
                            <div className="font-semibold text-slate-900">{lead.empresa}</div>
                            <div className="text-sm text-slate-600">{lead.nome}</div>
                          </td>
                          <td className="p-4 border-b text-sm">
                            <div>{lead.email}</div>
                            <div className="text-slate-500">{lead.whatsapp}</div>
                          </td>
                          <td className="p-4 border-b">
                            <button 
                              onClick={() => setSelectedLead(lead)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                  <FileText size={48} className="mb-4 text-slate-300" />
                  <p>Nenhum lead capturado nesta sessão ainda.</p>
                  <p className="text-sm mt-2">Preencha o formulário para ver os dados aparecerem aqui.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Detalhes do Lead */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in print:static print:bg-white print:block print:p-0">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 transform transition-all animate-in zoom-in-95 max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:max-h-none print:overflow-visible print:p-8">
              <div className="flex justify-between items-center mb-5 border-b pb-4 border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User size={20} className="text-blue-600 print:hidden" />
                  Relatório de Diagnóstico: {selectedLead.empresa}
                </h3>
                <div className="flex gap-3 print:hidden">
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                    title="Salvar como PDF"
                  >
                    <Download size={16} />
                    Baixar PDF
                  </button>
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none px-2"
                    title="Fechar"
                  >
                    &times;
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Contato */}
                <div>
                  <h4 className="font-semibold text-slate-800 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Contato da Empresa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500 block">Empresa:</span> <span className="font-medium text-slate-900">{selectedLead.empresa}</span></div>
                    <div><span className="text-slate-500 block">Responsável:</span> <span className="font-medium text-slate-900">{selectedLead.nome}</span></div>
                    <div><span className="text-slate-500 block">E-mail:</span> <span className="font-medium text-slate-900">{selectedLead.email}</span></div>
                    <div><span className="text-slate-500 block">WhatsApp:</span> <span className="font-medium text-slate-900">{selectedLead.whatsapp}</span></div>
                  </div>
                </div>

                {/* Trabalhista */}
                <div>
                  <h4 className="font-semibold text-slate-800 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Trabalhista</h4>
                  <div className="space-y-3 text-sm">
                    <div><span className="text-slate-500 block">Quantidade de Empregados:</span> <span className="font-medium text-slate-900">{selectedLead.trab_qtd_empregados}</span></div>
                    <div><span className="text-slate-500 block">Possui PJs com rotina/ordens:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.trab_pj}</span></div>
                    <div><span className="text-slate-500 block">Aplica rigorosamente a CCT:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.trab_cct}</span></div>
                    <div><span className="text-slate-500 block">Processos/Condenações (2 anos):</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.trab_processos}</span></div>
                  </div>
                </div>

                {/* Contratual */}
                <div>
                  <h4 className="font-semibold text-slate-800 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Contratual e Societário</h4>
                  <div className="space-y-3 text-sm">
                    <div><span className="text-slate-500 block">Contratos revisados por advogado:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.cont_padrao}</span></div>
                    <div><span className="text-slate-500 block">Cláusulas rigorosas de inadimplência:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.cont_inadimplencia}</span></div>
                    <div><span className="text-slate-500 block">Possui Acordo de Sócios:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.cont_societario}</span></div>
                    <div><span className="text-slate-500 block">Garantia de PI e NDA:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.cont_propriedade}</span></div>
                  </div>
                </div>

                {/* Compliance */}
                <div>
                  <h4 className="font-semibold text-slate-800 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Compliance e LGPD</h4>
                  <div className="space-y-3 text-sm">
                    <div><span className="text-slate-500 block">Adequação à LGPD implementada:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.comp_lgpd}</span></div>
                    <div><span className="text-slate-500 block">Código de Conduta assinado:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.comp_conduta}</span></div>
                    <div><span className="text-slate-500 block">Canal de denúncias formalizado:</span> <span className="font-medium text-slate-900 capitalize">{selectedLead.comp_denuncia}</span></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white py-8 px-4 shadow-md">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-full mb-4">
            <Scale size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Checkup Jurídico Empresarial</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Descubra os riscos ocultos do seu negócio em menos de 3 minutos. Responda ao questionário abaixo e receba um diagnóstico preliminar da sua empresa.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          
          {isSubmitted ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center transform transition-all">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Checkup Concluído!</h2>
              <p className="text-lg text-slate-600 mb-8">
                Obrigado por confiar em nós, <strong className="text-slate-800">{formData.nome.split(' ')[0]}</strong>. 
                Nossa equipe de especialistas está analisando suas respostas neste momento.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Próximos Passos
                </h3>
                <p className="text-blue-800 text-sm">
                  Em breve, enviaremos o resultado do seu diagnóstico de risco para o e-mail <strong>{formData.email}</strong> e entraremos em contato via WhatsApp no número <strong>{formData.whatsapp}</strong> para agendar uma consultoria gratuita sobre os pontos de atenção para a sua empresa <strong>{formData.empresa}</strong>.
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Fazer novo checkup
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              
              {/* Progress Bar */}
              <div className="bg-slate-100 h-2 w-full">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>

              <div className="p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                  
                  {/* PASSO 1: Captura de Lead */}
                  {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="mb-8">
                        <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Passo 1 de 4</span>
                        <h2 className="text-2xl font-bold mt-2 text-slate-900">Seus Dados de Contato</h2>
                        <p className="text-slate-500 mt-1">Para onde devemos enviar o resultado do diagnóstico da sua empresa?</p>
                      </div>

                      <div className="space-y-5">
                        {/* NOVO CAMPO: EMPRESA */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Briefcase className="h-5 w-5 text-slate-400" />
                            </div>
                            <input 
                              type="text" 
                              name="empresa"
                              required
                              value={formData.empresa}
                              onChange={handleInputChange}
                              className="pl-10 w-full rounded-lg border-slate-300 border py-3 px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                              placeholder="Ex: Minha Empresa LTDA"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome Completo</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input 
                              type="text" 
                              name="nome"
                              required
                              value={formData.nome}
                              onChange={handleInputChange}
                              className="pl-10 w-full rounded-lg border-slate-300 border py-3 px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                              placeholder="Ex: João da Silva"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Melhor E-mail</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input 
                              type="email" 
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              className="pl-10 w-full rounded-lg border-slate-300 border py-3 px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                              placeholder="joao@empresa.com.br"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp (com DDD)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-slate-400" />
                            </div>
                            <input 
                              type="tel" 
                              name="whatsapp"
                              required
                              value={formData.whatsapp}
                              onChange={handleInputChange}
                              className="pl-10 w-full rounded-lg border-slate-300 border py-3 px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                              placeholder="(11) 99999-9999"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end">
                        <button 
                          type="button" 
                          onClick={nextStep}
                          disabled={!formData.nome || !formData.empresa || !formData.email || !formData.whatsapp}
                          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Começar Checkup <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PASSO 2: Trabalhista */}
                  {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                      <div className="mb-8 flex items-start gap-4">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
                          <Users size={24} />
                        </div>
                        <div>
                          <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Passo 2 de 4</span>
                          <h2 className="text-2xl font-bold mt-1 text-slate-900">Direito Trabalhista</h2>
                          <p className="text-slate-500 mt-1">Avalie a relação com seus colaboradores e prestadores.</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                          <label className="font-medium text-slate-800 mb-3 block">1. Qual a quantidade atual de empregados registrados (CLT)?</label>
                          <select
                            name="trab_qtd_empregados"
                            value={formData.trab_qtd_empregados}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-lg border-slate-300 border py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700"
                          >
                            <option value="">Selecione uma opção</option>
                            <option value="0">Nenhum, apenas sócios ou autônomos</option>
                            <option value="1-5">1 a 5 colaboradores</option>
                            <option value="6-20">6 a 20 colaboradores</option>
                            <option value="21-50">21 a 50 colaboradores</option>
                            <option value="50+">Mais de 50 colaboradores</option>
                          </select>
                        </div>

                        <Question 
                          title="2. A empresa possui prestadores de serviço (PJ ou autônomos) que cumprem rotina, horário fixo e recebem ordens diretas (risco de vínculo empregatício)?"
                          name="trab_pj"
                          value={formData.trab_pj}
                          onChange={handleInputChange}
                        />
                        <Question 
                          title="3. A empresa conhece e aplica rigorosamente as regras da Convenção Coletiva de Trabalho (CCT) do seu sindicato (ex: piso salarial, benefícios obrigatórios, estabilidades)?"
                          name="trab_cct"
                          value={formData.trab_cct}
                          onChange={handleInputChange}
                        />
                        <Question 
                          title="4. A empresa possui processos trabalhistas ativos ou sofreu condenações neste âmbito nos últimos 2 anos?"
                          name="trab_processos"
                          value={formData.trab_processos}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mt-8 flex justify-between">
                        <button type="button" onClick={prevStep} className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors">Voltar</button>
                        <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">Próximo <ChevronRight size={18} /></button>
                      </div>
                    </div>
                  )}

                  {/* PASSO 3: Contratual */}
                  {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                      <div className="mb-8 flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                          <FileText size={24} />
                        </div>
                        <div>
                          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Passo 3 de 4</span>
                          <h2 className="text-2xl font-bold mt-1 text-slate-900">Direito Contratual e Societário</h2>
                          <p className="text-slate-500 mt-1">Como está a segurança dos acordos comerciais da sua empresa?</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <Question 
                          title="1. A empresa utiliza contratos elaborados ou revisados por um advogado especialista para fechar negócios com clientes e fornecedores?"
                          name="cont_padrao"
                          value={formData.cont_padrao}
                          onChange={handleInputChange}
                        />
                        <Question 
                          title="2. Os contratos padrão possuem cláusulas rigorosas de proteção contra inadimplência, juros, multas e regras para rescisão antecipada?"
                          name="cont_inadimplencia"
                          value={formData.cont_inadimplencia}
                          onChange={handleInputChange}
                        />
                        <Question 
                          title="3. A empresa possui um Acordo de Sócios (Memorando de Entendimentos) formalizado, estabelecendo regras sobre saída societária, venda de cotas e falecimento?"
                          name="cont_societario"
                          value={formData.cont_societario}
                          onChange={handleInputChange}
                        />
                        <Question 
                          title="4. Os contratos garantem que a Propriedade Intelectual (marcas, métodos, softwares) criada para o negócio pertence à empresa e possuem cláusulas de confidencialidade (NDA)?"
                          name="cont_propriedade"
                          value={formData.cont_propriedade}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mt-8 flex justify-between">
                        <button type="button" onClick={prevStep} className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors">Voltar</button>
                        <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">Próximo <ChevronRight size={18} /></button>
                      </div>
                    </div>
                  )}

                  {/* PASSO 4: Compliance e LGPD */}
                  {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                      <div className="mb-8 flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Passo 4 de 4</span>
                          <h2 className="text-2xl font-bold mt-1 text-slate-900">Compliance & Proteção de Dados</h2>
                          <p className="text-slate-500 mt-1">A adequação da sua empresa às normas de ética e privacidade.</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <Question 
                          title="1. A empresa já mapeou seus processos e possui uma Política de Privacidade e Proteção de Dados (adequação à LGPD) devidamente implementada?"
                          name="comp_lgpd"
                          value={formData.comp_lgpd}
                          onChange={handleInputChange}
                        />
                        <Question 
                          title="2. Existe um Código de Conduta ou Regulamento Interno que tenha sido lido e assinado por todos os colaboradores?"
                          name="comp_conduta"
                          value={formData.comp_conduta}
                          onChange={handleInputChange}
                        />
                        <Question 
                          title="3. A empresa possui um canal de denúncias formalizado onde funcionários podem relatar irregularidades anonimamente?"
                          name="comp_denuncia"
                          value={formData.comp_denuncia}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
                        <button type="button" onClick={prevStep} className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors">Voltar</button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30 disabled:opacity-70"
                        >
                          {isSubmitting ? 'Analisando...' : 'Finalizar e Ver Diagnóstico'}
                          {!isSubmitting && <Send size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm relative">
        <p>© {new Date().getFullYear()} Soluções Jurídicas Empresariais. Todos os direitos reservados.</p>
        <p className="mt-1">Protegemos seus dados. Não enviamos spam.</p>
        
        {/* Hidden Login Trigger */}
        <button 
          onClick={() => setShowAdminLogin(true)}
          className="absolute bottom-4 right-4 text-slate-700 hover:text-slate-500 transition-colors p-2"
          title="Área Restrita"
        >
          <Lock size={16} />
        </button>
      </footer>

      {/* Modal de Login Admin */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock size={20} className="text-blue-600" />
                Acesso Restrito
              </h3>
              <button 
                onClick={() => { setShowAdminLogin(false); setLoginError(''); }}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAdminLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha de Acesso</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border py-2.5 px-3 focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Insira a senha"
                  autoFocus
                />
                {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-800 transition-colors"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componente de perguntas
function Question({ title, name, value, onChange }) {
  const options = [
    { label: 'Sim', value: 'sim' },
    { label: 'Não', value: 'nao' },
    { label: 'Não tenho certeza', value: 'incerto' }
  ];

  return (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
      <p className="font-medium text-slate-800 mb-4">{title}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {options.map((opt) => (
          <label 
            key={opt.value} 
            className={`
              flex-1 border rounded-lg py-3 px-4 flex items-center gap-3 cursor-pointer transition-all
              ${value === opt.value 
                ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' 
                : 'bg-white border-slate-200 hover:border-blue-300'
              }
            `}
          >
            <input 
              type="radio" 
              name={name} 
              value={opt.value} 
              checked={value === opt.value}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              required
            />
            <span className={`text-sm font-medium ${value === opt.value ? 'text-blue-900' : 'text-slate-600'}`}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
