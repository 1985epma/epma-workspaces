/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Bot,
  Check,
  LayoutGrid,
  Lock,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface ProductsPageProps {
  onLoginSuccess: (email: string) => void;
  onViewWorkspace?: () => void;
  showWorkspaceButton?: boolean;
}

export default function ProductsPage({ onLoginSuccess, onViewWorkspace, showWorkspaceButton = false }: ProductsPageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('admin@epma.com');
  const [password, setPassword] = useState('admin123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const openLogin = (prefill = 'admin@epma.com') => {
    setEmail(prefill);
    setPassword(prefill === 'admin@epma.com' ? 'admin123' : '');
    setAuthError(null);
    setShowLoginModal(true);
  };

  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError('Preencha email e senha.');
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
        setAuthError('Use admin@epma.com e admin123 para entrar na demo.');
      }
    }, 700);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_38%),linear-gradient(180deg,#f7f6f2_0%,#f2efe8_100%)] text-neutral-900 selection:bg-black/10 selection:text-black">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(17,17,17,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_top,black_60%,transparent_100%)]" />

      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-black/5 bg-neutral-900 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-white">EPMA</div>
            <span className="hidden text-sm font-medium text-neutral-500 md:inline">Workspace</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-neutral-500 md:flex">
            <a href="#features" className="transition hover:text-neutral-900">Recursos</a>
            <a href="#preview" className="transition hover:text-neutral-900">Preview</a>
            <a href="#pricing" className="transition hover:text-neutral-900">Planos</a>
          </nav>

          <div className="flex items-center gap-2">
            {showWorkspaceButton && onViewWorkspace && (
              <button onClick={onViewWorkspace} className="rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50">
                Abrir workspace
              </button>
            )}
            <button onClick={() => openLogin('admin@epma.com')} className="rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50">
              Entrar
            </button>
            <button onClick={() => openLogin('admin@epma.com')} className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800">
              Começar grátis
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
              AI workspace com escrita, organização e resumos
            </div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-neutral-950 md:text-7xl">
              Um workspace limpo para pensar com a AI.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 md:text-lg">
              O EPMA combina notas, páginas aninhadas, tabelas relacionais e assistência generativa em uma interface leve, silenciosa e muito mais próxima do que um produto premium deveria parecer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => openLogin('admin@epma.com')} className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800">
                Entrar na demo
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#preview" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/5 bg-white px-6 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50">
                Ver preview
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 py-1.5 shadow-sm"><ShieldCheck className="h-3.5 w-3.5 text-neutral-500" /> SSO-ready</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 py-1.5 shadow-sm"><Bot className="h-3.5 w-3.5 text-neutral-500" /> AI assistente</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 py-1.5 shadow-sm"><LayoutGrid className="h-3.5 w-3.5 text-neutral-500" /> Tabelas relacionais</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 py-1.5 shadow-sm"><Search className="h-3.5 w-3.5 text-neutral-500" /> Busca global</span>
            </div>
          </div>

          <div id="preview" className="relative">
            <div className="absolute -inset-6 rounded-[40px] bg-black/5 blur-3xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-black/5 bg-white/85 p-5 shadow-[0_30px_90px_rgba(17,17,17,0.10)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Preview digital</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">EPMA Workspace</div>
                </div>
                <div className="rounded-full border border-black/5 bg-neutral-50 px-3 py-1 text-[11px] font-medium text-neutral-500">Live</div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[28px] border border-black/5 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">📝</div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Estratégia do trimestre</div>
                      <div className="text-xs text-neutral-500">Notas, blocos e AI na mesma superfície</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-neutral-700">
                    <div className="rounded-2xl border border-black/5 bg-white px-3 py-2">• Reescreva e resuma blocos com um clique</div>
                    <div className="rounded-2xl border border-black/5 bg-white px-3 py-2">• Alterne entre documento e tabela sem ruído</div>
                    <div className="rounded-2xl border border-black/5 bg-white px-3 py-2">• Organize subpáginas e bases relacionais</div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-black/5 bg-[#f7f5ef] p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
                    <Bot className="h-4 w-4 text-neutral-500" /> AI summary
                  </div>
                  <div className="space-y-3 rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
                    <p className="text-sm leading-6 text-neutral-700">Transforme notas dispersas em um plano claro, com prioridades, datas e responsabilidades.</p>
                    <div className="flex flex-wrap gap-2 pt-1 text-xs text-neutral-500">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1">Resumo</span>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1">Checklist</span>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1">Tarefas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            ['Escreva com foco', 'Tipografia limpa, editor leve e blocos sem poluição visual.'],
            ['Organize com AI', 'Resumos, expansão e reescrita dentro do fluxo de trabalho.'],
            ['Estruture dados', 'Páginas, tabelas e propriedades conectadas sem complicação.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
              <div className="mb-2 text-sm font-semibold text-neutral-900">{title}</div>
              <div className="text-sm leading-6 text-neutral-600">{description}</div>
            </div>
          ))}
        </section>

        <section id="pricing" className="mt-16 grid gap-4 lg:grid-cols-3">
          {[
            { title: 'Free', price: 'R$0', description: 'Para rascunhos e uso individual.' },
            { title: 'Pro', price: 'U$8', description: 'Para equipes pequenas e trabalho diário.' },
            { title: 'Enterprise', price: 'U$19', description: 'Para times que precisam de controle e AI.' },
          ].map((plan, index) => (
            <div key={plan.title} className={`rounded-[32px] border p-6 shadow-sm ${index === 1 ? 'border-black/10 bg-white' : 'border-black/5 bg-white/80'}`}>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">{plan.title}</div>
              <div className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">{plan.price}</div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">{plan.description}</div>
              <div className="mt-5 space-y-2 text-sm text-neutral-700">
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-neutral-500" /> Documentos aninhados</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-neutral-500" /> Assistência AI</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-neutral-500" /> Exportação limpa</div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-2 text-sm text-neutral-500">
        <div className="flex flex-col justify-between gap-3 border-t border-black/5 pt-6 sm:flex-row sm:items-center">
          <div className="font-medium text-neutral-700">EPMA Workspace</div>
          <div className="flex gap-5">
            <a href="#" className="transition hover:text-neutral-900">Privacidade</a>
            <a href="#" className="transition hover:text-neutral-900">Segurança</a>
            <a href="#" className="transition hover:text-neutral-900">Status</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-md rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_30px_90px_rgba(17,17,17,0.18)]"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Acesso</div>
                  <h2 className="mt-1 text-2xl font-semibold text-neutral-950">Entrar na EPMA</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">Uma conta de demo já deixa você dentro do workspace.</p>
                </div>
                <button onClick={() => setShowLoginModal(false)} className="rounded-full p-2 text-neutral-400 transition hover:bg-black/5 hover:text-neutral-700">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {authError && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</div>}

              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="w-full rounded-2xl border border-black/5 bg-white px-10 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-300"
                      placeholder="you@company.com"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Senha</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="w-full rounded-2xl border border-black/5 bg-white px-10 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-300"
                      placeholder="admin123"
                    />
                  </div>
                </label>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button type="submit" disabled={authLoading} className="flex-1 rounded-full bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60">
                    {authLoading ? 'Entrando...' : 'Entrar'}
                  </button>
                  <button type="button" onClick={() => openLogin('admin@epma.com')} className="rounded-full border border-black/5 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
                    Usar demo
                  </button>
                </div>
              </form>

              <div className="mt-5 rounded-2xl border border-black/5 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-neutral-500">
                Demo: <span className="font-medium text-neutral-900">admin@epma.com</span> / <span className="font-medium text-neutral-900">admin123</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}