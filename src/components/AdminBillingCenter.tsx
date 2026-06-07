/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Building2,
  TrendingUp,
  Sliders,
  DollarSign,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Smartphone,
  Sparkles,
  Layers,
  Calendar,
  ArrowLeft,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'active' | 'trialing' | 'unpaid' | 'suspended';
  seats: number;
  pricePerSeat: number;
  joinedDate: string;
  country?: 'BR' | 'UK' | 'CH' | 'US';
  cnpj?: string;
}

interface Transaction {
  id: string;
  tenantName: string;
  amount: number;
  method: 'Stripe' | 'Google Pay' | 'Apple Pay';
  status: 'successful' | 'failed' | 'refunded';
  date: string;
  tier: string;
  currency?: string;
}

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  status: 'active' | 'inactive';
}

interface AdminBillingCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export default function AdminBillingCenter({ isOpen, onClose, currentUserEmail }: AdminBillingCenterProps) {
  // Infer user role
  const isSuperAdmin = currentUserEmail.toLowerCase() === 'admin@epma.com';
  
  // Tab control: 'my-tenant' for everyone, 'all-tenants' & 'transactions' restricted to superadmin by default
  const [activeTab, setActiveTab ] = useState<'my-tenant' | 'all-tenants' | 'transactions' | 'coupons'>(
    isSuperAdmin ? 'all-tenants' : 'my-tenant'
  );

  // Dynamic business regional configuration (Brazil BRL R$ + CNPJ, UK GBP £, CH CHF, Rest of World USD $)
  const [billingCountry, setBillingCountryState] = useState<'BR' | 'UK' | 'CH' | 'US'>(() => {
    return (localStorage.getItem('epma_billing_country') as any) || 'US';
  });
  const [cnpj, setCnpjState] = useState(() => {
    return localStorage.getItem('epma_cnpj') || '';
  });

  // Business multi-currency pricing matrix
  // BR paga em BRL (R$). UK em GBP (£). Suiça em CHF (CHF). Resto em USD ($)
  const pricingMatrix = {
    BR: { Pro: 40, Enterprise: 120, Free: 0, Symbol: 'R$', currency: 'BRL', name: 'Brasil' },
    UK: { Pro: 7, Enterprise: 20, Free: 0, Symbol: '£', currency: 'GBP', name: 'United Kingdom' },
    CH: { Pro: 8, Enterprise: 24, Free: 0, Symbol: 'CHF', currency: 'CHF', name: 'Switzerland' },
    US: { Pro: 8, Enterprise: 24, Free: 0, Symbol: '$', currency: 'USD', name: 'Rest of World' }
  };

  const getCurrencySymbolByCountry = (code?: 'BR' | 'UK' | 'CH' | 'US') => {
    if (code === 'BR') return 'R$';
    if (code === 'UK') return '£';
    if (code === 'CH') return 'CHF';
    return '$';
  };

  // Live Sync with local storage
  useEffect(() => {
    if (isOpen) {
      setBillingCountryState((localStorage.getItem('epma_billing_country') as any) || 'US');
      setCnpjState(localStorage.getItem('epma_cnpj') || '');
    }
  }, [isOpen]);

  // Derive tenant info from client's email
  const userDomain = currentUserEmail.includes('@') ? currentUserEmail.split('@')[1] : 'epma.com';
  const inferredTenantName = userDomain.split('.')[0].toUpperCase() + ' Corp';

