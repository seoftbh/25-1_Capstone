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
  Keyboard,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants";
import { commonStyles } from "@/constants/CommonStyles";
import Constants from "expo-constants";

// 메시지 타입 정의
type MessageType = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

export default function AssistantScreen() {
  const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey;

  // Assistant ID (대시보드에서 생성한 Assistant ID로 변경)
  const ASSISTANT_ID =
    Constants.expoConfig?.extra?.openaiAssistantId || "asst_your_assistant_id";

  // 상태 관리
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      content:
        "안녕하세요! 경성대 AI 상담원 별이에요.\n 어떤 도움이 필요하신가요? 😊",
      sender: "assistant",
      timestamp: new Date(),
    },
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
      console.error("OpenAI API 키가 설정되지 않았습니다.");
      return;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (data.id) {
        console.log("새 스레드가 생성되었습니다:", data.id);
        setThreadId(data.id);
      } else {
        console.error("스레드 생성 실패:", data);
      }
    } catch (error) {
      console.error("스레드 생성 중 오류:", error);
    }
  };

  // 메시지 전송 함수
  const handleSend = async () => {
    if (message.trim() === "" || !threadId) return;

    // 키보드 숨기기
    Keyboard.dismiss();

    // 사용자 메시지 추가
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const sentMessage = message;
    setMessage(""); // 메시지 초기화
    setIsLoading(true);

    try {
      // Assistant API를 통해 메시지 전송 및 응답 받기
      const response = await sendMessageToAssistant(sentMessage);

      if (response) {
        // 응답 메시지 추가
        const assistantMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "assistant",
          timestamp: new Date(),
        };

        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Assistant API 호출 중 오류:", error);

      // 오류 메시지 추가
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: "앗, 죄송해요. 😢 메시지 처리 중에 오류가 있었어요. 잠시 후 다시 시도해 주세요!",
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 엔터키 처리 함수 추가
  const handleKeyPress = (e: any) => {
    // 모바일에서는 returnKeyType="send"로 이미 설정되어 있으므로
    // 이 로직은 주로 웹이나 특정 환경에서 작동
    if (e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
      // 기본 행동(줄바꿈) 방지
      e.preventDefault?.();
      handleSend();
    }
  };

  // Assistant API 호출 함수
  const sendMessageToAssistant = async (
    userMessage: string
  ): Promise<string> => {
    if (!OPENAI_API_KEY || !threadId) {
      console.error("API 키 또는 스레드 ID가 없습니다.");
      return "설정 오류: API 키 또는 스레드 ID가 없습니다.";
    }

    try {
      // 1. 스레드에 메시지 추가
      const messageResponse = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({
            role: "user",
            content: userMessage,
          }),
        }
      );

      const messageData = await messageResponse.json();
      if (!messageData.id) {
        console.error("메시지 추가 실패:", messageData);
        return "메시지 전송 중 오류가 발생했습니다.";
      }

      // 2. 런 생성 (Assistant가 응답하도록 요청)
      const runResponse = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({
            assistant_id: ASSISTANT_ID,
          }),
        }
      );

      const runData = await runResponse.json();
      if (!runData.id) {
        console.error("런 생성 실패:", runData);
        return "응답 생성 요청 중 오류가 발생했습니다.";
      }

      // 3. 런 상태 확인 (완료될 때까지 폴링)
      const runResult = await checkRunCompletion(threadId, runData.id);
      if (!runResult.success) {
        return "응답 생성 중 문제가 발생했습니다.";
      }

      // 4. 최신 메시지 가져오기
      const messagesResponse = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/messages?limit=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
        }
      );

      const messagesData = await messagesResponse.json();
      if (messagesData.data && messagesData.data.length > 0) {
        // API 응답에서 첫 번째 메시지(가장 최신)를 가져옴
        const latestMessage = messagesData.data[0];
        // Assistant 응답인지 확인하고 콘텐츠 반환
        if (latestMessage.role === "assistant") {
          // v2 API 응답 형식에 맞게 콘텐츠 추출 로직 수정
          try {
            // content는 배열 형태이며 각 항목은 type 속성을 가짐
            const textContent = latestMessage.content.find(
              (item: { type: string }) => item.type === "text"
            );
            if (textContent && textContent.text && textContent.text.value) {
              return textContent.text.value;
            }
          } catch (error) {
            console.error("메시지 파싱 오류:", error);
          }
        }
      }

      return "응답을 가져올 수 없습니다.";
    } catch (error) {
      console.error("Assistant API 호출 오류:", error);
      throw error;
    }
  };

  // 런 완료 여부 확인 함수 (폴링 사용)
  const checkRunCompletion = async (
    threadId: string,
    runId: string
  ): Promise<{ success: boolean }> => {
    let attempts = 0;
    const maxAttempts = 30; // 최대 30회 시도 (약 30초)

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "OpenAI-Beta": "assistants=v2",
            },
          }
        );

        const data = await response.json();

        if (data.status === "completed") {
          return { success: true };
        }

        if (data.status === "failed" || data.status === "cancelled") {
          console.error("런 실패:", data);
          return { success: false };
        }

        // 아직 진행 중이라면 1초 대기 후 다시 확인
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        console.error("런 상태 확인 중 오류:", error);
        return { success: false };
      }
    }

    console.error("런 완료 시간 초과");
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
      "keyboardDidShow",
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

  // 메시지 렌더링 함수 수정 - 프로필 이미지를 상단에 표시
  const renderMessage = ({ item }: { item: MessageType }) => {
    // Assistant 메시지인 경우 프로필 이미지와 함께 수직으로 표시
    if (item.sender === "assistant") {
      return (
        <View style={styles.assistantMessageColumn}>
          {/* 프로필 이미지와 타임스탬프를 담은 상단 행 */}
          <View style={styles.assistantHeader}>
            <Image
              source={require("@/assets/images/assistant-profile.png")} // 프로필 이미지 경로
              style={styles.profileImage}
            />

            {/* 필요시 여기에 Assistant 이름 등을 추가할 수 있음 */}
            <Text style={styles.assistantName}>AI 상담원 - 별이</Text>
          </View>

          {/* 메시지 내용 */}
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <Text style={[styles.messageText, styles.assistantMessageText]}>
              {item.content}
            </Text>
          </View>
        </View>
      );
    }

    // 사용자 메시지인 경우 기존 스타일 유지
    return (
      <View style={[styles.messageContainer, styles.userMessage]}>
        <Text style={[styles.messageText, styles.userMessageText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  // UI 렌더링 (기존 UI 유지)
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* <View style={styles.header}>
          <Text style={styles.headerTitle}>AI 어시스턴트</Text>
        </View> */}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageListContent,
            { paddingBottom: 20 },
          ]}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.GOLD_700 || "#007AFF"}
            />
          </View>
        )}

