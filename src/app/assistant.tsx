import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  TextInput,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useToast } from '@/context/ToastContext';
import { AssistantMessage, processAssistantQuery } from '@/services/aiAssistant';

export default function AssistantScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ initialQuery?: string; txRef?: string }>();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: params.txRef
        ? `Hello Shema! I see you have a query about transaction ${params.txRef}. I have loaded the state machine logs and on-chain receipt context for this transfer. How can I help?`
        : 'Hello Shema! I am your AeroPay Assistant. Ask me about transaction statuses, FX rates, fees, spending insights, or ask me to draft a transfer for you.',
      timestamp: Date.now(),
      toolsUsed: ['get_balance', 'get_transaction_status'],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg: AssistantMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processAssistantQuery(text, messages);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.titleRow}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Ask AeroPay AI</Text>
            <View style={[styles.aiBadge, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="sparkles" size={12} color={colors.accent} />
              <Text style={[styles.aiBadgeText, { color: colors.accent }]}>Claude Grounded</Text>
            </View>
          </View>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Grounded financial copilot • Read & Proposal mode
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Suggestions Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionRow}
          >
            <Pressable
              style={[
                styles.chip,
                { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
              ]}
              onPress={() => handleSendMessage("Where's my money I sent to Mary?")}
            >
              <Ionicons name="time-outline" size={14} color={colors.accent} />
              <Text style={[styles.chipText, { color: colors.text }]}>Check status AP-8F2K</Text>
            </Pressable>

            <Pressable
              style={[
                styles.chip,
                { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
              ]}
              onPress={() => handleSendMessage('Explain current exchange rates and fees')}
            >
              <Ionicons name="calculator-outline" size={14} color={colors.accent} />
              <Text style={[styles.chipText, { color: colors.text }]}>Explain FX fees</Text>
            </Pressable>

            <Pressable
              style={[
                styles.chip,
                { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
              ]}
              onPress={() => handleSendMessage('Draft a transfer of 50 dollars to Mary')}
            >
              <Ionicons name="paper-plane-outline" size={14} color={colors.accent} />
              <Text style={[styles.chipText, { color: colors.text }]}>Draft transfer</Text>
            </Pressable>
          </ScrollView>

          {/* Messages Stream */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubbleWrapper,
                msg.sender === 'user' ? styles.userWrapper : styles.assistantWrapper,
              ]}
            >
              {msg.sender === 'assistant' && (
                <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  msg.sender === 'user'
                    ? [styles.userBubble, { backgroundColor: colors.accent }]
                    : [
                        styles.assistantBubble,
                        { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: msg.sender === 'user' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {msg.text}
                </Text>

                {/* Tool Badges */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <View style={styles.toolBadgeContainer}>
                    <Ionicons name="construct-outline" size={11} color={colors.textSecondary} />
                    <Text style={[styles.toolBadgeText, { color: colors.textSecondary }]}>
                      Tools: {msg.toolsUsed.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Draft Proposal Action Card */}
                {msg.draftAction && (
                  <View
                    style={[
                      styles.actionCard,
                      {
                        backgroundColor: isDark ? '#27272A' : '#F1F5F9',
                        borderColor: colors.accent,
                      },
                    ]}
                  >
                    <View style={styles.actionCardHeader}>
                      <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
                      <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                        {msg.draftAction.title}
                      </Text>
                    </View>
                    <Text style={[styles.actionCardSub, { color: colors.textSecondary }]}>
                      Requires user biometric authorization. Assistant cannot execute directly.
                    </Text>

                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                      onPress={() => {
                        if (msg.draftAction?.type === 'transfer_proposal') {
                          showToast('Opening authenticated transfer wizard...', 'info');
                          router.push({
                            pathname: '/(tabs)/send/confirm',
                            params: {
                              recipientName: msg.draftAction.params.recipientName,
                              recipientPhone: msg.draftAction.params.recipientPhone,
                              sendAmountUsd: msg.draftAction.params.amountUsd,
                            },
                          });
                        } else if (msg.draftAction?.type === 'support_ticket') {
                          showToast('Priority security ticket SUP-2291 created.', 'success');
                        } else if (msg.draftAction?.type === 'screen_navigation') {
                          router.push('/profile');
                        }
                      }}
                    >
                      <Text style={styles.actionBtnText}>Authenticate & Proceed</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={styles.typingRow}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontStyle: 'italic' }}>
                AeroPay Assistant is reasoning...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.backgroundElement, borderTopColor: colors.divider },
          ]}
        >
          <TextInput
            value={inputQuery}
            onChangeText={setInputQuery}
            placeholder="Ask AeroPay AI about rates, transfers, status..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            onSubmitEditing={() => handleSendMessage()}
          />
          <Pressable
            onPress={() => handleSendMessage()}
            style={[
              styles.sendBtn,
              { backgroundColor: inputQuery.trim() ? colors.accent : colors.divider },
            ]}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  suggestionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    marginVertical: 4,
    gap: 8,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  toolBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  toolBadgeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionCardSub: {
    fontSize: 11,
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 20,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
