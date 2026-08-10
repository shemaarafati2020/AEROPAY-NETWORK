export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  draftAction?: {
    type: 'transfer_proposal' | 'support_ticket' | 'screen_navigation' | 'vault_deposit';
    title: string;
    params: {
      recipientName?: string;
      recipientPhone?: string;
      amountUsd?: number;
      currency?: string;
      refId?: string;
      targetScreen?: string;
      vaultName?: string;
      vaultId?: string;
    };
  };
  toolsUsed?: string[];
  detectedLanguage?: 'en' | 'rw' | 'sw' | 'fr';
}

export interface AssistantContextSnapshot {
  userBalanceUsd: number;
  kycTier: string;
  recentTxCount: number;
  exchangeRateUsdToKes: number;
  exchangeRateUsdToRwf: number;
}

export interface ProactiveSuggestion {
  id: string;
  label: string;
  actionPrompt: string;
  category: 'transfer' | 'fx' | 'support' | 'analytics';
}

export interface IntentClassificationResult {
  intent:
    | 'STATUS_CHECK'
    | 'FX_RATES'
    | 'DRAFT_TRANSFER'
    | 'VAULT_ACTION'
    | 'DISPUTE_FRAUD'
    | 'PROACTIVE_SUGGESTION'
    | 'GENERAL_HELP';
  confidence: number;
  detectedLanguage: 'en' | 'rw' | 'sw' | 'fr';
}

export const INITIAL_CONTEXT: AssistantContextSnapshot = {
  userBalanceUsd: 1450.75,
  kycTier: 'Tier 2 (Verified)',
  recentTxCount: 14,
  exchangeRateUsdToKes: 129.5,
  exchangeRateUsdToRwf: 1420.0,
};

/**
 * Returns contextual proactive quick suggestions based on live financial status
 */
export function getProactiveSuggestions(
  context: AssistantContextSnapshot = INITIAL_CONTEXT
): ProactiveSuggestion[] {
  return [
    {
      id: 'sug-send-mum',
      label: '💸 Send $50 to Eric Mugisha (MTN MoMo)',
      actionPrompt: 'Send $50 to Eric Mugisha in Kigali Rwanda',
      category: 'transfer',
    },
    {
      id: 'sug-savings-boost',
      label: '🛡️ Deposit $25 to Emergency Fund Vault',
      actionPrompt: 'Deposit $25 to my Emergency Fund vault',
      category: 'analytics',
    },
    {
      id: 'sug-fx-check',
      label: `📈 Check live RWF & KES rates ($1 = ${context.exchangeRateUsdToRwf.toLocaleString()} RWF)`,
      actionPrompt: 'What are the current exchange rates and fees today?',
      category: 'fx',
    },
    {
      id: 'sug-tx-status',
      label: '🔍 Where is my recent transfer AP-8F2K?',
      actionPrompt: 'Where is my recent transfer status AP-8F2K?',
      category: 'support',
    },
  ];
}

/**
 * Natural language intent classifier with support for East African multilingual vocabularies:
 * English, Kinyarwanda (amafaranga, oherereza, bika), Swahili (tuma pesa, salio, akiba), and French (envoyer, solde, coffre).
 */
