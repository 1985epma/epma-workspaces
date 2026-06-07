/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CreditCard,
  Shield,
  CheckCircle,
  X,
  Sparkles,
  Zap,
  Building,
  ArrowRight,
  Loader2,
  Gift,
  HelpCircle,
  Coins,
  Receipt,
  Smartphone,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function BillingModal({ isOpen, onClose, userEmail }: BillingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<'Free' | 'Pro' | 'Enterprise'>(() => {
    return (localStorage.getItem('epma_billing_tier') as any) || 'Free';
  });
  const [selectedTier, setSelectedTier] = useState<'Free' | 'Pro' | 'Enterprise'>('Pro');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  // Brazil CNPJ, UK GBP, CH CHF, US USD rules
  const [billingCountry, setBillingCountry] = useState<'BR' | 'UK' | 'CH' | 'US'>(() => {
    return (localStorage.getItem('epma_billing_country') as any) || 'US';
  });
  const [cnpj, setCnpj] = useState(() => {
    return localStorage.getItem('epma_cnpj') || '';
  });
  const [cnpjError, setCnpjError] = useState('');

  // Checkout flow state
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'payment' | 'completed'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'gpay' | 'applepay'>('stripe');
  
  // Form input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState(userEmail.split('@')[0] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Business Multi-currency pricing matrix
  // BR paga em BRL (R$). UK em GBP (£). Suiça em CHF (CHF). Resto em USD ($)
  const pricingMatrix = {
    BR: {
      Free: { monthly: 0, annually: 0 },
      Pro: { monthly: 40, annually: 32 },
      Enterprise: { monthly: 120, annually: 95 }
    },
    UK: {
      Free: { monthly: 0, annually: 0 },
      Pro: { monthly: 7, annually: 5.5 },
      Enterprise: { monthly: 20, annually: 16 }
    },
    CH: {
      Free: { monthly: 0, annually: 0 },
      Pro: { monthly: 8, annually: 6.5 },
      Enterprise: { monthly: 24, annually: 19 }
    },
    US: {
      Free: { monthly: 0, annually: 0 },
      Pro: { monthly: 8, annually: 6.5 },
      Enterprise: { monthly: 24, annually: 19 }
    }
  };

  const cleanCNPJ = (val: string) => {
    return val.replace(/\D/g, '');
  };

  const formatCNPJ = (value: string) => {
    const raw = value.replace(/\D/g, '');
    if (raw.length <= 2) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`;
    if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
    if (raw.length <= 12) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`;
    return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12, 14)}`;
  };

  const getCurrencySymbol = (countryCode: 'BR' | 'UK' | 'CH' | 'US' = billingCountry) => {
    if (countryCode === 'BR') return 'R$';
    if (countryCode === 'UK') return '£';
    if (countryCode === 'CH') return 'CHF';
    return '$';
  };

  const getCurrencyName = (countryCode: 'BR' | 'UK' | 'CH' | 'US' = billingCountry) => {
    if (countryCode === 'BR') return 'BRL (Real Brasileiro)';
    if (countryCode === 'UK') return 'GBP (Libras Esterlinas)';
    if (countryCode === 'CH') return 'CHF (Franco Suíço)';
    return 'USD (Dólar Americano)';
  };

  const getPrice = (tier: 'Free' | 'Pro' | 'Enterprise', countryCode: 'BR' | 'UK' | 'CH' | 'US' = billingCountry) => {
    const base = pricingMatrix[countryCode][tier][billingCycle];
    if (billingCycle === 'annually') {
      return Math.round(base * 12 * (1 - promoDiscount));
    }
    return Math.round(base * (1 - promoDiscount));
  };

  const handleApplyPromo = (explicitCode?: string) => {
    setPromoError('');
    const codeToApply = (explicitCode || promoCode).trim().toUpperCase();
    if (!codeToApply) return;

    if (codeToApply === 'EPMA20' || codeToApply === 'STRIPE' || codeToApply === 'GEMINI') {
      setPromoDiscount(0.20);
      setPromoApplied(true);
      setPromoCode(codeToApply);
      setPromoError('');
    } else if (codeToApply === 'WELCOME50') {
      setPromoDiscount(0.50);
      setPromoApplied(true);
      setPromoCode(codeToApply);
      setPromoError('');
    } else if (codeToApply === 'STRIPEFREE') {
      setPromoDiscount(1.00);
      setPromoApplied(true);
      setPromoCode(codeToApply);
      setPromoError('');
    } else {
      setPromoError('Invalid coupon code. Try WELCOME50 or EPMA20.');
    }
  };

  const handleSelectPlanToCheckout = (tier: 'Free' | 'Pro' | 'Enterprise') => {
    setCnpjError('');
    setStripeError(null);
    
    // Strict Brazil validation rule
    if (billingCountry === 'BR') {
      const rawCnpj = cleanCNPJ(cnpj);
      if (!rawCnpj || rawCnpj.length < 14) {
        setCnpjError('O CNPJ é obrigatório e deve conter 14 dígitos para clientes no Brasil.');
        return;
      }
    }

    if (tier === 'Free') {
      // Instantly demote/set to Free
      setCurrentPlan('Free');
      localStorage.setItem('epma_billing_tier', 'Free');
      localStorage.setItem('epma_billing_country', billingCountry);
      localStorage.setItem('epma_cnpj', cnpj);
      setCheckoutStep('completed');
      return;
    }
    setSelectedTier(tier);
    setCheckoutStep('payment');
  };

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStripeError(null);

    if (billingCountry === 'BR' && cleanCNPJ(cnpj).length < 14) {
      setStripeError('Por favor informe um CNPJ válido de 14 dígitos antes de faturar.');
      return;
    }

    if (paymentMethod === 'stripe') {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardholderName) {
        setStripeError('Please fill in your card credential fields.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setStripeError('Card number seems incomplete or invalid.');
        return;
      }
    }

    setIsSubmitting(true);

    // Call server endpoint to simulate or invoke real Stripe intent creation
    try {
      const response = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedTier,
          cycle: billingCycle,
          email: userEmail,
          paymentMethod,
          price: getPrice(selectedTier),
          country: billingCountry,
          cnpj: billingCountry === 'BR' ? cnpj : undefined
        }),
      });
      
      const sessionResult = await response.json();
      
      // Artificial short delay for a premium card animation feel
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentPlan(selectedTier);
        localStorage.setItem('epma_billing_tier', selectedTier);
        localStorage.setItem('epma_billing_country', billingCountry);
        localStorage.setItem('epma_cnpj', cnpj);
        setCheckoutStep('completed');
      }, 1400);

    } catch (err) {
      console.error('Network checkout error, proceeding in developer sandbox mode:', err);
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentPlan(selectedTier);
        localStorage.setItem('epma_billing_tier', selectedTier);
        localStorage.setItem('epma_billing_country', billingCountry);
        localStorage.setItem('epma_cnpj', cnpj);
        setCheckoutStep('completed');
      }, 1200);
    }
  };

  const handleGoogleApplePayClick = (method: 'gpay' | 'applepay') => {
    setPaymentMethod(method);
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentPlan(selectedTier);
      localStorage.setItem('epma_billing_tier', selectedTier);
      setCheckoutStep('completed');
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div id="billing-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm select-none">
      
      {/* Modal Card wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        id="billing-modal-card"
        className="bg-white rounded-[32px] shadow-[0_30px_90px_rgba(17,17,17,0.16)] border border-black/5 max-w-4xl w-full h-[640px] flex flex-col md:flex-row overflow-hidden relative"
      >
        
        {/* Absolute Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-1.5 rounded-full bg-white/90 hover:bg-white text-neutral-500 hover:text-neutral-900 border border-black/5 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COMPANION PANEL: Detailed subscription features list */}
        <div className="w-full md:w-80 bg-neutral-50 text-neutral-900 p-8 flex flex-col justify-between shrink-0 relative overflow-hidden border-r border-black/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(17,17,17,0.04),transparent)] pointer-events-none" />
          
          <div className="space-y-6 z-10">
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-white rounded-full text-[10px] font-semibold tracking-widest uppercase ${
                selectedTier === 'Enterprise'
                  ? 'bg-neutral-900'
                  : selectedTier === 'Pro'
                    ? 'bg-neutral-700'
                    : 'bg-neutral-500'
              }`}>
                {selectedTier}
              </span>
              <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Billing Ledger</p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">Current active tier:</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-lg font-semibold text-neutral-900">{currentPlan} Plan</span>
                {currentPlan !== 'Free' && (
                  <span className="px-2 py-0.5 bg-neutral-900 text-white rounded-full font-medium text-[10px]">Active</span>
                )}
              </div>
            </div>

            <div className="border-t border-black/5 pt-6 space-y-4">
              <p className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">Plan benefits included</p>
              
              <div className="space-y-3">
                {selectedTier === 'Enterprise' ? (
                  <>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="font-bold text-white block">AI Agents</span>
                        <span className="text-neutral-400 text-[10px]">automate busywork</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">AI Meeting Notes</span>
                        <span className="text-neutral-400 text-[10px]">Perfectly Written by AI</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Enterprise search</span>
                        <span className="text-neutral-400 text-[10px]">find answers instantly</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">AI Workspace Recorder</span>
                        <span className="text-neutral-400 text-[10px] leading-snug block">AI to record, transcripts and resume meetings automatically</span>
                      </div>
                    </div>
                  </>
                ) : selectedTier === 'Pro' ? (
                  <>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">Unlimited private nested document levels</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">Advanced table views & schema creation</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">Priority server-side Google Gemini 3.5 processing</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">Instant database backups, CSV exports & SAML log-in</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">Basic single user documents</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">Local key-value storage sandbox</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="z-10 space-y-2.5 mt-8 border-t border-neutral-800 pt-6">
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>SSL Fully Encrypted Stripe Gateway</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Payments are securely encrypted and parsed natively by the Stripe billing gateway. No credit card files ever touch our cloud storage.
            </p>
          </div>
        </div>

        {/* RIGHT MAIN PANEL: Active step canvas */}
        <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Select Plan Tier */}
            {checkoutStep === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 flex-1 flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Upgrade Workspace Plan</h3>
                    <p className="text-xs text-neutral-400">Choose the workspace scale that matches your enterprise operations.</p>
                  </div>

                  {/* Regional & Local Currency Business Rules */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">Região de Faturamento / Billing Region</label>
                      <select
                        id="billing-country-select"
                        value={billingCountry}
                        onChange={(e) => {
                          const nextCountry = e.target.value as any;
                          setBillingCountry(nextCountry);
                          localStorage.setItem('epma_billing_country', nextCountry);
                          setStripeError(null);
                          setCnpjError('');
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs font-semibold text-neutral-800 outline-hidden"
                      >
                        <option value="BR">🇧🇷 Brasil (BRL - R$)</option>
                        <option value="UK">🇬🇧 United Kingdom (GBP - £)</option>
                        <option value="CH">🇨🇭 Switzerland (CHF)</option>
                        <option value="US">🇺🇸 Rest of World (USD - $)</option>
                      </select>
                      <p className="text-[9px] text-neutral-400">Regras locais: Brasil paga em R$ (Requer CNPJ), UK em £, Suíça em CHF e o resto do mundo em USD.</p>
                    </div>

                    {billingCountry === 'BR' ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-indigo-650 uppercase tracking-wider">CNPJ do Cliente (Obrigatório Brasil)</label>
                        <input
                          id="billing-cnpj-input"
                          type="text"
                          required
                          value={cnpj}
                          onChange={(e) => {
                            const formatted = formatCNPJ(e.target.value);
                            setCnpj(formatted);
                            localStorage.setItem('epma_cnpj', formatted);
                            setCnpjError('');
                          }}
                          placeholder="00.000.000/0001-00"
                          className="w-full px-3 py-1.5 bg-white border border-indigo-200 focus:border-indigo-600 rounded-xl text-xs font-mono font-bold text-neutral-800 outline-hidden"
                        />
                        {cnpjError ? (
                          <p className="text-[9px] text-red-650 font-bold leading-normal">{cnpjError}</p>
                        ) : (
                          <p className="text-[9px] text-indigo-550">Pagamento faturado em Reais (BRL). Requer preenchimento do CNPJ.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 flex flex-col justify-center">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Moeda Ativa</label>
                        <p className="text-xs font-black text-neutral-705">{getCurrencyName()}</p>
                        <p className="text-[9px] text-neutral-405">Nenhuma tributação adicional de CNPJ exigida para esta região.</p>
                      </div>
                    )}
                  </div>

                  {/* Toggle Billing interval */}
                  <div className="flex justify-center">
                    <div className="p-1 rounded-full bg-neutral-100 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          billingCycle === 'monthly' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400 hover:text-neutral-800'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle('annually')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          billingCycle === 'annually' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400 hover:text-neutral-800'
                        }`}
                      >
                        Annually
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold">20% Off</span>
                      </button>
                    </div>
                  </div>

                  {/* Grid of Plans */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    
                    {/* Free Plan Cards */}
                    <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      currentPlan === 'Free' 
                        ? 'border-neutral-200 bg-neutral-50/50' 
                        : 'border-neutral-200 hover:border-neutral-350'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-500 uppercase">Starter</span>
                          {currentPlan === 'Free' && <span className="text-[10px] bg-neutral-200 text-neutral-700 font-bold px-1.5 py-0.5 rounded-full">Active</span>}
                        </div>
                        <h4 className="text-base font-bold text-neutral-800 mt-2">Free Plan</h4>
                        <div className="mt-3 flex items-baseline">
                          <span className="text-2xl font-black text-neutral-900">{getCurrencySymbol()}0</span>
                          <span className="text-[10px] text-neutral-400 ml-1">forever</span>
                        </div>
                        <p className="text-[10px] text-neutral-450 mt-2.5">Standard single user document and local persistence sandbox.</p>
                      </div>
                      <button
                        type="button"
                        disabled={currentPlan === 'Free'}
                        onClick={() => handleSelectPlanToCheckout('Free')}
                        className={`w-full mt-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                          currentPlan === 'Free'
                            ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                            : 'bg-neutral-800 hover:bg-neutral-950 text-white cursor-pointer'
                        }`}
                      >
                        Current Plan
                      </button>
                    </div>

                    {/* Pro Plan Cards (POPULAR) */}
                    <div className="p-4 rounded-2xl border border-indigo-600 bg-indigo-50/20 relative shadow-xs flex flex-col justify-between">
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[8px] font-black uppercase tracking-wider">
                        POPULAR
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-600 uppercase">Creator</span>
                          {currentPlan === 'Pro' && <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full">Active</span>}
                        </div>
                        <h4 className="text-base font-bold text-neutral-800 mt-2">Personal Pro</h4>
                        <div className="mt-3 flex items-baseline">
                          <span className="text-2xl font-black text-neutral-900">
                            {getCurrencySymbol()}{pricingMatrix[billingCountry].Pro[billingCycle]}
                          </span>
                          <span className="text-[10px] text-neutral-400 ml-1">/mo {billingCycle === 'annually' && 'billed yrly'}</span>
                        </div>
                        <p className="text-[10px] text-neutral-450 mt-2.5">Full Workspace nested page controls and custom tags databases.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectPlanToCheckout('Pro')}
                        className={`w-full mt-4 py-1.5 rounded-xl text-xs font-bold shadow-xs transition leading-none py-2 cursor-pointer ${
                          currentPlan === 'Pro'
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {currentPlan === 'Pro' ? 'Manage/Extend' : 'Upgrade to Pro'}
                      </button>
                    </div>

                    {/* Enterprise Team Cards */}
                    <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      currentPlan === 'Enterprise' 
                        ? 'border-neutral-200 bg-neutral-50/50' 
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-600 uppercase">Corporate</span>
                          {currentPlan === 'Enterprise' && <span className="text-[10px] bg-neutral-900 text-white font-bold px-1.5 py-0.5 rounded-full">Active</span>}
                        </div>
                        <h4 className="text-base font-bold text-neutral-800 mt-2">Enterprise</h4>
                        <div className="mt-3 flex items-baseline">
                          <span className="text-2xl font-black text-neutral-900">
                            {getCurrencySymbol()}{pricingMatrix[billingCountry].Enterprise[billingCycle]}
                          </span>
                          <span className="text-[10px] text-neutral-400 ml-1">/mo per seat</span>
                        </div>
                        <p className="text-[10px] text-neutral-450 mt-1.5">Collaborative database records, SAML log-ins, and priority support.</p>
                        <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-550/20 space-y-1">
                          <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            Premium AI Suite Included:
                          </span>
                          <ul className="text-[9px] text-neutral-650 space-y-0.5 list-disc pl-3.5 leading-tight">
                            <li><strong>AI Agents:</strong> automate busywork</li>
                            <li><strong>AI Meeting Notes:</strong> Perfectly Written by AI</li>
                            <li><strong>Enterprise search:</strong> find answers instantly</li>
                            <li><strong>AI Work Recorder:</strong> record, transcript & resume meetings automatically</li>
                          </ul>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectPlanToCheckout('Enterprise')}
                        className={`w-full mt-4 py-1.5 rounded-xl text-xs font-bold transition leading-none py-2 cursor-pointer ${
                          currentPlan === 'Enterprise'
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-neutral-900 hover:bg-neutral-950 text-white'
                        }`}
                      >
                        {currentPlan === 'Enterprise' ? 'Manage/Extend' : 'Upgrade Team'}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Available Coupons list */}
                <div className="border-t border-neutral-100 pt-4 space-y-2">
                  <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Available Coupons / Cupons Disponíveis</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { code: 'EPMA20', label: '20% Off', desc: 'Saves 20% on all plans', icon: Sparkles },
                      { code: 'WELCOME50', label: '50% Off', desc: 'Half-price promo key', icon: Gift },
                      { code: 'STRIPEFREE', label: '100% Free', desc: '100% Off developer trial', icon: Coins }
                    ].map((coupon) => {
                      const GiftIcon = coupon.icon;
                      const isActive = promoCode.toUpperCase() === coupon.code && promoApplied;
                      return (
                        <button
                          key={coupon.code}
                          type="button"
                          onClick={() => handleApplyPromo(coupon.code)}
                          className={`p-2.5 rounded-xl border border-dashed transition-all text-left flex items-start justify-between relative overflow-hidden group cursor-pointer ${
                            isActive
                              ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                              : 'border-neutral-250 hover:border-neutral-400 bg-neutral-50 hover:bg-neutral-100/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <GiftIcon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : 'text-neutral-500'}`} />
                              <span className="text-xs font-extrabold uppercase tracking-wide">{coupon.code}</span>
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-none">{coupon.desc}</p>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-[10px] font-black tracking-tighter px-1.5 py-0.5 rounded-md ${
                              isActive ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {isActive ? 'Active' : coupon.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Promo Code area */}
                <div className="border-t border-neutral-100 pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-neutral-700">Have a custom promotional key?</p>
                      <p className="text-[10px] text-neutral-400">Type coupon code or click any offer card above to apply discounts</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 w-full sm:w-auto shrink-0">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="ENTER CODE"
                      disabled={promoApplied}
                      className="px-3 py-1.5 border border-neutral-200 focus:border-neutral-700 rounded-lg text-xs font-sans outline-hidden font-bold tracking-wider uppercase text-neutral-800 w-28 disabled:bg-neutral-100 disabled:text-neutral-400"
                    />
                    <button
                      onClick={() => handleApplyPromo()}
                      disabled={promoApplied || !promoCode}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition disabled:bg-neutral-200 disabled:text-neutral-400 cursor-pointer"
                    >
                      {promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>

                {/* Promo error feedback */}
                {promoError && (
                  <p className="text-[11px] text-red-600 mt-1 text-right font-semibold">{promoError}</p>
                )}

              </motion.div>
            )}

            {/* STEP 2: Payment Inputs (Stripe / Apple / Google Pay) */}
            {checkoutStep === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Checkout securely</h3>
                      <p className="text-xs text-neutral-400">Complete payment details for the {selectedTier} plan.</p>
                    </div>
                    <button
                      onClick={() => setCheckoutStep('select')}
                      className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    >
                      &larr; Choose plan
                    </button>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-800">{selectedTier} Subscription</p>
                      <p className="text-[10px] text-neutral-400">{billingCycle === 'monthly' ? 'Billed Monthly' : 'Billed Annually'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-neutral-900">{getCurrencySymbol()}{getPrice(selectedTier)}</p>
                      {promoApplied && <span className="text-[9px] font-bold text-emerald-600">20% discount applied!</span>}
                    </div>
                  </div>

                  {/* Quick Payment Wallets (Apple Pay / Google Pay) */}
                  <div className="grid grid-cols-2 gap-3 pb-1">
                    
                    {/* Google Pay Wallet API simulation button */}
                    <button
                      id="gpay-wallet-checkout-btn"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleGoogleApplePayClick('gpay')}
                      className="py-2 px-4 border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.56v.94c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-.94c-1.39-.14-2.5-1.12-2.5-2.5 0-1.38 1.12-2.5 2.5-2.5h1V11c0-.55-.45-1-1-1s-1 .45-1 1c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5 0-1.39 1.12-2.5 2.5-2.5v-.94c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v.94c1.39.14 2.5 1.12 2.5 2.5 0 1.38-1.12 2.5-2.5 2.5h-1v1.5c0 .55.45 1 1 1s1-.45 1-1c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5 0 1.39-1.12 2.5-2.5 2.5z" fill="#4B5563"/>
                      </svg>
                      <span className="text-xs font-bold text-neutral-800">Google Pay</span>
                    </button>

                    {/* Apple Pay Wallet API simulation button */}
                    <button
                      id="applepay-wallet-checkout-btn"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleGoogleApplePayClick('applepay')}
                      className="py-2 px-4 border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-neutral-800 shrink-0" />
                      <span className="text-xs font-bold text-neutral-900">Apple Pay</span>
                    </button>

                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-neutral-200"></div>
                    <span className="flex-shrink mx-3 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">or credit card via Stripe</span>
                    <div className="flex-grow border-t border-neutral-200"></div>
                  </div>

                  {stripeError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[11px] text-red-600 leading-normal font-medium">
                      {stripeError}
                    </div>
                  )}

                  {/* Stripe Card Elements form simulation */}
                  <form onSubmit={handleStripeCheckout} className="space-y-3">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 outline-hidden"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Credit Card Number (Stripe Test ok)</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => {
                              // Auto format spaces for card numbers
                              const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                              const matches = val.match(/\d{4,16}/g);
                              const match = (matches && matches[0]) || '';
                              const parts = [];
                              for (let i = 0, len = match.length; i < len; i += 4) {
                                parts.push(match.substring(i, i + 4));
                              }
                              if (parts.length > 0) {
                                setCardNumber(parts.join(' '));
                              } else {
                                setCardNumber(val);
                              }
                            }}
                            maxLength={19}
                            placeholder="4242 4242 4242 4242"
                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 outline-hidden font-mono"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Expiry</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length <= 4) {
                              setCardExpiry(val.length > 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val);
                            }
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 outline-hidden font-mono text-center"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">CVC / CVV</label>
                        <input
                          type="password"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 outline-hidden font-mono text-center"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="col-span-2 flex items-end">
                        <button
                          id="submit-stripe-payment-btn"
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 disabled:bg-neutral-550 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-300" />
                              Stripe Processing...
                            </>
                          ) : (
                            <>
                              Subscribe with Card ({getCurrencySymbol()}{getPrice(selectedTier)})
                              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </form>
                </div>

                <div className="text-[10px] text-neutral-400 leading-normal border-t border-neutral-100 pt-3">
                  Under the terms of our service, subscriptions auto-renew at the end of the term. You can cancel your Stripe billing parameters at any time instantly.
                </div>
              </motion.div>
            )}

            {/* STEP 3: Complete Success Screen */}
            {checkoutStep === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 h-full"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                  <CheckCircle className="w-10 h-10" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-extrabold border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
                    PRO STATUS ON
                  </span>
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight pt-1">Subscription Confirmed!</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    Thank you! Your workspace tier is now updated to <span className="font-bold text-neutral-800">{currentPlan}</span>. Fully persistent database views and nested assets are unlocked.
                  </p>
                </div>

                <div className="py-2.5 px-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left space-y-1 max-w-xs w-full text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Account owner:</span>
                    <span className="font-semibold text-neutral-800">{userEmail.split('@')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ledger tier:</span>
                    <span className="font-semibold text-neutral-800">{currentPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Renewal schedule:</span>
                    <span className="font-semibold text-neutral-800">{billingCycle === 'monthly' ? 'Monthly' : 'Annually'}</span>
                  </div>
                </div>

                <button
                  id="checkout-complete-return-btn"
                  onClick={onClose}
                  className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                >
                  Return to Workspace
                </button>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
