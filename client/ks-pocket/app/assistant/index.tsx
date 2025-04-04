/**
|--------------------------------------------------
| Assistant Screen - OpenAI Assistant API 활용
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
  Alert,
  Keyboard
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
  
  // Assistant ID (대시보드에서 생성한 Assistant ID로 변경)
  const ASSISTANT_ID = Constants.expoConfig?.extra?.openaiAssistantId || 'asst_your_assistant_id';
  
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
  const [threadId, setThreadId] = useState<string | null>(null);
  
  // 플랫리스트 참조
  const flatListRef = useRef<FlatList<MessageType>>(null);
  const inputRef = useRef<TextInput>(null);
  
  // 컴포넌트 마운트 시 새 스레드 생성
  useEffect(() => {
    createThread();
  }, []);
  
  // 새 스레드 생성 함수
  const createThread = async () => {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API 키가 설정되지 않았습니다.');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      if (data.id) {
        console.log('새 스레드가 생성되었습니다:', data.id);
        setThreadId(data.id);
      } else {
        console.error('스레드 생성 실패:', data);
      }
    } catch (error) {
      console.error('스레드 생성 중 오류:', error);
    }
  };
  
  // 메시지 전송 함수
  const handleSend = async () => {
    if (message.trim() === '' || !threadId) return;
    
    // 키보드 숨기기
    Keyboard.dismiss();
    
    // 사용자 메시지 추가
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const sentMessage = message;
    setMessage(''); // 메시지 초기화
    setIsLoading(true);
    
    try {
      // Assistant API를 통해 메시지 전송 및 응답 받기
      const response = await sendMessageToAssistant(sentMessage);
      
      if (response) {
        // 응답 메시지 추가
        const assistantMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Assistant API 호출 중 오류:', error);
      
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
  
  // 엔터키 처리 함수 추가
  const handleKeyPress = (e: any) => {
    // 모바일에서는 returnKeyType="send"로 이미 설정되어 있으므로
    // 이 로직은 주로 웹이나 특정 환경에서 작동
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      // 기본 행동(줄바꿈) 방지
      e.preventDefault?.();
      handleSend();
    }
  };

  // Assistant API 호출 함수
  const sendMessageToAssistant = async (userMessage: string): Promise<string> => {
    if (!OPENAI_API_KEY || !threadId) {
      console.error('API 키 또는 스레드 ID가 없습니다.');
      return '설정 오류: API 키 또는 스레드 ID가 없습니다.';
    }
    
    try {
      // 1. 스레드에 메시지 추가
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: userMessage
        })
      });
      
      const messageData = await messageResponse.json();
      if (!messageData.id) {
        console.error('메시지 추가 실패:', messageData);
        return '메시지 전송 중 오류가 발생했습니다.';
      }
      
      // 2. 런 생성 (Assistant가 응답하도록 요청)
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID
        })
      });
      
      const runData = await runResponse.json();
      if (!runData.id) {
        console.error('런 생성 실패:', runData);
        return '응답 생성 요청 중 오류가 발생했습니다.';
      }
      
      // 3. 런 상태 확인 (완료될 때까지 폴링)
      const runResult = await checkRunCompletion(threadId, runData.id);
      if (!runResult.success) {
        return '응답 생성 중 문제가 발생했습니다.';
      }
      
      // 4. 최신 메시지 가져오기
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      const messagesData = await messagesResponse.json();
      if (messagesData.data && messagesData.data.length > 0) {
        // API 응답에서 첫 번째 메시지(가장 최신)를 가져옴
        const latestMessage = messagesData.data[0];
        // Assistant 응답인지 확인하고 콘텐츠 반환
        if (latestMessage.role === 'assistant') {
          // v2 API 응답 형식에 맞게 콘텐츠 추출 로직 수정
          try {
            // content는 배열 형태이며 각 항목은 type 속성을 가짐
            const textContent = latestMessage.content.find((item: { type: string; }) => item.type === 'text');
            if (textContent && textContent.text && textContent.text.value) {
              return textContent.text.value;
            }
          } catch (error) {
            console.error('메시지 파싱 오류:', error);
          }
        }
      }
      
      return '응답을 가져올 수 없습니다.';
      
    } catch (error) {
      console.error('Assistant API 호출 오류:', error);
      throw error;
    }
  };
  
  // 런 완료 여부 확인 함수 (폴링 사용)
  const checkRunCompletion = async (threadId: string, runId: string): Promise<{success: boolean}> => {
    let attempts = 0;
    const maxAttempts = 30; // 최대 30회 시도 (약 30초)
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'completed') {
          return { success: true };
        }
        
        if (data.status === 'failed' || data.status === 'cancelled') {
          console.error('런 실패:', data);
          return { success: false };
        }
        
        // 아직 진행 중이라면 1초 대기 후 다시 확인
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        
      } catch (error) {
        console.error('런 상태 확인 중 오류:', error);
        return { success: false };
      }
    }
    
    console.error('런 완료 시간 초과');
    return { success: false };
  };
  
  // 새 메시지가 추가될 때마다 스크롤을 아래로 이동 (완전히 개선된 버전)
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      // 안정적인 스크롤을 위한 시간 지연 및 다중 시도
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        
        // 추가 스크롤 시도 (레이아웃 계산 지연에 대비)
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 50);
      }, 200);
    }
  }, [messages]);

  // 키보드 이벤트와 메시지 전송 후 스크롤 조정
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (messages.length > 0 && flatListRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
    };
  }, [messages]);
  
  // 메시지 렌더링 함수 (기존 코드 유지)
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
      {/* <Text style={[
        styles.timestamp,
        item.sender === 'user' ? styles.userTimestamp : styles.assistantTimestamp
      ]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text> */}
    </View>
  );
  
  // UI 렌더링 (기존 UI 유지)
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
          contentContainerStyle={[styles.messageListContent, { paddingBottom: 20 }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.GOLD_700 || '#007AFF'} />
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#AAA"
            // 단일 라인 모드 (Enter가 항상 전송으로 작동)
            multiline={false}
            enterKeyHint="send"
            returnKeyType="send"
            onSubmitEditing={() => {
              if (message.trim() !== '' && threadId) {
                handleSend();
              }
            }}
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() === '' || !threadId || isLoading ? styles.sendButtonDisabled : {}
            ]}
            onPress={handleSend}
            disabled={message.trim() === '' || !threadId || isLoading}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={message.trim() === '' || !threadId || isLoading ? colors.GRAY_400 : colors.WHITE} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 스타일은 기존과 동일하게 유지
const styles = StyleSheet.create({
  // 기존 스타일 코드는 그대로 유지
  safeArea: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_T200,
    backgroundColor: colors.WHITE,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BLACK,
    textAlign: 'center',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageListContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.GOLD_200,
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.BROWN_100,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: colors.BROWN_900,
  },
  assistantMessageText: {
    color: colors.BLACK,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: colors.WHITE,
  },
  assistantTimestamp: {
    color: colors.GRAY_500,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: colors.WHITE,
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
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_T200,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.GRAY_T100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: colors.BLACK,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.GOLD_700,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: colors.GRAY_300,
  },
});