export function classifyUserIntent(query: string): IntentClassificationResult {
  const queryLower = query.toLowerCase().trim();

  // Detect Language
  let detectedLanguage: 'en' | 'rw' | 'sw' | 'fr' = 'en';
  if (
    queryLower.includes('amafaranga') ||
    queryLower.includes('oherereza') ||
    queryLower.includes('kigali') ||
    queryLower.includes('kwishyura') ||
    queryLower.includes('bika') ||
    queryLower.includes('ubufasha')
  ) {
    detectedLanguage = 'rw';
  } else if (
    queryLower.includes('tuma') ||
    queryLower.includes('salio') ||
    queryLower.includes('pesa') ||
    queryLower.includes('shilingi') ||
    queryLower.includes('akiba') ||
    queryLower.includes('weka') ||
    queryLower.includes('msaada')
  ) {
    detectedLanguage = 'sw';
  } else if (
    queryLower.includes('envoyer') ||
    queryLower.includes('taux') ||
    queryLower.includes('solde') ||
    queryLower.includes('argent') ||
    queryLower.includes('coffre') ||
    queryLower.includes('epargne') ||
    queryLower.includes('aide')
  ) {
    detectedLanguage = 'fr';
  }

  // 1. Dispute / Security
  if (
    queryLower.includes('unauthorized') ||
    queryLower.includes('fraud') ||
    queryLower.includes('stolen') ||
    queryLower.includes('unknown') ||
    queryLower.includes('vol') ||
    queryLower.includes('wizi')
  ) {
    return { intent: 'DISPUTE_FRAUD', confidence: 0.95, detectedLanguage };
  }

  // 2. Vault / Savings Intent
  if (
    queryLower.includes('vault') ||
    queryLower.includes('saving') ||
    queryLower.includes('emergency') ||
    queryLower.includes('roundup') ||
    queryLower.includes('round-up') ||
    queryLower.includes('bika') ||
    queryLower.includes('akiba') ||
    queryLower.includes('coffre') ||
    queryLower.includes('epargne')
  ) {
    return { intent: 'VAULT_ACTION', confidence: 0.92, detectedLanguage };
  }

  // 3. Draft Transfer Intent
  if (
    queryLower.includes('send') ||
    queryLower.includes('transfer') ||
    queryLower.includes('pay') ||
    queryLower.includes('remit') ||
    queryLower.includes('oherereza') ||
    queryLower.includes('tuma') ||
    queryLower.includes('envoyer')
  ) {
    return { intent: 'DRAFT_TRANSFER', confidence: 0.9, detectedLanguage };
  }

  // 4. Status Check / Query
  if (
    queryLower.includes('status') ||
    queryLower.includes('where is') ||
    queryLower.includes("where's") ||
    queryLower.includes('recent') ||
    queryLower.includes('stuck') ||
    queryLower.includes('delay') ||
    queryLower.includes('igihe') ||
    queryLower.includes('wapi')
  ) {
    return { intent: 'STATUS_CHECK', confidence: 0.88, detectedLanguage };
  }

  // 5. FX Rates / Fee Explainer
  if (
    queryLower.includes('fee') ||
    queryLower.includes('rate') ||
    queryLower.includes('cost') ||
    queryLower.includes('spread') ||
    queryLower.includes('igiciro') ||
    queryLower.includes('kiwango') ||
    queryLower.includes('taux')
  ) {
    return { intent: 'FX_RATES', confidence: 0.85, detectedLanguage };
  }

  return { intent: 'GENERAL_HELP', confidence: 0.6, detectedLanguage };
}

