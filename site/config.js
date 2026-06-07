/**
 * EPMA Workspace — configuração do cliente
 *
 * Substitua STRIPE_PUBLISHABLE_KEY pelo valor real antes de fazer deploy.
 * NUNCA coloque a secret key aqui — ela pertence apenas ao servidor.
 *
 * Exemplo de chave de teste:  pk_test_51...
 * Exemplo de chave live:      pk_live_51...
 */
window.EPMA_CONFIG = {
  stripe: {
    publishableKey: 'pk_test_STRIPE_PUBLISHABLE_KEY', // ← substitua aqui
  },

  /**
   * Price IDs dos planos criados no Stripe Dashboard.
   * Crie os produtos em: dashboard.stripe.com/products
   * e cole os price_... correspondentes abaixo.
   */
  plans: {
    free: {
      priceId: null,         // plano gratuito — sem cobrança
      name: 'Free',
      price: 'R$0',
      interval: 'mês',
    },
    pro: {
      priceId: 'price_STRIPE_PRO_PRICE_ID',     // ← substitua
      name: 'Pro',
      price: 'R$44',
      interval: 'mês',
    },
    enterprise: {
      priceId: 'price_STRIPE_ENTERPRISE_PRICE_ID', // ← substitua
      name: 'Enterprise',
      price: 'R$99',
      interval: 'mês',
    },
  },
};
