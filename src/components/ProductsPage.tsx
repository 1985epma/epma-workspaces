/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Database,
  Search,
  FileText,
  Volume2,
  Check,
  Shield,
  Zap,
  Lock,
  Mail,
  Loader2,
  X,
  Play,
  Briefcase,
  Layers,
  ChevronRight,
  FolderTree,
  Globe,
  Share2,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductsPageProps {
  onLoginSuccess: (email: string) => void;
  onViewWorkspace?: () => void;
  showWorkspaceButton?: boolean;
}

export default function ProductsPage({
  onLoginSuccess,
  onViewWorkspace,
  showWorkspaceButton = false
}: ProductsPageProps) {
  // Navigation & layout states
  const [activeTab, setActiveTab] = useState<'agents' | 'notes' | 'search' | 'recorder'>('agents');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Authentication form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ssoMode, setSsoMode] = useState(false);
  const [ssoDomain, setSsoDomain] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // SIMULATOR 1: AI Agents Simulation State
  const [agentStep, setAgentStep] = useState(0);
  const [agentLogs, setAgentLogs] = useState<string[]>(['[System] Agent initialized. Standing by.']);
  const [agentRunning, setAgentRunning] = useState(false);

  // SIMULATOR 2: AI Meeting Notes State
  const [notesDraft, setNotesDraft] = useState('Raw text: We met at 10 to talk about marketing. Bob wants to target Brazil first with $5k. Sarah notes design is delayed by a week. Leads will use HubSpot.');
  const [enhancedNotes, setEnhancedNotes] = useState<any | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // SIMULATOR 3: Enterprise Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // SIMULATOR 4: AI Workspace Recorder Audio State
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [recordingTranscript, setRecordingTranscript] = useState<string[]>([]);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(24).fill(4));

  // --- SIMULATIONS LOGIC ---

  // Agent Simulation loop
  useEffect(() => {
    if (!agentRunning) return;
    const steps = [
      { text: '🔍 Analyzing inbox for unread customer inquiries...', delay: 800 },
      { text: '💡 Found unread request: "Requesting pricing list for 20 seats"', delay: 1000 },
      { text: '⚡ AI Agent generating personalized PDF response based on Enterprise catalog...', delay: 1200 },
      { text: '✉️ Draft response prepared. Sent to Drafts folder for review.', delay: 1000 },
      { text: '✏️ Automatically updating CRM Lead status to "In Negotiation"', delay: 900 },
      { text: '✅ Busywork cycle completed successfully!', delay: 800 }
    ];

    if (agentStep < steps.length) {
      const timer = setTimeout(() => {
        setAgentLogs(prev => [...prev, steps[agentStep].text]);
        setAgentStep(prev => prev + 1);
      }, steps[agentStep].delay);
      return () => clearTimeout(timer);
    } else {
      setAgentRunning(false);
    }
  }, [agentRunning, agentStep]);

  const handleStartAgentDemo = () => {
    setAgentStep(0);
    setAgentLogs(['🤖 AI Agent spun up: "EPMACopilot-SAML2"']);
    setAgentRunning(true);
  };

  // Meeting Notes Enhancer Simulator
  const handleEnhanceNotesDemo = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setEnhancedNotes({
        title: '💼 Weekly Marketing Align & Strategy',
        summary: 'Strategic alignment on foreign expansion with focus on Brazil and CRM consolidation.',
        pills: ['Marketing Budget', 'Brazil Launch', 'HubSpot Integration'],
        bulletPoints: [
          '🎯 <strong>Target Allocation:</strong> Launching test campaigns in Brazil with an initial budget of <strong>$5,000 USD</strong>.',
          '⏳ <strong>Timeline constraint:</strong> Design deliverables are delayed by <strong>1 week</strong>, buffer added to launch plan.',
          '📊 <strong>Systems:</strong> Lead capture pipeline consolidated to <strong>HubSpot</strong>.'
        ],
        actions: [
          '👉 Bob: Allocate $5k budget inside Stripe ledger',
          '👉 Sarah: Push updated Figma layouts to dev sprint by Thursday'
        ]
      });
      setIsEnhancing(false);
    }, 1200);
  };

  // Enterprise Search Simulation
  const handleSearchDemo = (presetQuery: string) => {
    setSearchQuery(presetQuery);
    setIsSearching(true);
    setTimeout(() => {
      if (presetQuery.toLowerCase().includes('contract')) {
        setSearchResult({
          title: '📄 Acme-Corp-Enterprise-Agreement-v4.pdf',
          path: '/Shared/Billing-Ledgers/Contracts/Acme-Corp.pdf',
          rating: '98% relevance MATCH',
          excerpt: '“Section 4.2 outlines a negotiated term of 20 seat license allocations on standard database schemas, with Priority Google Gemini api gateways and custom workflows.”'
        });
      } else if (presetQuery.toLowerCase().includes('budget')) {
        setSearchResult({
          title: '📊 Q3-Enterprise-Financial-Forecast.xlsx',
          path: '/Root/Marketing/Strategy/Spreadsheets/Q3.xlsx',
          rating: '94% relevance MATCH',
          excerpt: '“Allocated line items: LatAm Expansion ($5,000 USD via Stripe setup), design operations delay reserve buffer line ($2,500 USD).”'
        });
      } else {
        setSearchResult({
          title: '📁 General Corporate Search Results',
          path: 'EPMA Database Federated search',
          rating: '88% match',
          excerpt: `Found 3 references to "${presetQuery}" in your nested private folders and collaborative databases.`
        });
      }
      setIsSearching(false);
    }, 850);
  };

  // Audio Recorder animation & simulator
  useEffect(() => {
    if (!audioRecording) return;
    
    // Wave animation
    const interval = setInterval(() => {
      setWaveHeights(Array.from({ length: 24 }, () => Math.floor(Math.random() * 28) + 4));
      setAudioDuration(prev => prev + 1);
    }, 250);

    return () => clearInterval(interval);
  }, [audioRecording]);

  useEffect(() => {
    if (!audioRecording) return;
    const transcripts = [
      { time: 3, speaker: 'AI Recorder (Real-time)', text: '🎙️ Speech recognized: "OK everyone, let\'s document actions..."' },
      { time: 7, speaker: 'AI Recorder (Real-time)', text: '📝 Transcribed: "...Bob is taking over the budget, $5k budget..."' },
      { time: 12, speaker: 'AI Agent (Live summary)', text: '✨ Live action item detected: "Create Stripe budget action item"' }
    ];

    const currentTrigger = transcripts.find(t => t.time === audioDuration);
    if (currentTrigger) {
      setRecordingTranscript(prev => [...prev, `${currentTrigger.speaker}: ${currentTrigger.text}`]);
    }
  }, [audioDuration, audioRecording]);

  const handleToggleRecording = () => {
    if (audioRecording) {
      setAudioRecording(false);
    } else {
      setAudioRecording(true);
      setAudioDuration(0);
      setRecordingTranscript(['🔴 Recording started... speak into meeting stream.']);
    }
  };

  // --- END SIMULATIONS LOGIC ---

  // Primary authentication handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError('Please fill in email and password fields.');
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      if (email.toLowerCase() === 'admin@epma.com' && password === 'admin123') {
        onLoginSuccess(email);
      } else if (password.length >= 6) {
        onLoginSuccess(email);
      } else {
        setAuthError('Invalid credentials. Use admin@epma.com and password admin123 for immediate demo access.');
      }
    }, 1000);
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoDomain) {
      setAuthError('Please input a valid workspace domain (e.g. corporate.com)');
      return;
    }
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      onLoginSuccess(`sso@${ssoDomain}`);
    }, 1200);
  };

  const triggerOpenAuth = (defaultEmail = '') => {
    setEmail(defaultEmail);
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-neutral-100 font-sans antialiased overflow-x-hidden selection:bg-indigo-500/30 selection:text-white relative">
      {/* Background Google Stitch Cohesive Mesh Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none select-none z-0" />

      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none select-none z-0" />
      <div className="absolute top-[30rem] right-1/4 w-[28rem] h-[28rem] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none select-none z-0" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 bg-gradient-to-r from-indigo-550 to-indigo-650 text-white rounded font-display font-black text-sm tracking-widest uppercase shadow-sm">
              EPMA
            </div>
            <span className="font-display font-semibold text-slate-200 tracking-tight text-sm hidden sm:inline">Workspace</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-heading font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Novidades & IA</a>
            <a href="#interactive" className="hover:text-white transition-colors">Amostras</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos Enterprise</a>
          </nav>

          <div className="flex items-center gap-3">
            {showWorkspaceButton && onViewWorkspace ? (
              <button
                onClick={onViewWorkspace}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-extrabold text-xs rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shadow-md"
              >
                Voltar ao Workspace ➔
              </button>
            ) : (
              <>
                <button
                  onClick={() => triggerOpenAuth()}
                  className="text-xs font-heading font-bold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Entrar (Sign In)
                </button>
                <button
                  onClick={() => triggerOpenAuth('admin@epma.com')}
                  className="px-3.5 py-1.5 bg-white text-slate-950 hover:bg-slate-100 font-heading font-bold text-xs rounded-lg transition duration-150 cursor-pointer shadow-sm"
                >
                  Criar Conta Grátis
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-16 pb-24 md:pt-28 md:pb-36 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono mb-6 select-none animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Suíte Corporativa UP-GRADE (Out/2026 Release)
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-display font-black tracking-tight text-white max-w-4xl leading-tight">
          O Workspace Definitivo com <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            Inteligência Artificial Corporativa
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mt-6 leading-relaxed">
          Sincronize documentos nested em níveis infinitos, controle tabelas de dados empresariais e desfrute de poderosos agentes autônomos para acelerar seus processos rotineiros de negócios.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
          <button
            onClick={() => triggerOpenAuth('admin@epma.com')}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-bold text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            Iniciar Demonstração Imediata
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <a
            href="#interactive"
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-heading font-bold text-sm rounded-xl transition duration-150 flex items-center justify-center cursor-pointer"
          >
            Experimentar Recursos IA abaixo
          </a>
        </div>

        {/* Small Trust badges */}
        <div className="mt-16 pt-8 border-t border-slate-800/60 w-full grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-500">
          <div className="flex items-center justify-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>SAML 2.0 & SSO Fed</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Backup Contínuo</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Gemini API de Alta Resolução</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Estruturas Relacionais</span>
          </div>
        </div>
      </section>

      {/* THE CORE PROMISE: ENTERPRISE AI PRODUCT TABS SUITE */}
      <section id="features" className="bg-slate-950 py-24 border-y border-slate-800 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-400 font-heading">Recursos Premium</span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">Para Clientes Enterprise</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-normal">
              A suíte de inteligência artificial dedicada mais forte do mercado para equipes estruturadas. Veja as ações funcionando ao vivo:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Products interactive side menu */}
            <div className="lg:col-span-4 space-y-3">
              {[
                {
                  id: 'agents',
                  title: 'AI Agents',
                  tagline: 'automate busywork',
                  desc: 'Automação autônoma que processa tarefas em background e atualiza ledgers corporativos.',
                  badge: 'AGENTE 2.0'
                },
                {
                  id: 'notes',
                  title: 'AI Meeting Notes',
                  tagline: 'Perfecty Written by AI',
                  desc: 'Modelagem instantânea de transcrições e anotações brutas em atas corporativas formais.',
                  badge: 'GEMINI AI'
                },
                {
                  id: 'search',
                  title: 'Enterprise search',
                  tagline: 'find answers instantly',
                  desc: 'Buscador semântico de longo alcance em arquivos, bases federadas e tabelas.',
                  badge: 'SEMANTIC'
                },
                {
                  id: 'recorder',
                  title: 'AI Workspace Recorder',
                  tagline: 'AI to record, transcripts and resume meetings automatically',
                  desc: 'Gravador integrado de áudio que extrai insights e constrói atas consolidadas automaticamente.',
                  badge: 'AUDIO LIVE'
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/10'
                      : 'bg-slate-900/30 border-slate-850 hover:border-slate-800 hover:bg-slate-900/50'
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.id === 'agents' && <Bot className="w-4 h-4" />}
                    {tab.id === 'notes' && <FileText className="w-4 h-4" />}
                    {tab.id === 'search' && <Search className="w-4 h-4" />}
                    {tab.id === 'recorder' && <Volume2 className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{tab.title}</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono tracking-wider">{tab.badge}</span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-400 block leading-tight">{tab.tagline}</span>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">{tab.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Live Interactive Sandbox Box Area */}
            <div className="lg:col-span-8 p-6 sm:p-8 bg-slate-900/50 border border-slate-800 rounded-3xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
              
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top status bar header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>DEMO ONLINE</span>
                  <span className="text-slate-600">/</span>
                  <span className="font-bold uppercase text-indigo-400">{activeTab} sandbox</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                </div>
              </div>

              {/* ACTIVE TAB DEMO SCREEN */}
              <div className="flex-1 flex flex-col justify-between">
                
                {activeTab === 'agents' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        AI Agent Simulator - Automação em Lote
                      </h3>
                      <p className="text-xs text-slate-400 max-w-xl">
                        Acione tarefas assíncronas em background. O agente lê seus documentos pendentes, monta e-mails de cobrança, e atualiza o funil de vendas sem requerer clique humano.
                      </p>
                    </div>

                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-[10px] space-y-1.5 h-36 overflow-y-auto scrollbar-thin">
                      {agentLogs.map((log, i) => (
                        <div key={i} className={`leading-normal ${log.includes('✅') ? 'text-emerald-400 font-bold' : log.includes('🤖') ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>
                          {log}
                        </div>
                      ))}
                      {agentRunning && (
                        <div className="flex items-center gap-1.5 text-indigo-400 animate-pulse text-[9px] mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Running task subprocess...
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-3">
                      <span className="text-[10px] text-slate-500 font-mono">Simulate customer billing update routine.</span>
                      <button
                        onClick={handleStartAgentDemo}
                        disabled={agentRunning}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white disabled:text-slate-500 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        {agentRunning ? 'Executando...' : 'Iniciar Rotina de IA'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        AI Meeting Notes - Atas Inteligentes Perfeitas
                      </h3>
                      <p className="text-xs text-slate-400">
                        Insira notas rápidas e deixe que nosso pipeline formatado em Gemini reescreva as conclusões e assinale responsabilidades.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Rascunho Bruto (Raw Input)</span>
                        <textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          className="w-full h-28 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-indigo-500 focus:outline-none resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold block">Resultado Gemini (Anotado)</span>
                        <div className="w-full h-28 p-2.5 bg-slate-950 border border-slate-800 rounded-xl overflow-y-auto text-[10px] text-slate-300 space-y-2">
                          {isEnhancing ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-1.5">
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                              <span>Processando Atas...</span>
                            </div>
                          ) : enhancedNotes ? (
                            <div className="space-y-2">
                              <p className="font-bold text-white text-[11px]">{enhancedNotes.title}</p>
                              <p className="text-slate-400 italic text-[9px]">{enhancedNotes.summary}</p>
                              <div className="space-y-1 border-t border-slate-850 pt-1.5">
                                {enhancedNotes.bulletPoints.map((bp: string, k: number) => (
                                  <p key={k} dangerouslySetInnerHTML={{ __html: bp }} />
                                ))}
                              </div>
                              <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 space-y-1 mt-1.5">
                                <span className="font-extrabold text-emerald-400 text-[8px] uppercase tracking-wider">Ações Mapeadas (Actions)</span>
                                {enhancedNotes.actions.map((act: string, k: number) => (
                                  <p key={k} className="text-[8px] text-slate-300 font-semibold">{act}</p>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-550 italic text-[10px] text-center p-4">
                              Clique em "Enhance with Gemini" para gerar o documento formal.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={handleEnhanceNotesDemo}
                        disabled={isEnhancing}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-650 to-purple-600 hover:from-indigo-750 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
                        Enhance with Gemini AI
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'search' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <Search className="w-4 h-4 text-indigo-400" />
                        Enterprise Federated Search - Busca Semântica
                      </h3>
                      <p className="text-xs text-slate-400">
                        Pesquise termos técnicos ou dados em toda a base de arquivos aninhados, planilhas salvas e contratos fechados.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {/* Search Bar Input emulator */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Digite ou selecione um preset abaixo: 'budget' ou 'contracts'..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-3">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                          </div>
                        )}
                      </div>

                      {/* Quick query pills */}
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-500 font-bold uppercase tracking-wider">Pills sugeridos:</span>
                        <button
                          onClick={() => handleSearchDemo('Q3 Marketing Budget allotment')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 cursor-pointer text-[10.5px]"
                        >
                          "Marketing budget Brazil"
                        </button>
                        <button
                          onClick={() => handleSearchDemo('Acme contract agreement seats')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 cursor-pointer text-[10.5px]"
                        >
                          "Acme corporate contract"
                        </button>
                      </div>

                      {/* Unified Result display box */}
                      <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 h-24 overflow-y-auto text-[10px] space-y-1 text-slate-300">
                        {isSearching ? (
                          <div className="h-full flex items-center justify-center text-slate-500 italic">
                            Buscando em Enterprise Indexers...
                          </div>
                        ) : searchResult ? (
                          <div className="space-y-1 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-105 text-white">{searchResult.title}</span>
                              <span className="text-[8px] bg-emerald-900/40 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">{searchResult.rating}</span>
                            </div>
                            <p className="text-slate-500 text-[8px] font-mono select-all shrink-0 font-bold">{searchResult.path}</p>
                            <p className="text-slate-400 text-[9.5px] leading-relaxed mt-1 italic">{searchResult.excerpt}</p>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-550 text-center italic">
                            Escolha um dos botões ou pesquise acima para ver a Federated Search responder imediatamente.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'recorder' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                        AI Workspace Recorder - Captura de Reunião Direta
                      </h3>
                      <p className="text-xs text-slate-400">
                        Grave suas reuniões por áudio. O sistema gera automaticamente a transcrição, rascunha as decisões do Stripe e anota prazos na aba do banco de dados relacional.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Wave and recording console */}
                      <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${audioRecording ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`} />
                          <span className="text-[10px] font-mono text-slate-400">
                            {audioRecording 
                              ? `RECORDING: ${Math.floor(audioDuration / 60)}:${(audioDuration % 60).toString().padStart(2, '0')}` 
                              : 'GRAVADOR STANDBY'}
                          </span>
                        </div>

                        {/* Interactive sound wave visualization bars */}
                        <div className="h-10 flex items-center justify-center gap-1.5 select-none pt-2 px-1">
                          {waveHeights.map((h, i) => (
                            <div
                              key={i}
                              style={{ height: `${h}px` }}
                              className={`w-1 rounded-full transition-all duration-300 ${
                                audioRecording ? 'bg-indigo-500' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={handleToggleRecording}
                          className={`w-full py-2 font-black text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 ${
                            audioRecording 
                              ? 'bg-red-650 hover:bg-red-700 text-white shadow-md' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          {audioRecording ? 'Parar Gravação' : 'Grave Reunião de Áudio'}
                        </button>
                      </div>

                      {/* Running transcript logging screen */}
                      <div className="md:col-span-7 bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[9px] h-28 overflow-y-auto space-y-1 text-slate-300">
                        {recordingTranscript.map((log, i) => (
                          <div key={i} className={log.includes('🔴') ? 'text-red-400 font-bold' : log.includes('✨') ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                            {log}
                          </div>
                        ))}
                        {!audioRecording && recordingTranscript.length === 0 && (
                          <div className="h-full flex items-center justify-center text-slate-550 text-center italic p-4">
                            Clique em "Grave Reunião" para observar a tomada de ata e transcrição semântica em tempo real.
                          </div>
                        )}
                        {audioRecording && (
                          <div className="text-[8px] text-indigo-400 animate-pulse mt-1">
                            ...listening and extracting meeting bullet ledgers...
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* WORKSPACE PREVIEW MODULE (EPMA STYLE MOCKUP) */}
      <section id="interactive" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-lg mx-auto mb-16 space-y-2">
          <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-400 font-heading">Preview Digital</span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white">EPMA Workspace UI Sandbox</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consulte a arquitetura e organize documentos, pastas nested de múltiplos níveis e mude instantaneamente entre documentos e tabelas com apenas um botão.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Workspace simulation screen skeleton */}
          <div className="grid grid-cols-12 h-[340px] text-xs">
            
            {/* Sidebar drawer mockup */}
            <div className="col-span-3 bg-slate-900 border-r border-slate-800/80 p-3 flex flex-col justify-between select-none">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 pb-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-bold text-slate-200">EPMA Workspace</span>
                </div>

                <div className="space-y-2 text-[10.5px]">
                  <span className="text-[8.5px] uppercase tracking-wider text-slate-500 font-extrabold block">Nested Folders</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-slate-300 font-semibold pl-1">
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                      <span>📁 01. Planejamento LatAm</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 pl-4 border-l border-slate-800 ml-2">
                      <span>📄 Plano Operacional</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 pl-4 border-l border-slate-800 ml-2">
                      <span>📋 Checklist de Lançamento</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 font-semibold pl-1">
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                      <span>📁 02. Recursos Humanos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest block">Licensing</span>
                <span className="text-[10px] font-black text-white">Pronto para Equipe</span>
              </div>
            </div>

            {/* Document / Database core editor mockup */}
            <div className="col-span-9 p-6 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚀</span>
                    <h3 className="font-bold text-sm text-white">01. Planejamento LatAm</h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[9.5px] text-slate-300 font-bold">Standard Document Layout</span>
                  </div>
                </div>

                <div className="space-y-2.5 max-w-xl text-slate-300">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Diretrizes Principais:</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Todos os processos de expansão regional, faturas de Stripe e registros de SAML 2.0 serão gerenciados através desta área de trabalho. Crie subtabelas clicando no botão switch superior quando sua equipe requerer modelagem estruturada relacional.
                  </p>
                  <div className="p-2.5 bg-slate-900/50 border border-slate-850 rounded-xl flex items-center gap-2 text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
                    <span className="text-indigo-200">Gemini Pro: <strong>Dica de Organização:</strong> Mantenha os contatos em subpáginas privadas.</span>
                  </div>
                </div>
              </div>

              {/* Call to action panel at bottom */}
              <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-4">
                <span className="text-[10px] text-slate-500">Documento salvo na nuvem com criptografia de ponta.</span>
                <button
                  onClick={() => triggerOpenAuth('admin@epma.com')}
                  className="px-3.5 py-1.5 bg-indigo-650 hover:bg-slate-200 hover:text-slate-950 text-white font-bold text-[10.5px] rounded-lg transition duration-150 cursor-pointer flex items-center gap-1"
                >
                  Abrir Minha Área de Trabalho
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="bg-slate-950 py-24 px-6 border-t border-slate-850 p-6 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-lg mx-auto mb-16 space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-400 font-mono">Ledger Real</span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">Nossos Planos de Assinatura</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Escolha a opção ideal para você e escale sua operação conforme a necessidade de sua organização corporativa.
            </p>

            {/* Toggle monthly / yearly */}
            <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 mt-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                  billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                  billingCycle === 'yearly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Anual (Salvar 12%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Free Tier */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[380px]">
              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full inline-block">Free Starter</span>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-white">U$0</span>
                  <span className="text-slate-500 text-xs ml-1">/sempre grátis</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">Ideal para rascunhos rápidos e documentações sandbox de usuário único.</p>
                
                <div className="space-y-2.5 pt-4 border-t border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Nível único de nesting</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Armazenamento local key-value</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-550 line-through">
                    <span>Sem IA Gemini Integrada</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => triggerOpenAuth('user@starter.com')}
                className="w-full mt-8 py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Começar Grátis
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-slate-900 p-6 rounded-2xl border-2 border-indigo-500 relative flex flex-col justify-between min-h-[400px]">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-indigo-600 text-white font-black text-[9px] tracking-widest uppercase px-2.5 py-0.5 rounded-full">
                MAIS POPULAR
              </div>

              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full inline-block">PRO Plan</span>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-white">U${billingCycle === 'monthly' ? '8' : '7.1'}</span>
                  <span className="text-slate-500 text-xs ml-1">/mês</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">Organização de alta fidelidade com processamento em cloud e exportações ilimitadas.</p>
                
                <div className="space-y-2.5 pt-4 border-t border-indigo-950/30 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Níveis de nesting ilimitados</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Views em tabela relacional</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Backup contínuo cloud</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Integração Base Gemini Pro AI</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => triggerOpenAuth('pro-user@epma.com')}
                className="w-full mt-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30"
              >
                Atualizar para o Pro
              </button>
            </div>

            {/* Enterprise Tier with details */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[380px]">
              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full inline-block">CORPORATE ENTERPRISE</span>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-white">U${billingCycle === 'monthly' ? '19' : '16.7'}</span>
                  <span className="text-slate-500 text-xs ml-1">/seat por mês</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">Segurança inabalável, auditoria legal, controle SAML login corporativo e Suíte Completa de Inteligência Artificial.</p>
                
                {/* Enterprise Premium Suite included list explicitly showing user requested features */}
                <div className="space-y-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl opacity-90">
                  <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400 shrink-0 animate-pulse" />
                    Inclui Suíte de IA:
                  </span>
                  <ul className="text-[8.5px] leading-tight text-slate-400 list-disc pl-3">
                    <li><strong>AI Agents:</strong> automate busywork</li>
                    <li><strong>AI Meeting Notes:</strong> Perfectly Written by AI</li>
                    <li><strong>Enterprise search:</strong> find answers instantly</li>
                    <li><strong>Workspace Recorder:</strong> record, transcripts & summarize</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => triggerOpenAuth('admin@epma.com')}
                className="w-full mt-6 py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Inicie Plano Enterprise
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER CO-CREDITS */}
      <footer className="py-12 border-t border-slate-800/80 bg-slate-950 text-slate-550 select-none text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="bg-slate-850 px-2 py-0.5 rounded text-white text-[10px] font-bold">EPMA</span>
            <span>&copy; {new Date().getFullYear()} EPMA Workspace. Todos as patentes e direitos reservados.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacidade</a>
            <a href="#" className="hover:text-white transition">Segurança SAML</a>
            <a href="#" className="hover:text-white transition">Gemini API Status</a>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL LAYER OUT (Overlay Panel on demand when clicking Call To Action buttons) */}
      <AnimatePresence>
        {showLoginModal && (
          <div id="login-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white text-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setAuthError(null);
                }}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Header title */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-950 text-white font-black text-xs rounded uppercase">EPMA</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Acesso Instantâneo</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">
                    {ssoMode ? 'Conectar com SSO' : 'Entrar no Workspace'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    {ssoMode 
                      ? 'Insira o domínio corporativo validado pela administração.' 
                      : 'Utilize os credenciais cadastrados para carregar seus documentos.'}
                  </p>
                </div>

                {/* Demonstration Alert helper box */}
                {!ssoMode && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1 select-all">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-750 block">Credenciais Rápidos de Teste:</span>
                    <div className="text-xs text-slate-705 font-mono leading-relaxed">
                      Email: <strong className="text-indigo-900">admin@epma.com</strong> <br />
                      Senha: <strong className="text-indigo-900">admin123</strong>
                    </div>
                  </div>
                )}

                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 leading-relaxed">
                    {authError}
                  </div>
                )}

                {/* Auth Switch Body Form */}
                {!ssoMode ? (
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700">Email Corporativo</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@corporate.com"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 text-slate-900"
                          disabled={authLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-extrabold text-slate-700">Senha</label>
                        <a href="#" className="text-[10px] text-slate-400 hover:text-slate-900 font-bold">Esqueceu?</a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Digite a senha (6+ caracteres)"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 text-slate-900"
                          disabled={authLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-350" />
                          Autenticando sessão...
                        </>
                      ) : (
                        <>
                          Entrar com Email corporativo
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSsoSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700">Domínio Corporativo SSO</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={ssoDomain}
                          onChange={(e) => setSsoDomain(e.target.value)}
                          placeholder="company.com"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 text-slate-900"
                          disabled={authLoading}
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-350" />
                          Conectando Provedor SAML...
                        </>
                      ) : (
                        <>
                          Conectar via Single Sign-On
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Switch between user/sso and socials */}
                <div className="space-y-3.5 pt-1">
                  <button
                    onClick={() => {
                      setSsoMode(!ssoMode);
                      setAuthError(null);
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{ssoMode ? 'Usar login tradicional por email' : 'Entrar via SAML / Single Sign-On (SSO)'}</span>
                  </button>

                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-2 text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Ou conecte rápido com</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => onLoginSuccess('google-sso@epma.com')}
                      className="py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center cursor-pointer transition"
                      title="Entrar com Google"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.1.3-1.15 2.1l2.91 2.26c1.7-1.57 2.68-3.88 2.68-6.21z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-2.91-2.26c-.72.48-1.63.78-2.67.78-2.06 0-3.81-1.39-4.43-3.25L1.01 19.33C3.01 22.12 7.15 24 12 24z" />
                        <path fill="#FBBC05" d="M7.57 16.36c-.16-.48-.25-1-.25-1.53s.09-1.05.25-1.53l-3.32-2.58A11.91 11.91 0 0 0 3 14.83c0 1.95.46 3.8 1.25 5.43l3.32-2.58z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.15 0 3.01 1.88 1.01 4.67l3.32 2.58c.62-1.86 2.37-3.25 4.43-3.25z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => onLoginSuccess('apple-id@epma.com')}
                      className="py-1.5 bg-slate-900 border border-slate-900 text-white hover:bg-slate-950 rounded-xl flex items-center justify-center cursor-pointer transition"
                      title="Entrar com Apple ID"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.92.99-3.03-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.92 1.12.09 2.26-.58 2.95-1.38z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => onLoginSuccess('microsoft-id@epma.com')}
                      className="py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center cursor-pointer transition"
                      title="Entrar com Microsoft Account"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 23 23">
                        <path fill="#F25022" d="M0 0h11v11H0z" />
                        <path fill="#7FBA00" d="M12 0h11v11H12z" />
                        <path fill="#00A4EF" d="M0 12h11v11H0z" />
                        <path fill="#FFB900" d="M12 12h11v11H12z" />
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
