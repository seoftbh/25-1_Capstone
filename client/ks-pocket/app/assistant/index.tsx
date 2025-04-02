/**
|--------------------------------------------------
| Assistant Screen
|--------------------------------------------------
*/

import React, { useState, useRef, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { colors } from "@/constants";
import { commonStyles } from "@/constants/CommonStyles";
import Constants from 'expo-constants';

// 메시지 타입 정의
type MessageType = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

export default function AssistantScreen() {
  const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey;
  // 상태 관리
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      content: '안녕하세요! 무엇을 도와드릴까요?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 플랫리스트 참조
  const flatListRef = useRef<FlatList<MessageType>>(null);
  
  // 메시지 전송 함수
  const handleSend = async () => {
    if (message.trim() === '') return;
    
    // 사용자 메시지 추가
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // OpenAI API 호출
      const response = await callOpenAI(message);
      
      // 응답 메시지 추가
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('OpenAI API 호출 중 오류:', error);
      
      // 오류 메시지 추가
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 메시지 처리 중 오류가 발생했습니다.',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // OpenAI API 호출 함수
  const callOpenAI = async (prompt: string): Promise<string> => {
    // 환경 변수에서 API 키 로드
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API 키가 설정되지 않았습니다.');
      return '설정 오류: API 키가 없습니다. 관리자에게 문의하세요.';
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: '당신은 도움이 되는 AI 어시스턴트입니다.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.error('API 응답 오류:', data);
        return '응답을 처리하는 중 오류가 발생했습니다.';
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      throw error;
    }
  };
  
  // 새 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // 메시지 렌더링 함수
  const renderMessage = ({ item }: { item: MessageType }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {item.content}
      </Text>
      <Text style={[
        styles.timestamp,
        item.sender === 'user' ? styles.userTimestamp : styles.assistantTimestamp
      ]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI 어시스턴트</Text>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.GOLD_700 || '#007AFF'} />
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#AAA"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() === '' ? styles.sendButtonDisabled : {}
            ]}
            onPress={handleSend}
            disabled={message.trim() === '' || isLoading}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={message.trim() === '' ? "#AAA" : colors.WHITE || "#FFF"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.WHITE || '#F5FCFF',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_T200 || '#E5E5E5',
    backgroundColor: colors.WHITE || '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BLACK || '#000',
    textAlign: 'center',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageListContent: {
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.GOLD_700 || '#007AFF',
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.GRAY_T100 || '#F0F0F0',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: colors.WHITE || '#FFF',
  },
  assistantMessageText: {
    color: colors.BLACK || '#000',
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: colors.WHITE || '#FFF',
  },
  assistantTimestamp: {
    color: colors.GRAY_500 || '#999',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: colors.WHITE || '#FFF',
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.WHITE || '#FFF',
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_T200 || '#E5E5E5',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.GRAY_T100 || '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: colors.BLACK || '#000',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.GOLD_700 || '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: colors.GRAY_300 || '#DDD',
  },
});