<View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            AI가 제공하는 답변은 참고용입니다. 중요한 정보는 반드시 직접 확인해 주세요.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#AAA"
            multiline={true}
            enterKeyHint="send"
            returnKeyType="send"
            onSubmitEditing={() => {
              if (message.trim() !== "" && threadId) {
                handleSend();
              }
            }}
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() === "" || !threadId || isLoading
                ? styles.sendButtonDisabled
                : {},
            ]}
            onPress={handleSend}
            disabled={message.trim() === "" || !threadId || isLoading}
          >
            <Ionicons
              name="send"
              size={24}
              color={
                message.trim() === "" || !threadId || isLoading
                  ? colors.GRAY_400
                  : colors.WHITE
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 스타일 관련 추가 수정
const styles = StyleSheet.create({
  // 기존 스타일 유지...

  safeArea: {
    flex: 1,
    backgroundColor: colors.GOLD_100,
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
    fontWeight: "bold",
    color: colors.BLACK,
    textAlign: "center",
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageListContent: {
    padding: 8,
    paddingBottom: 30,
    flexGrow: 1,
  },

  // 메시지 행 스타일 (Assistant 메시지용)
  assistantMessageColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 12,
    maxWidth: "90%",
  },

  // Assistant 메시지 상단 헤더 스타일
  assistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingLeft: 4,
  },

  // Assistant 이름 스타일
  assistantName: {
    fontSize: 16,
    color: colors.GRAY_700,
    fontWeight: "500",
  },

  // 프로필 이미지 스타일
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: colors.BROWN_100, // 이미지 로딩 전 배경색
  },

  // 메시지 컨테이너 스타일
  messageContainer: {
    maxWidth: "80%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginVertical: 2,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },

  // Assistant 메시지 스타일 조정
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.GOLD_200,
    borderTopLeftRadius: 4,
    maxWidth: "100%", // Assistant 메시지 너비 최적화
  },

  // 사용자 메시지 스타일
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.BROWN_100,
    borderTopRightRadius: 4,
    paddingBottom: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    
  },
  userMessageText: {
    color: colors.BROWN_900,
    lineHeight: 24,
  },
  assistantMessageText: {
    color: colors.BLACK,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: "flex-end",
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
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: colors.WHITE,
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // 화면 하단의 경고 문구
  disclaimerContainer: {
    // backgroundColor: colors.GOLD_500,
    paddingVertical: 12,
    // paddingHorizontal: 16,
    // borderTopWidth: 1,
    // borderTopColor: colors.GRAY_T200,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.GRAY_700,
    textAlign: 'center',
    // fontStyle: 'italic',
  },


  // 입력창 
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: colors.BROWN_50,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_T200,
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: colors.GRAY_T200,
  },
});