  // State for mock database of tenants
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('epma_tenants_db');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'EPMA Global', domain: 'epma.com', plan: 'Enterprise', status: 'active', seats: 45, pricePerSeat: 15, joinedDate: '2025-01-12', country: 'US' },
      { id: '2', name: 'Acme Laboratories', domain: 'acme.com', plan: 'Pro', status: 'active', seats: 12, pricePerSeat: 7, joinedDate: '2025-03-04', country: 'UK' },
      { id: '3', name: 'Stark Industries', domain: 'stark.org', plan: 'Enterprise', status: 'active', seats: 250, pricePerSeat: 24, joinedDate: '2025-02-28', country: 'CH' },
      { id: '4', name: 'Wayne Enterprises', domain: 'wayne.co', plan: 'Enterprise', status: 'unpaid', seats: 80, pricePerSeat: 120, joinedDate: '2025-05-19', country: 'BR', cnpj: '11.222.333/0001-99' },
      { id: '5', name: 'Initech Solutions', domain: 'initech.io', plan: 'Free', status: 'trialing', seats: 3, pricePerSeat: 0, joinedDate: '2026-06-01', country: 'US' },
      { id: '6', name: 'Umbrella Corporation', domain: 'umbrella.net', plan: 'Pro', status: 'suspended', seats: 18, pricePerSeat: 40, joinedDate: '2025-09-15', country: 'BR', cnpj: '06.666.666/0001-13' }
    ];
  });

  // Keep track of current user's self-serve tenant state
  const [myTenantSeats, setMyTenantSeats] = useState<number>(() => {
    return Number(localStorage.getItem(`epma_tenant_seats_${userDomain}`)) || 10;
  });
  
  const [myTenantPlan, setMyTenantPlan] = useState<'Free' | 'Pro' | 'Enterprise'>(() => {
    return (localStorage.getItem('epma_billing_tier') as any) || 'Free';
  });

  // State for mock transaction logs
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('epma_transactions_db');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'TX-10029', tenantName: 'EPMA Global', amount: 675, method: 'Stripe', status: 'successful', date: '2026-06-01', tier: 'Enterprise', currency: 'USD' },
      { id: 'TX-10028', tenantName: 'Acme Laboratories', amount: 84, method: 'Stripe', status: 'successful', date: '2026-05-28', tier: 'Pro', currency: 'GBP' },
      { id: 'TX-10027', tenantName: 'Wayne Enterprises', amount: 9600, method: 'Apple Pay', status: 'successful', date: '2026-05-19', tier: 'Enterprise', currency: 'BRL' },
      { id: 'TX-10026', tenantName: 'Stark Industries', amount: 6000, method: 'Google Pay', status: 'successful', date: '2026-05-15', tier: 'Enterprise', currency: 'CHF' },
      { id: 'TX-10025', tenantName: 'Acme Laboratories', amount: 84, method: 'Stripe', status: 'successful', date: '2026-04-28', tier: 'Pro', currency: 'GBP' }
    ];
  });

  // State for mock coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('epma_coupons_db');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'C-1', code: 'EPMA10', type: 'percentage', value: 10, maxUses: 500, usedCount: 23, expiryDate: '2026-12-31', status: 'active' },
      { id: 'C-2', code: 'SUPERDEAL', type: 'percentage', value: 50, maxUses: 100, usedCount: 8, expiryDate: '2026-08-30', status: 'active' },
      { id: 'C-3', code: 'STARTUP2026', type: 'fixed', value: 100, maxUses: 50, usedCount: 15, expiryDate: '2027-01-01', status: 'active' }
    ];
  });

  // Sync state to local storage when updated
  useEffect(() => {
    localStorage.setItem('epma_tenants_db', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('epma_transactions_db', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('epma_coupons_db', JSON.stringify(coupons));
  }, [coupons]);

  // Client applied coupon states
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Coupon Creation Form states
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMaxUses, setNewCouponMaxUses] = useState<number>(100);
  const [newCouponExpiryDate, setNewCouponExpiryDate] = useState('2026-12-31');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!appliedCouponCode.trim()) return;
    
    const codeUpper = appliedCouponCode.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === codeUpper);
    
    if (!found) {
      setCouponError('Cupom inválido ou não encontrado.');
      setAppliedCoupon(null);
      return;
    }
    
    if (found.status !== 'active') {
      setCouponError('Este cupom está inativo no momento.');
      setAppliedCoupon(null);
      return;
    }
    
    if (found.usedCount >= found.maxUses) {
      setCouponError('Este cupom já atingiu o limite de usos.');
      setAppliedCoupon(null);
      return;
    }
    
    if (found.expiryDate) {
      const expiry = new Date(found.expiryDate);
      const now = new Date();
      if (expiry < now) {
        setCouponError('Este cupom está expirado.');
        setAppliedCoupon(null);
        return;
      }
    }
    
    // Success!
    setAppliedCoupon(found);
    const symbol = pricingMatrix[billingCountry].Symbol;
    const discountText = found.type === 'percentage' ? `${found.value}%` : `${symbol}${found.value}.00`;
    setCouponSuccess(`Cupom "${found.code}" aplicado! Desconto de ${discountText}.`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    
    const codeUpper = newCouponCode.trim().toUpperCase();
    
    // Check if code already exists
    if (coupons.some(c => c.code.toUpperCase() === codeUpper)) {
      alert('Já existe um cupom com esse código!');
      return;
    }
    
    const added: Coupon = {
      id: 'C-' + Math.floor(Math.random() * 9000 + 1000),
      code: codeUpper,
      type: newCouponType,
      value: Number(newCouponValue),
      maxUses: Number(newCouponMaxUses),
      usedCount: 0,
      expiryDate: newCouponExpiryDate,
      status: 'active'
    };
    
    setCoupons([added, ...coupons]);
    setNewCouponCode('');
    alert(`Cupom "${codeUpper}" criado com sucesso!`);
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    if (appliedCoupon && appliedCoupon.id === id) {
      setAppliedCoupon(null);
      setAppliedCouponCode('');
      setCouponSuccess('');
    }
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(coupons.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'active' ? 'inactive' : 'active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  // Handle adding a new tenant manually (Superadmin utility)
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Pro');
  const [newTenantSeats, setNewTenantSeats] = useState(5);
  const [newTenantCountry, setNewTenantCountry] = useState<'BR' | 'UK' | 'CH' | 'US'>('US');
  const [newTenantCnpj, setNewTenantCnpj] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantDomain) return;

    // Get price seat matching country
    const matchedRate = newTenantPlan === 'Enterprise' 
      ? pricingMatrix[newTenantCountry].Enterprise 
      : newTenantPlan === 'Pro' 
        ? pricingMatrix[newTenantCountry].Pro 
        : 0;

    const added: Tenant = {
      id: 'T-' + Math.floor(Math.random() * 9000 + 1000),
      name: newTenantName,
      domain: newTenantDomain.toLowerCase(),
      plan: newTenantPlan,
      status: 'active',
      seats: newTenantSeats,
      pricePerSeat: matchedRate,
      joinedDate: new Date().toISOString().split('T')[0],
      country: newTenantCountry,
      cnpj: newTenantCountry === 'BR' ? newTenantCnpj : undefined
    };

    setTenants([added, ...tenants]);
    
    // Log initial simulated transaction if not Free
    if (newTenantPlan !== 'Free') {
      const tx: Transaction = {
        id: 'TX-' + Math.floor(Math.random() * 90000 + 10000),
        tenantName: newTenantName,
        amount: added.seats * matchedRate,
        method: 'Stripe',
        status: 'successful',
        date: added.joinedDate,
        tier: newTenantPlan,
        currency: pricingMatrix[newTenantCountry].currency
      };
      setTransactions([tx, ...transactions]);
    }

    setNewTenantName('');
    setNewTenantDomain('');
    setNewTenantCnpj('');
  };

  // Modify tenant parameters safely
  const handleUpdateTenantPlan = (id: string, nextPlan: 'Free' | 'Pro' | 'Enterprise') => {
    setTenants(tenants.map(t => {
      if (t.id === id) {
        const countryCode = t.country || 'US';
        const unitPrice = nextPlan === 'Enterprise' 
          ? pricingMatrix[countryCode].Enterprise 
          : nextPlan === 'Pro' 
            ? pricingMatrix[countryCode].Pro 
            : 0;
        return { ...t, plan: nextPlan, pricePerSeat: unitPrice };
      }
      return t;
    }));
  };

  const handleUpdateTenantStatus = (id: string, nextStatus: 'active' | 'trialing' | 'unpaid' | 'suspended') => {
    setTenants(tenants.map(t => {
      if (t.id === id) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleDeleteTenant = (id: string) => {
    setTenants(tenants.filter(t => t.id !== id));
  };

  // Synchronize client changes to simulated database state as well
  const handleClientUpgrade = (tier: 'Free' | 'Pro' | 'Enterprise') => {
    setMyTenantPlan(tier);
    localStorage.setItem('epma_billing_tier', tier);
    
    // Sync to tenants collection
    const existing = tenants.find(t => t.domain === userDomain);
    if (existing) {
      setTenants(tenants.map(t => {
        if (t.domain === userDomain) {
          return { ...t, plan: tier };
        }
        return t;
      }));
    } else {
      const added: Tenant = {
        id: 'T-C' + Math.floor(Math.random() * 900 + 100),
        name: inferredTenantName,
        domain: userDomain,
        plan: tier,
        status: 'active',
        seats: myTenantSeats,
        pricePerSeat: tier === 'Enterprise' ? 15 : tier === 'Pro' ? 8 : 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setTenants([added, ...tenants]);
    }

    // Trigger mock Stripe ledger activity
    const unit = tier === 'Enterprise' ? 15 : tier === 'Pro' ? 8 : 0;
    const tx: Transaction = {
      id: 'TX-' + Math.floor(Math.random() * 90000 + 10000),
      tenantName: inferredTenantName,
      amount: myTenantSeats * unit,
      method: 'Stripe',
      status: 'successful',
      date: new Date().toISOString().split('T')[0],
      tier: tier
    };
    setTransactions([tx, ...transactions]);
  };

  // Update client seat count
  const handleUpdateSeats = (count: number) => {
    setMyTenantSeats(count);
    localStorage.setItem(`epma_tenant_seats_${userDomain}`, String(count));
    
    // Sync to list
    setTenants(tenants.map(t => {
      if (t.domain === userDomain) {
        return { ...t, seats: count };
      }
      return t;
    }));
  };

  // Price and Coupon calculations
  const baseMonthlyPrice = myTenantSeats * (myTenantPlan === 'Enterprise' ? pricingMatrix[billingCountry].Enterprise : myTenantPlan === 'Pro' ? pricingMatrix[billingCountry].Pro : 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((baseMonthlyPrice * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  
  const finalMonthlyPrice = Math.max(0, baseMonthlyPrice - discountAmount);

  // Statistics calculation helpers
  const stats = {
    totalTenants: tenants.length,
    activeSubscribers: tenants.filter(t => t.status === 'active' && t.plan !== 'Free').length,
    totalMoneys: transactions.filter(t => t.status === 'successful').reduce((acc, current) => acc + current.amount, 0),
    mrr: tenants.reduce((acc, current) => {
      if (current.status === 'suspended' || current.plan === 'Free') return acc;
      return acc + (current.seats * current.pricePerSeat);
    }, 0)
  };

  // Filter computation
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(filterQuery.toLowerCase()) || t.domain.includes(filterQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || t.status === statusFilter || t.plan.toLowerCase() === statusFilter;
    return matchesSearch && matchesFilter;
  });

  if (!isOpen) return null;

  return (
    <div id="admin-billing-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm select-none">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        className="bg-white rounded-[32px] shadow-[0_30px_90px_rgba(17,17,17,0.16)] border border-black/5 text-neutral-800 max-w-6xl w-full h-[700px] flex flex-col overflow-hidden"
      >
        
        {/* HEADER BRAND BAR */}
        <div className="px-6 py-4 bg-white text-neutral-900 flex items-center justify-between border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-0.5 bg-neutral-900 rounded-full text-xs font-semibold tracking-widest text-white">
              EPMA CORE
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight flex items-center gap-2">
                Multi-Tenant Administration 
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 capitalize border border-black/5">
                  {isSuperAdmin ? 'Master admin session' : 'Client Self-service'}
                </span>
              </h2>
              <p className="text-[10px] text-neutral-500 leading-none">Registered to account: {currentUserEmail}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-white transition cursor-pointer shadow-sm"
            title="Voltar para o Workspace"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Voltar ao Workspace</span>
          </button>
        </div>

        {/* RECTO VIEW PORT LAYOUT with Tabs rail */}
        <div className="flex flex-1 overflow-hidden min-h-0 bg-neutral-50/60">
          
          {/* SIDER TAB SELECTORS */}
          <div className="w-60 bg-white border-r border-black/5 p-4 space-y-4 flex flex-col justify-between shrink-0">
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold tracking-wider text-neutral-400 px-1.5 uppercase">Navigation</span>
              
              {/* My Account client self-serve tab */}
              <button
                id="admin-tab-my-tenant"
                onClick={() => setActiveTab('my-tenant')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'my-tenant'
                    ? 'bg-neutral-100 shadow-sm border border-black/5 text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.03]'
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeTab === 'my-tenant' ? 'text-indigo-600' : 'text-neutral-400'}`} />
                <span>My Account Console</span>
              </button>

              {/* Superadmin accounts manager view (Disabled or flagged for standard domains) */}
              {isSuperAdmin && (
                <>
                    <div className="border-t border-black/5 my-2 pt-2">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-400 px-1.5 uppercase">Master admin settings</span>
                  </div>

                  <button
                    id="admin-tab-all-tenants"
                    onClick={() => setActiveTab('all-tenants')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'all-tenants'
                        ? 'bg-neutral-900 text-white'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Corporate Tenants</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-200 text-neutral-800 font-extrabold leading-none">
                      {tenants.length}
                    </span>
                  </button>

                  <button
                    id="admin-tab-transactions"
                    onClick={() => setActiveTab('transactions')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'transactions'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-150/40'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Stripe Logs</span>
                  </button>

                  <button
                    id="admin-tab-coupons"
                    onClick={() => setActiveTab('coupons')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'coupons'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-150/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4 shrink-0 text-indigo-400" />
                      <span>Gerenciar Cupons</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-200 text-neutral-800 font-extrabold leading-none">
                      {coupons.length}
                    </span>
                  </button>
                </>
              )}

              {/* Voltar para o Workspace */}
              <div className="pt-3 border-t border-neutral-200 mt-3">
                <button
                  id="admin-sidebar-back-workspace-btn"
                  onClick={onClose}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-700 hover:text-indigo-700 hover:bg-indigo-50/55 border border-neutral-200 hover:border-indigo-200/50 transition-all text-left cursor-pointer shadow-xs group"
                >
                  <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:text-indigo-500 transition-transform group-hover:-translate-x-0.5" />
                  <span>Voltar ao Workspace</span>
                </button>
              </div>

            </div>

            {/* Visual safety lock disclaimer */}
            <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                <Sliders className="w-3 h-3 text-indigo-600" />
                <span>SAML Fed Engine</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Corporate domains are separated using secure multi-tenant queries. Data separation is guaranteed.
              </p>
            </div>

          </div>

          {/* ACTIVE PANEL CONTENT WRAPPER */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto min-h-0 bg-white">
            
            <AnimatePresence mode="wait">
              
              {/* TAB 1: CLIENT SELF-SERVICE TRACKER */}
              {activeTab === 'my-tenant' && (
                <motion.div
                  key="my-tenant"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                                 {/* Account overview card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.25),transparent)]" />
                    <div className="z-10 space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-extrabold uppercase border border-emerald-500/20">
                          {myTenantPlan} Account Active
                        </span>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-extrabold border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">
                          {billingCountry === 'BR' ? '🇧🇷 Brasil BRL' : billingCountry === 'UK' ? '🇬🇧 UK GBP' : billingCountry === 'CH' ? '🇨🇭 CH CHF' : '🌎 Global USD'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black tracking-tight">{inferredTenantName}</h3>
                      <p className="text-xs text-neutral-400 leading-none">Workspace domain registry managed: <span className="font-mono text-neutral-300">{userDomain}</span></p>
                      
                      {billingCountry === 'BR' && cnpj && (
                        <p className="text-[10px] text-indigo-400 mt-2 font-mono flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                          <span>Regulado CNPJ: <strong className="font-extrabold">{cnpj}</strong></span>
                        </p>
                      )}
                    </div>

                    <div className="z-10 text-right bg-neutral-800/80 p-3.5 rounded-xl border border-neutral-700/55 min-w-40 shrink-0">
                      <p className="text-[10px] text-neutral-450 uppercase font-black tracking-wider">Total Seats Active</p>
                      <p className="text-2xl font-black mt-1 text-white">{myTenantSeats} Licenses</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {pricingMatrix[billingCountry].Symbol}{myTenantPlan === 'Enterprise' ? pricingMatrix[billingCountry].Enterprise : myTenantPlan === 'Pro' ? pricingMatrix[billingCountry].Pro : 0} per seat / month
                      </p>
                    </div>
                  </div>

                  {/* Enterprise AI Core Suite Features Section */}
                  <div className="p-6 rounded-3xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50/10 via-emerald-50/5 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 select-none pointer-events-none opacity-20">
                      <Sparkles className="w-24 h-24 text-indigo-605 text-indigo-600 animate-pulse" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-150/80 text-indigo-700 text-[9px] font-black uppercase tracking-wider border border-indigo-200/50">
                            Enterprise AI Core Support
                          </span>
                          {myTenantPlan === 'Enterprise' ? (
                            <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase animate-pulse">
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-[9px] bg-neutral-200 text-neutral-600 font-extrabold px-2 py-0.5 rounded-full uppercase">
                              Premium Upstream Lock
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-neutral-900">Enterprise Intelligent Copilot Features (Novidades)</h4>
                        <p className="text-xs text-neutral-500 max-w-2xl leading-normal">
                          Unlock federated agent execution and semantic searching across your global corporate datasets, customized exclusively for high-reliability structures.
                        </p>
                      </div>

                      {myTenantPlan !== 'Enterprise' && (
                        <button
                          onClick={() => {
                            handleClientUpgrade('Enterprise');
                            alert('Sua conta corporativa foi atualizada com sucesso para o plano Enterprise! Os novos recursos de IA já estão disponíveis.');
                          }}
                          className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition duration-150 shadow-xs cursor-pointer uppercase tracking-wide shrink-0"
                        >
                          Unlock Enterprise Suite Now
                        </button>
                      )}
                    </div>

                    {/* Enterprise bullet board */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-indigo-100/50">
                      {[
                        { title: 'AI Agents', subtitle: 'automate busywork', desc: 'Simulate background automations that manage files, emails, and repetitive database records asynchronously.', badge: 'AGENTS-2.0' },
                        { title: 'AI Meeting Notes', subtitle: 'Perfecty Written by AI', desc: 'Generate flawless, ready-to-share summaries, bulleted priorities, and explicit action items instantly with zero cognitive lag.', badge: 'FLUENT-GPT' },
                        { title: 'Enterprise search', subtitle: 'find answers instantly', desc: 'Query files, directories, databases, and sub-pages at lightning-fast speeds via natural conversational endpoints.', badge: 'SEMANTIC' },
                        { title: 'AI Workspace Recorder', subtitle: 'AI to record, transcripts and resume meetings automatically', desc: 'Plug into your audio streaming lines to convert speech to logs, highlight quotes, and summarize topics instantly.', badge: 'LIVE-REC' }
                      ].map((item, i) => (
                        <div key={i} className={`p-4 rounded-2xl border transition-all ${
                          myTenantPlan === 'Enterprise' 
                            ? 'bg-white border-indigo-150 shadow-xs hover:border-indigo-300' 
                            : 'bg-neutral-50/55 border-neutral-200 grayscale opacity-65'
                        }`}>
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[9px] font-mono text-neutral-400 font-bold bg-neutral-100 px-1.5 py-0.5 rounded">{item.badge}</span>
                            <Sparkles className={`w-3.5 h-3.5 ${myTenantPlan === 'Enterprise' ? 'text-indigo-500' : 'text-neutral-400'}`} />
                          </div>
                          <h5 className="text-xs font-extrabold text-neutral-900 mt-2.5">{item.title}</h5>
                          <p className="text-[10px] text-indigo-750 font-bold leading-normal mt-0.5">{item.subtitle}</p>
                          <p className="text-[10px] text-neutral-450 mt-2 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seat licensing management widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Interactive Seats slider linked to Stripe simulation */}
                    <div className="p-5 rounded-2xl border border-neutral-200 space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-neutral-500 uppercase tracking-wider">Seat Allocation & Licenses</h4>
                        <p className="text-xs text-neutral-450 leading-relaxed mt-0.5">Add or remove seats for team members dynamically. Invoices are prorated immediately via Stripe local currency routing.</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-neutral-600">License seats:</span>
                          <span className="font-black text-neutral-950 px-2.5 py-0.5 bg-neutral-100 border border-neutral-300/80 rounded-lg">{myTenantSeats} Seats</span>
                        </div>
                        <input
                          id="admin-seats-range"
                          type="range"
                          min={1}
                          max={100}
                          value={myTenantSeats}
                          onChange={(e) => handleUpdateSeats(Number(e.target.value))}
                          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                          <span>1 Seat</span>
                          <span>50 Seats</span>
                          <span>100 Seats max</span>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                        <span>Faturamento Mensal Calculado:</span>
                        <div className="text-right">
                          {discountAmount > 0 ? (
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="line-through text-neutral-400 text-xs font-normal">
                                {pricingMatrix[billingCountry].Symbol}{baseMonthlyPrice}.00
                              </span>
                              <span className="font-extrabold text-indigo-700 text-sm">
                                {pricingMatrix[billingCountry].Symbol}{finalMonthlyPrice}.00 / mo
                              </span>
                            </div>
                          ) : (
                            <span className="font-extrabold text-sm select-all">
                              {pricingMatrix[billingCountry].Symbol}{baseMonthlyPrice}.00 / mo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Coupon Application Box */}
                      <div className="pt-3 border-t border-neutral-200/60 space-y-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Cupom de Desconto</label>
                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                          <input
                            type="text"
                            value={appliedCouponCode}
                            onChange={(e) => setAppliedCouponCode(e.target.value)}
                            placeholder="Código do cupom (ex: SUPERDEAL)"
                            className="flex-1 px-3 py-1.5 bg-neutral-50 border border-neutral-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-mono select-text outline-hidden uppercase"
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition duration-150 cursor-pointer shadow-xs whitespace-nowrap uppercase tracking-wider text-[10px]"
                          >
                            Aplicar
                          </button>
                        </form>
                        {couponError && (
                          <p className="text-[10px] font-semibold text-red-650 font-sans mt-1">⚠️ {couponError}</p>
                        )}
                        {couponSuccess && (
                          <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/50 p-2 rounded-xl mt-1">
                            <p className="text-[10px] font-extrabold text-emerald-800 font-sans">🎉 {couponSuccess}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setAppliedCoupon(null);
                                setAppliedCouponCode('');
                                setCouponSuccess('');
                              }}
                              className="text-[9px] font-bold text-emerald-950 underline hover:text-emerald-700 font-sans cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Billing Plan controls */}
                    <div className="p-5 rounded-2xl border border-neutral-200 space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-neutral-500 uppercase tracking-wider">Current Tier Controls</h4>
                        <p className="text-xs text-neutral-450 leading-relaxed mt-0.5">Switch between plans to unlock higher quotas and priority AI access.</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {(['Free', 'Pro', 'Enterprise'] as const).map((t) => {
                          const isActive = myTenantPlan === t;
                          return (
                            <button
                              key={t}
                              onClick={() => handleClientUpgrade(t)}
                              className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                                isActive 
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                  : 'border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-700'
                              }`}
                            >
                              {t} Plan
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2 border-t border-neutral-150 pt-3">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Linked Wallet Credentials</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs text-neutral-700 font-mono">•••• •••• •••• 4242</span>
                          </div>
                          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Stripe Active</span>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Sample downloaded receipts / invoices tracker list for Client */}
                  <div className="p-5 rounded-2xl border border-neutral-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-neutral-500 uppercase tracking-wider">My Corporate Receipts / Notas Fiscais</h4>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Fully Paid
                      </span>
                    </div>

                    <div className="divide-y divide-neutral-100">
                      {[
                        { id: 'REC-09881', date: '2026-06-01', amount: myTenantSeats * (myTenantPlan === 'Enterprise' ? pricingMatrix[billingCountry].Enterprise : myTenantPlan === 'Pro' ? pricingMatrix[billingCountry].Pro : 0), desc: 'Monthly subscription licensing' },
                        { id: 'REC-09148', date: '2026-05-01', amount: (myTenantPlan === 'Enterprise' ? pricingMatrix[billingCountry].Enterprise : myTenantPlan === 'Pro' ? pricingMatrix[billingCountry].Pro : 0) * 5, desc: 'Prorated license seats increment' },
                        { id: 'REC-08221', date: '2026-04-01', amount: (myTenantPlan === 'Enterprise' ? pricingMatrix[billingCountry].Enterprise : myTenantPlan === 'Pro' ? pricingMatrix[billingCountry].Pro : 0) * 2, desc: 'Initial Workspace onboarding seats' }
                      ].map((rec) => (
                        <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-neutral-800">{rec.id}</span>
                              <span className="text-neutral-400 font-mono text-[10px]">{rec.date}</span>
                            </div>
                            <p className="text-[10px] text-neutral-450 mt-0.5">{rec.desc}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-neutral-900">{pricingMatrix[billingCountry].Symbol}{rec.amount}.00</span>
                            <button
                              onClick={() => {
                                alert(`Downloading simulated invoice ${rec.id} in PDF format. This triggers native file attachments in real production instances.`);
                              }}
                              className="p-1.5 rounded bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
                              title="Download Receipt PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </motion.div>
              )}

              {/* TAB 2: SUPERADMIN ALL CORPORATE TENANTS LIST */}
              {activeTab === 'all-tenants' && isSuperAdmin && (
                <motion.div
                  key="all-tenants"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  
                  {/* Global performance KPIs widgets board */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl relative">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Active Corporations</p>
                      <p className="text-2xl font-black text-neutral-900 mt-1">{stats.totalTenants}</p>
                      <div className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3.5 h-3.5" /> <span>+2 this week</span>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Live Subscribers</p>
                      <p className="text-2xl font-black text-neutral-900 mt-1">{stats.activeSubscribers}</p>
                      <p className="text-[9px] text-neutral-400 mt-1.5">Free tiers excluded</p>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">MRR Prediction</p>
                      <p className="text-2xl font-black text-indigo-700 mt-1">${stats.mrr}</p>
                      <p className="text-[9px] text-neutral-400 mt-1.5">Monthly seat aggregates</p>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Simulated Inflow</p>
                      <p className="text-2xl font-black text-neutral-900 mt-1">${stats.totalMoneys}</p>
                      <p className="text-[9px] text-neutral-400 mt-1.5">Historical successful logs</p>
                    </div>

                  </div>

                  {/* Add New Tenant Drawer Collapsible */}
                  <div className="p-5 border border-neutral-200 rounded-3xl space-y-4">
                    <h4 className="text-xs font-black text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      Provision New Independent Tenant / Novo Cliente
                    </h4>

                    <form onSubmit={handleAddTenant} className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-150 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase">Corp Name</label>
                          <input
                            type="text"
                            required
                            value={newTenantName}
                            onChange={(e) => setNewTenantName(e.target.value)}
                            placeholder="Globex Inc"
                            className="w-full px-3 py-1.5 bg-white border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase">Domain key</label>
                          <input
                            type="text"
                            required
                            value={newTenantDomain}
                            onChange={(e) => setNewTenantDomain(e.target.value)}
                            placeholder="globex.jp"
                            className="w-full px-3 py-1.5 bg-white border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase">Seats / Licenses</label>
                          <input
                            type="number"
                            min={1}
                            value={newTenantSeats}
                            onChange={(e) => setNewTenantSeats(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase">Tier Plan</label>
                          <select
                            value={newTenantPlan}
                            onChange={(e) => setNewTenantPlan(e.target.value as any)}
                            className="w-full px-3 py-1.5 bg-white border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800 outline-hidden"
                          >
                            <option value="Free">Free</option>
                            <option value="Pro">Pro</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2 border-t border-neutral-200/60">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase">Billing Country / Coin</label>
                          <select
                            value={newTenantCountry}
                            onChange={(e) => setNewTenantCountry(e.target.value as any)}
                            className="w-full px-3 py-1.5 bg-white border border-neutral-250 focus:border-neutral-800 rounded-xl text-xs text-neutral-800 outline-hidden font-medium"
                          >
                            <option value="US">🇺🇸 United States (USD $)</option>
                            <option value="BR">🇧🇷 Brasil (BRL R$ - CNPJ Req)</option>
                            <option value="UK">🇬🇧 United Kingdom (GBP £)</option>
                            <option value="CH">🇨🇭 Switzerland (CHF)</option>
                          </select>
                        </div>

                        {newTenantCountry === 'BR' ? (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-indigo-650 uppercase">CNPJ Requerido (Brasil)</label>
                            <input
                              type="text"
                              required
                              value={newTenantCnpj}
                              onChange={(e) => {
                                // Simple CNPJ formatting mock
                                const raw = e.target.value.replace(/\D/g, '');
                                let fmt = raw;
                                if (raw.length > 2) fmt = raw.slice(0, 2) + '.' + raw.slice(2);
                                if (raw.length > 5) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 5) + '.' + raw.slice(5);
                                if (raw.length > 8) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 5) + '.' + raw.slice(5, 8) + '/' + raw.slice(8);
                                if (raw.length > 12) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 5) + '.' + raw.slice(5, 8) + '/' + raw.slice(8, 12) + '-' + raw.slice(12, 14);
                                setNewTenantCnpj(fmt);
                              }}
                              placeholder="00.000.000/0001-00"
                              className="w-full px-3 py-1.5 bg-white border border-indigo-200 focus:border-indigo-600 rounded-xl text-xs font-mono font-bold text-neutral-850"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1 self-center pb-2">
                            <span className="text-[10px] text-neutral-405 font-bold uppercase block">Regional Specs</span>
                            <span className="text-[11px] text-neutral-450 font-medium leading-none">No custom local tax code required.</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="py-2 bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer tracking-wide uppercase transition flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Provision Workspace
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Search and Filters for corporate list */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-450" />
                      <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Search tenants or domains..."
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-neutral-800 rounded-xl text-xs text-neutral-800 outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                      <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      {[
                        { key: 'all', label: 'All Rows' },
                        { key: 'active', label: 'Active status' },
                        { key: 'suspended', label: 'Suspended' },
                        { key: 'pro', label: 'Pro Tiers' },
                        { key: 'enterprise', label: 'Enterprise Tiers' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setStatusFilter(item.key)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition cursor-pointer ${
                            statusFilter === item.key
                              ? 'bg-neutral-100 border border-neutral-300 text-neutral-900'
                              : 'text-neutral-500 hover:text-neutral-900 bg-neutral-50 border border-neutral-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid / Table of Tenants */}
                  <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-450 font-bold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                          <th className="p-3">Corporate Account</th>
                          <th className="p-3">Domain</th>
                          <th className="p-3">Licensed Seats</th>
                          <th className="p-3">Scale Plan</th>
                          <th className="p-3">SAML Link Status</th>
                          <th className="p-3 text-right">Ledger actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {filteredTenants.map((tenant) => (
                          <tr key={tenant.id} className="hover:bg-neutral-50/50 transition duration-150">
                            
                            {/* Partner company name details */}
                            <td className="p-3">
                              <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                <span>{tenant.name}</span>
                                {tenant.country && (
                                  <span className="text-[10px] px-1 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-500 rounded font-normal font-mono leading-none">
                                    {tenant.country === 'BR' ? '🇧🇷 BR' : tenant.country === 'UK' ? '🇬🇧 UK' : tenant.country === 'CH' ? '🇨🇭 CH' : '🇺🇸 US'}
                                  </span>
                                )}
                              </div>
                              {tenant.country === 'BR' && tenant.cnpj && (
                                <p className="text-[9px] text-indigo-600 font-mono font-bold mt-0.5">CNPJ: {tenant.cnpj}</p>
                              )}
                            </td>

                            {/* Registered federation domain */}
                            <td className="p-3 font-mono text-neutral-500 text-[11px]">
                              {tenant.domain}
                            </td>

                            {/* Total employee seats linked */}
                            <td className="p-3">
                              <span className="font-semibold text-neutral-700">{tenant.seats} seats</span>
                              <p className="text-[9px] text-neutral-405 font-medium mt-0.5">
                                {getCurrencySymbolByCountry(tenant.country as any)}{tenant.pricePerSeat}/mo rate
                              </p>
                            </td>

                            {/* Sub plan selector inline */}
                            <td className="p-3">
                              <select
                                value={tenant.plan}
                                onChange={(e) => handleUpdateTenantPlan(tenant.id, e.target.value as any)}
                                className="bg-neutral-100 hover:bg-neutral-150 border border-neutral-250 rounded-lg text-[11px] font-extrabold p-1 text-neutral-800 transition"
                              >
                                <option value="Free">Free</option>
                                <option value="Pro">Pro</option>
                                <option value="Enterprise">Enterprise</option>
                              </select>
                            </td>

                            {/* Account lock, suspension or federation status tag */}
                            <td className="p-3">
                              <select
                                value={tenant.status}
                                onChange={(e) => handleUpdateTenantStatus(tenant.id, e.target.value as any)}
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${
                                  tenant.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : tenant.status === 'trialing'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                                    : tenant.status === 'unpaid'
                                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                                    : 'bg-red-50 text-red-700 border-red-300'
                                }`}
                              >
                                <option value="active">Active</option>
                                <option value="trialing">Trialing</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            </td>

                            {/* Remove button */}
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteTenant(tenant.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-650 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                title="Delete Tenant account Workspace"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>

                          </tr>
                        ))}

                        {filteredTenants.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-neutral-400 text-xs">
                              No active client tenants match search filters. Check typos.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </motion.div>
              )}

              {/* TAB 3: TRANSACTION AGGREGATE LEDGER (Stripe Sandbox Logs) */}
              {activeTab === 'transactions' && isSuperAdmin && (
                <motion.div
                  key="transactions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">Unified Stripe Transaction Logs</h3>
                    <p className="text-xs text-neutral-400">Live feed of Stripe webhooks, Apple Pay, and Google Pay billing integrations.</p>
                  </div>

                  {/* Transaction log rows */}
                  <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-450 font-bold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                          <th className="p-3">Reference ID</th>
                          <th className="p-3">Tenant Client</th>
                          <th className="p-3">Plan Triggered</th>
                          <th className="p-3">Method used</th>
                          <th className="p-3">Log Date</th>
                          <th className="p-3">Charge Price</th>
                          <th className="p-3 text-right">Stripe Callback Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-neutral-50/40 transition">
                            
                            <td className="p-3 font-mono font-bold text-neutral-900">
                              {tx.id}
                            </td>

                            <td className="p-3 text-neutral-700">
                              {tx.tenantName}
                            </td>

                            <td className="p-3">
                              <span className="font-semibold text-neutral-800">{tx.tier} Package</span>
                            </td>

                            <td className="p-3">
                              <span className="inline-flex items-center gap-1.5 p-1 bg-neutral-100 rounded-md text-[11px] font-mono font-semibold text-neutral-600">
                                {tx.method === 'Stripe' ? <CreditCard className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                                {tx.method}
                              </span>
                            </td>

                            <td className="p-3 text-neutral-450 font-mono">
                              {tx.date}
                            </td>

                            <td className="p-3 font-mono font-bold text-neutral-900 text-sm">
                              {tx.currency === 'BRL' ? 'R$' : tx.currency === 'GBP' ? '£' : tx.currency === 'CHF' ? 'CHF ' : '$'}{tx.amount}.00
                            </td>

                            <td className="p-3 text-right">
                              <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                tx.status === 'successful'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                  : 'bg-red-50 text-red-750 border border-red-250'
                              }`}>
                                {tx.status === 'successful' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {tx.status}
                              </span>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </motion.div>
              )}

              {/* TAB 4: COUPON MANAGEMENT DASHBOARD */}
              {activeTab === 'coupons' && isSuperAdmin && (
                <motion.div
                  key="coupons"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">Gerenciador Geral de Cupons</h3>
                    <p className="text-xs text-neutral-450">Crie, ative ou inative cupons de desconto corporativos para os tenants realizarem upgrades.</p>
                  </div>

                  {/* Create New Coupon Form */}
                  <div className="p-5 border border-neutral-200 rounded-3xl space-y-4 bg-neutral-50/20">
                    <h4 className="text-xs font-black text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      Criar Novo Cupom de Desconto
                    </h4>

                    <form onSubmit={handleCreateCoupon} className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block">Código do Cupom</label>
                          <input
                            type="text"
                            required
                            value={newCouponCode}
                            onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                            placeholder="Ex: SPECIAL30"
                            className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs text-neutral-850 font-mono font-bold uppercase"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block">Tipo de Desconto</label>
                          <select
                            value={newCouponType}
                            onChange={(e) => setNewCouponType(e.target.value as any)}
                            className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs text-neutral-800 outline-hidden font-medium"
                          >
                            <option value="percentage">Porcentagem (%)</option>
                            <option value="fixed">Valor Fixo ($)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block">Valor do Desconto</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={newCouponValue}
                            onChange={(e) => setNewCouponValue(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs text-neutral-850 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block">Limite de Usos Clientes</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={newCouponMaxUses}
                            onChange={(e) => setNewCouponMaxUses(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs text-neutral-800"
                          />
                        </div>

                        <div className="space-y-1 animate-fadeIn">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block">Data de Expiração</label>
                          <input
                            type="date"
                            required
                            value={newCouponExpiryDate}
                            onChange={(e) => setNewCouponExpiryDate(e.target.value)}
                            className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs text-neutral-800"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-neutral-200/50">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer tracking-wide uppercase transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Salvar e Publicar Cupom
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Coupons List Table */}
                  <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-450 font-bold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                          <th className="p-3">Código</th>
                          <th className="p-3">Tipo</th>
                          <th className="p-3">Desconto</th>
                          <th className="p-3">Uso / Limite</th>
                          <th className="p-3">Expiração</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {coupons.map((coupon) => {
                          const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                          return (
                            <tr key={coupon.id} className="hover:bg-neutral-50/40 transition">
                              
                              <td className="p-3 font-mono font-bold text-neutral-900 text-sm tracking-wide">
                                <div className="flex items-center gap-2">
                                  <Tag className="w-3.5 h-3.5 text-indigo-505 text-indigo-500 shrink-0" />
                                  <span>{coupon.code}</span>
                                </div>
                              </td>

                              <td className="p-3 text-neutral-600 font-medium font-sans">
                                {coupon.type === 'percentage' ? 'Porcentagem (%)' : 'Valor Fixo'}
                              </td>

                              <td className="p-3 font-mono font-bold text-neutral-900 text-sm">
                                {coupon.type === 'percentage' ? `${coupon.value}%` : `${pricingMatrix[billingCountry].Symbol}${coupon.value}.00`}
                              </td>

                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-neutral-700">{coupon.usedCount}</span>
                                  <span className="text-neutral-400">/</span>
                                  <span className="text-neutral-505 text-neutral-500">{coupon.maxUses} usos</span>
                                </div>
                                <div className="w-24 bg-neutral-100 rounded-full h-1 mt-1 overflow-hidden">
                                  <div 
                                    className="bg-indigo-600 h-1 rounded-full animate-all duration-300" 
                                    style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                                  />
                                </div>
                              </td>

                              <td className="p-3 font-mono text-neutral-500">
                                <span className={isExpired ? 'text-red-500 font-bold' : ''}>
                                  {coupon.expiryDate} {isExpired && '(Expirado)'}
                                </span>
                              </td>

                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => toggleCouponStatus(coupon.id)}
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border transition-all cursor-pointer uppercase ${
                                    coupon.status === 'active' && !isExpired
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
                                  }`}
                                >
                                  {coupon.status === 'active' && !isExpired ? 'Ativo' : 'Inativo'}
                                </button>
                              </td>

                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="p-1.5 text-neutral-400 hover:text-red-650 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                  title="Excluir Cupom"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>

                            </tr>
                          );
                        })}

                        {coupons.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-neutral-400 text-xs">
                              Nenhum cupom de desconto configurado. Crie um acima!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

      </motion.div>

    </div>
  );
}