export function processAssistantQuery(
  userQuery: string,
  _history: AssistantMessage[] = []
): AssistantMessage {
  const { intent, detectedLanguage } = classifyUserIntent(userQuery);
  const queryLower = userQuery.toLowerCase();
  const timestamp = Date.now();

  // 1. Transaction Status Lookup
  if (intent === 'STATUS_CHECK') {
    if (
      queryLower.includes('failed') ||
      queryLower.includes('stuck') ||
      queryLower.includes('delay')
    ) {
      return {
        id: 'msg-' + timestamp,
        sender: 'assistant',
        text: 'I checked your recent transactions. Transfer AP-8F2K ($50 to Mary N.) experienced a temporary Mobile Network delay during cash injection. The auto-reversal timer is active and funds will return to your balance within 45 seconds if unresolved.',
        timestamp,
        toolsUsed: ['get_transaction_status', 'get_fee_breakdown'],
        detectedLanguage,
        draftAction: {
          type: 'support_ticket',
          title: 'Priority Escalation: Transfer AP-8F2K',
          params: {
            refId: 'AP-8F2K',
          },
        },
      };
    }

    return {
      id: 'msg-' + timestamp,
      sender: 'assistant',
      text: `Your current balance is $${INITIAL_CONTEXT.userBalanceUsd.toFixed(2)} USDC. Your last send of $50 to Eric Mugisha (Ref AP-9921) was successfully delivered via MTN Mobile Money.`,
      timestamp,
      detectedLanguage,
      toolsUsed: ['get_balance', 'list_recent_transactions'],
    };
  }

  // 2. Fee / FX Explainer
  if (intent === 'FX_RATES') {
    return {
      id: 'msg-' + timestamp,
      sender: 'assistant',
      text: `AeroPay uses institutional USDC wholesale FX rates with zero hidden markups:\n\n• 1 USDC = ${INITIAL_CONTEXT.exchangeRateUsdToKes.toFixed(2)} KES (Kenya)\n• 1 USDC = ${INITIAL_CONTEXT.exchangeRateUsdToRwf.toLocaleString()} RWF (Rwanda)\n• AeroPay Network Fee: $0.50 flat\n• On-chain Gas: $0.00 (Covered by AeroPay Paymaster)`,
      timestamp,
      detectedLanguage,
      toolsUsed: ['get_exchange_rate', 'get_fee_breakdown'],
    };
  }

  // 3. Draft Transfer Intent ("send 50 dollars to mum / john")
  if (intent === 'DRAFT_TRANSFER') {
    const isRwanda =
      queryLower.includes('rwanda') ||
      queryLower.includes('rwf') ||
      queryLower.includes('kigali') ||
      queryLower.includes('oherereza') ||
      queryLower.includes('amafaranga');

    const recipientName = isRwanda ? 'Eric Mugisha' : 'Mary Njeri';
    const recipientPhone = isRwanda ? '+250 788 445 566' : '+254 712 345 678';
    const currency = isRwanda ? 'RWF' : 'KES';

    // Parse numeric amount if present (e.g. "$50" or "50")
    const match = userQuery.match(/\$?(\d+(\.\d+)?)/);
    const amountUsd = match ? parseFloat(match[1]) : 50;

    return {
      id: 'msg-' + timestamp,
      sender: 'assistant',
      text: `I've prepared a transfer proposal for $${amountUsd.toFixed(2)} USDC to ${recipientName} (${currency}). In accordance with AeroPay security rules, I cannot execute transfers directly. Please review the details below and authenticate with your fingerprint or PIN to proceed.`,
      timestamp,
      detectedLanguage,
      toolsUsed: ['get_exchange_rate', 'get_beneficiaries', 'draft_transfer'],
      draftAction: {
        type: 'transfer_proposal',
        title: `Confirm Transfer: $${amountUsd.toFixed(2)} to ${recipientName}`,
        params: {
          recipientName,
          recipientPhone,
          amountUsd,
          currency,
        },
      },
    };
  }

  // 4. Savings Vault Intent ("deposit 25 to emergency vault")
  if (intent === 'VAULT_ACTION') {
    const match = userQuery.match(/\$?(\d+(\.\d+)?)/);
    const amountUsd = match ? parseFloat(match[1]) : 25;
    const isEmergency = queryLower.includes('emergency') || queryLower.includes('security');
    const isRent = queryLower.includes('rent') || queryLower.includes('inzu');
    const targetVault = isEmergency
      ? 'Emergency Fund'
      : isRent
        ? 'Quarterly Rent'
        : 'General Savings';

    return {
      id: 'msg-' + timestamp,
      sender: 'assistant',
      text: `I've prepared a savings deposit of $${amountUsd.toFixed(2)} USDC to your "${targetVault}" vault. AeroPay vaults are inflation-hedged in USDC with auto-roundup sweeps active. Please authorize below:`,
      timestamp,
      detectedLanguage,
      toolsUsed: ['get_vault_balances', 'draft_vault_deposit'],
      draftAction: {
        type: 'vault_deposit',
        title: `Confirm Deposit: $${amountUsd.toFixed(2)} to ${targetVault}`,
        params: {
          vaultName: targetVault,
          amountUsd,
        },
      },
    };
  }

  // 5. Dispute / Fraud Alert
  if (intent === 'DISPUTE_FRAUD') {
    return {
      id: 'msg-' + timestamp,
      sender: 'assistant',
      text: '⚠️ Account Security Alert triggered. I have flagged your account for priority review and opened a security ticket (Ref SUP-2291). Would you like to temporarily lock your account card now?',
      timestamp,
      detectedLanguage,
      toolsUsed: ['lock_account_card', 'open_security_ticket'],
      draftAction: {
        type: 'support_ticket',
        title: 'Lock Card & Escalate to Security Team',
        params: {
          refId: 'SUP-2291',
        },
      },
    };
  }

  // 6. General Multilingual Fallback
  const fallbackGreeting =
    detectedLanguage === 'rw'
      ? 'Muraho! Ndi umufasha wawe muri AeroPay. Nshobora kugufasha kohereza amafaranga, kureba ibiciro bya FX, cyangwa kubika muri Vault.'
      : detectedLanguage === 'sw'
        ? 'Habari! Mimi ni msaidizi wako wa AeroPay. Naweza kukusaidia kutuma pesa, kuangalia viwango vya FX, au kuweka akiba kwenye Vaults.'
        : detectedLanguage === 'fr'
          ? "Bonjour! Je suis votre assistant AeroPay. Je peux vous aider à envoyer de l'argent, vérifier les taux de change ou gérer vos coffres d'épargne."
          : 'Hello Shema! I can assist you with tracking transfers, drafting remittance proposals, explaining FX rates, or managing your USDC savings vaults.';

  return {
    id: 'msg-' + timestamp,
    sender: 'assistant',
    text: fallbackGreeting,
    timestamp,
    detectedLanguage,
    toolsUsed: ['general_knowledge_base'],
  };
}
