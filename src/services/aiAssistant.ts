export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  draftAction?: {
    type: 'transfer_proposal' | 'support_ticket' | 'screen_navigation';
    title: string;
    params: {
      recipientName?: string;
      recipientPhone?: string;
      amountUsd?: number;
      currency?: string;
      refId?: string;
      targetScreen?: string;
    };
  };
  toolsUsed?: string[];
}

export interface AssistantContextSnapshot {
  userBalanceUsd: number;
  kycTier: string;
  recentTxCount: number;
  exchangeRateUsdToKes: number;
  exchangeRateUsdToRwf: number;
}

export const INITIAL_CONTEXT: AssistantContextSnapshot = {
  userBalanceUsd: 1450.75,
  kycTier: 'Tier 2 (Verified)',
  recentTxCount: 14,
  exchangeRateUsdToKes: 129.5,
  exchangeRateUsdToRwf: 1420.0,
};

export function processAssistantQuery(
  userQuery: string,
  _history: AssistantMessage[] = []
): AssistantMessage {
  const queryLower = userQuery.toLowerCase();
  const timestamp = Date.now();

  // 1. Transaction Status Lookup
  if (
    queryLower.includes('status') ||
    queryLower.includes('where is') ||
    queryLower.includes("where's") ||
    queryLower.includes('transfer') ||
    queryLower.includes('money')
  ) {
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
      toolsUsed: ['get_balance', 'list_recent_transactions'],
    };
  }

  // 2. Fee / FX Explainer
  if (
    queryLower.includes('fee') ||
    queryLower.includes('rate') ||
    queryLower.includes('cost') ||
    queryLower.includes('spread')
  ) {
    return {
      id: 'msg-' + timestamp,
      sender: 'assistant',
      text: `AeroPay uses institutional USDC wholesale FX rates with zero hidden markups:\n\n• 1 USDC = 129.50 KES (Kenya)\n• 1 USDC = 1,420.00 RWF (Rwanda)\n• AeroPay Network Fee: $0.50 flat\n• On-chain Gas: $0.00 (Covered by AeroPay Paymaster)`,
      timestamp,
      toolsUsed: ['get_exchange_rate', 'get_fee_breakdown'],
    };
  }

  // 3. Draft Transfer Intent ("send 50 dollars to mum / john")
  if (
    queryLower.includes('send') ||
    queryLower.includes('transfer') ||
    queryLower.includes('pay') ||
    queryLower.includes('remit')
  ) {
    const isRwanda =
      queryLower.includes('rwanda') || queryLower.includes('rwf') || queryLower.includes('kigali');
    const recipientName = isRwanda ? 'Eric Mugisha' : 'Mary Njeri';
    const recipientPhone = isRwanda ? '+250 788 445 566' : '+254 712 345 678';
    const currency = isRwanda ? 'RWF' : 'KES';
    const amountUsd = 50;

    return {
      id: 'msg-' + timestamp,
      sender: 'assistant',
      text: `I've prepared a transfer proposal for $${amountUsd}.00 USDC to ${recipientName} (${currency}). In accordance with AeroPay security rules, I cannot execute transfers directly. Please review the details below and authenticate with your fingerprint or PIN to proceed.`,
      timestamp,
      toolsUsed: ['get_exchange_rate', 'get_beneficiaries', 'draft_transfer'],
      draftAction: {
        type: 'transfer_proposal',
        title: `Confirm Transfer: $${amountUsd} to ${recipientName}`,
        params: {
          recipientName,
          recipientPhone,
          amountUsd,
          currency,
        },
      },
    };
  }

  // 4. Dispute / Fraud Alert
  if (
    queryLower.includes('unauthorized') ||
    queryLower.includes('fraud') ||
    queryLower.includes('stolen') ||
    queryLower.includes('unknown')
  ) {
    return {
      id: 'msg-' + timestamp,
      sender: 'assistant',
      text: '⚠️ Account Security Alert triggered. I have flagged your account for priority review and opened a security ticket (Ref SUP-2291). Would you like to temporarily lock your account card now?',
      timestamp,
      toolsUsed: ['create_support_ticket', 'open_screen'],
      draftAction: {
        type: 'screen_navigation',
        title: 'Lock Account & Review Security',
        params: {
          targetScreen: '/profile',
        },
      },
    };
  }

  // 5. Default General Response (Multilingual Support)
  return {
    id: 'msg-' + timestamp,
    sender: 'assistant',
    text: `Hello! I'm your AeroPay Assistant. I can help you check live transaction status, explain FX rates and fees, summarize your monthly spending, or prepare a transfer for you to confirm.\n\nHow can I assist you today?`,
    timestamp,
    toolsUsed: ['get_balance'],
  };
}
