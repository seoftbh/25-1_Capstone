/**
|--------------------------------------------------
| Bus Screen
|--------------------------------------------------
*/

import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator, // 로딩 인디케이터 추가
  Platform, // 플랫폼 감지용
} from "react-native";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Notifications 설정 - 파일 상단에 추가
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 타입 및 유틸리티 임포트
import { BusSchedule } from "../../types/bus";
import { timeUtils } from "../../utils/timeUtils";
import {
  busSchedules,
  getNextBus,
  getUpcomingSchedules,
  getSchedulesByStop,
} from "../../data/busSchedules";
import { colors } from "@/constants";

// 현재 시간 표시 헤더 컴포넌트
const CurrentTimeHeader = ({ currentTime }: { currentTime: Date }) => (
  <View style={styles.header}>
    <View style={styles.timeWrapper}>
      <MaterialIcons
        name="access-time"
        size={18}
        color={colors.BROWN_500}
        style={styles.timeIcon}
      />
      <Text style={styles.currentTime}>
        {timeUtils.getCurrentTimeFormatted(currentTime)}
      </Text>
    </View>
  </View>
);

// 버스 정류장 정보 컴포넌트
const StationInfoCard = ({
  icon,
  stationName,
  nextBus,
  currentTime,
}: {
  icon?: JSX.Element;
  stationName: string;
  nextBus: BusSchedule | null;
  currentTime: Date;
}) => (
  <View style={styles.busInfoContainer}>
    {/* 상단 1/3 영역: 정류장 정보 */}
    <View style={styles.stationContainer}>
      {icon && icon}
      <Text style={styles.stationName}>{stationName}</Text>
    </View>

    {/* 하단 2/3 영역: 버스 시간 정보 */}
    <View style={styles.busTimeContainer}>
      {nextBus ? (
        <>
          <Text style={styles.nextTime}>
            {timeUtils.calculateRemainingTimeDetailed(
              nextBus.departureTime,
              currentTime
            )}
          </Text>
          <Text style={styles.departureTime}>
            {timeUtils.formatTo12Hour(nextBus.departureTime)}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.noSchedule}>운행 종료</Text>
          <Text style={styles.departureTime}>--:--</Text>
        </>
      )}
    </View>
  </View>
);

// 버스 시간표 항목 컴포넌트 수정
const ScheduleItem = ({
  item,
  onToggleNotification,
}: {
  item: BusSchedule;
  onToggleNotification: (id: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // 정류장에 따라 테두리 색상 결정
  const borderColor = item.departureStop === "도서관" 
    ? colors.BROWN_400 
    : colors.BLUE_500;
  
  const handleNotify = async () => {
    setIsLoading(true);
    await onToggleNotification(item.id);
    setIsLoading(false);
  };
    
  return (
    <View style={[
      styles.scheduleItem, 
      { 
        borderLeftWidth: 8, 
        borderLeftColor: borderColor 
      }
    ]}>
      <View style={styles.scheduleInfo}>
        <Text style={styles.scheduleStop}>{item.departureStop}</Text>
        <View style={styles.scheduleDivider} />
        <Text style={styles.scheduleTime}>
          {timeUtils.formatTo12Hour(item.departureTime)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleNotify}
        style={styles.notifyButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.BROWN_500} />
        ) : (
          <MaterialIcons
            name={item.notify ? "notifications-active" : "notifications-none"}
            size={24}
            color={item.notify ? colors.GOLD_700 : colors.GRAY_400}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

// 상단 실시간 버스 정보 섹션
const TopSection = ({
  libraryNextBus,
  engineeringNextBus,
  currentTime,
  onResetNotifications,
}: {
  libraryNextBus: BusSchedule | null;
  engineeringNextBus: BusSchedule | null;
  currentTime: Date;
  onResetNotifications: () => void;
}) => (
  <View style={styles.topSection}>
    {/* 상단에 현재 시간 표시 */}
    <TouchableOpacity
      style={styles.topTimeContainer}
      onPress={onResetNotifications}
    >
      <MaterialCommunityIcons
        name="clock-time-three"
        style={styles.topTimeIcon}
      />
      <Text style={styles.topTime}>
        {timeUtils.getCurrentTimeFormatted(currentTime)}
      </Text>
    </TouchableOpacity>

    {/* 하단에 정류장 정보 표시 */}
    <View style={styles.stationsContainer}>
      <StationInfoCard
        icon={
          <MaterialCommunityIcons
            name="office-building"
            style={styles.stationIcon}
          />
        }
        stationName="도서관"
        nextBus={libraryNextBus}
        currentTime={currentTime}
      />
      <View style={styles.topSectionDivider} />
      <StationInfoCard
        icon={<MaterialCommunityIcons name="city" style={styles.stationIcon} />}
        stationName="공과대"
        nextBus={engineeringNextBus}
        currentTime={currentTime}
      />
    </View>
  </View>
);

// 하단 시간표 목록 섹션
const BottomSection = ({
  upcomingSchedules,
  onToggleNotification,
}: {
  upcomingSchedules: BusSchedule[];
  onToggleNotification: (id: string) => void;
}) => (
  <View style={styles.bottomSection}>
    <Text style={styles.scheduleTitle}>이후 시간표</Text>
    {upcomingSchedules.length > 0 ? (
      <FlatList
        data={upcomingSchedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScheduleItem
            item={item}
            onToggleNotification={onToggleNotification}
          />
        )}
        contentContainerStyle={styles.scheduleList}
      />
    ) : (
      <View style={styles.emptyScheduleContainer}>
        <MaterialCommunityIcons name="bus-alert" style={styles.emptyScheduleIcon} />
        <Text style={styles.emptyScheduleText}>운행 정보 없음</Text>
      </View>
    )}
  </View>
);

// TopSection과 BottomSection 사이에 안내 메시지 Callout 컴포넌트 추가
const InfoCallout = () => (
  <View style={styles.calloutContainer}>
    <View style={styles.calloutIconContainer}>
      <MaterialCommunityIcons name="alert-circle" style={styles.calloutIcon} />
    </View>
    <Text style={styles.calloutText}>
    버스 출발 시간은 운행 상황에 따라 변경될 수 있습니다.{"\n"}
    안내된 시간은 참고용으로 이용해 주세요.
    </Text>
  </View>
);

// 전체 시간표 버튼 컴포넌트
const FullScheduleButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity 
    style={styles.fullScheduleButton} 
    onPress={() => {
      // console.log(`Button pressed: ${title}`);  // 디버깅용 로그 추가
      onPress();
    }}
    activeOpacity={0.7}  // 버튼 터치 피드백 개선
  >
    <MaterialCommunityIcons name="timetable" size={18} color={colors.BROWN_500} style={styles.fullScheduleIcon} />
    <Text style={styles.fullScheduleText}>{title}</Text>
  </TouchableOpacity>
);

// 시간표 테이블 행 컴포넌트
const TimeTableRow = ({ am, pm }: { am?: string | null; pm?: string | null }) => (
  <View style={styles.timeTableRow}>
    <View style={styles.timeTableCell}>
      <Text style={styles.timeTableText}>{am || "-"}</Text>
    </View>
    <View style={styles.timeTableCell}>
      <Text style={styles.timeTableText}>{pm || "-"}</Text>
    </View>
  </View>
);

// 시간표 헤더 행 컴포넌트
const TimeTableHeader = () => (
  <View style={styles.timeTableHeaderRow}>
    <View style={styles.timeTableHeaderCell}>
      <Text style={styles.timeTableHeaderText}>오전</Text>
    </View>
    <View style={styles.timeTableDivider} />
    <View style={styles.timeTableHeaderCell}>
      <Text style={styles.timeTableHeaderText}>오후</Text>
    </View>
  </View>
);

// 대기 중인 알림 목록 조회 함수
const logPendingNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('=============================================');
    console.log('현재 대기 중인 알림 목록:');
    console.log('총 개수:', notifications.length);
    
    notifications.forEach((notification, index) => {
      const { identifier, content, trigger } = notification;
      console.log(`[${index + 1}] ID: ${identifier}`);
      console.log(`  - 제목: ${content.title}`);
      console.log(`  - 내용: ${content.body}`);
      console.log(`  - 데이터:`, content.data);
      
      // 트리거 정보 (시간)
      if (trigger && 'seconds' in trigger) {
        console.log(`  - 알림 예정: ${trigger.seconds}초 후`);
      } else if (trigger && 'date' in trigger) {
        console.log(`  - 알림 예정 시간: ${new Date(trigger.date).toLocaleString()}`);
      }
      console.log('---------------------------------------------');
    });
    console.log('=============================================');
    return notifications;
  } catch (error) {
    console.error('알림 목록 조회 실패:', error);
    return [];
  }
};

export default function BusScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedules, setSchedules] = useState<BusSchedule[]>(busSchedules);
  const [libraryNextBus, setLibraryNextBus] = useState<BusSchedule | null>(null);
  const [engineeringNextBus, setEngineeringNextBus] = useState<BusSchedule | null>(null);
  const [upcomingBuses, setUpcomingBuses] = useState<BusSchedule[]>([]);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // 알림 초기화 확인 모달 상태 추가
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false); // 초기화 진행 중 상태
  
  // 애니메이션을 위한 값 추가
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 알림 관련 상태 추가
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // 알림 권한 요청 및 리스너 설정
  useEffect(() => {
    // 알림 권한 요청
    (async () => {
      if (Platform.OS === 'android') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        setNotificationPermission(finalStatus === 'granted');
      }
    })();

    // 알림 리스너 설정 - 수신 즉시 대기 목록에서 제거
    notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
      console.log('알림 수신:', notification);
      
      try {
        // 수신된 알림의 ID를 가져오기
        const notificationId = notification.request.identifier;
        const { data } = notification.request.content;
        
        // 알림이 수신되면 즉시 취소 (중복 방지)
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`수신된 알림 취소 완료: ${notificationId}`);
        
        // 관련 일정 찾아서 알림 상태 제거
        if (data && data.scheduleId) {
          const scheduleId = data.scheduleId;
          
          // schedules 상태 업데이트
          setSchedules(prev =>
            prev.map(s =>
              s.id === scheduleId ? { ...s, notify: false, notificationId: undefined } : s
            )
          );
        }
        
        // 대기 중인 알림 목록 확인 (디버깅용)
        const remainingNotifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log(`남은 알림 수: ${remainingNotifications.length}`);
      } catch (error) {
        console.error('알림 처리 중 오류 발생:', error);
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      console.log('알림 응답:', response);
      
      try {
        // 사용자가 알림에 응답한 경우에도 동일하게 처리
        const notificationId = response.notification.request.identifier;
        const { data } = response.notification.request.content;
        
        // 중복 방지를 위해 한 번 더 취소 시도
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        
        if (data && data.scheduleId) {
          const scheduleId = data.scheduleId;
          
          // schedules 상태 업데이트
          setSchedules(prev =>
            prev.map(s =>
              s.id === scheduleId ? { ...s, notify: false, notificationId: undefined } : s
            )
          );
        }
      } catch (error) {
        console.error('알림 응답 처리 중 오류 발생:', error);
      }
    });

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // 버스 알림 스케줄링 함수 수정
  const scheduleBusNotification = async (schedule: BusSchedule) => {
    if (!notificationPermission) {
      console.log('알림 권한이 없습니다.');
      return null;
    }

    try {
      // 현재 시간과 버스 출발 시간 파싱
      const [hours, minutes] = schedule.departureTime.split(':').map(Number);
      
      // 오늘 날짜에 버스 출발 시간 설정
      const departureTime = new Date();
      departureTime.setHours(hours, minutes, 0, 0);
      
      // 3분 전 시간 계산
      const notificationTime = new Date(departureTime);
      notificationTime.setMinutes(notificationTime.getMinutes() - 3);
      
      // 현재 시간
      const now = new Date();
      
      // 이미 지난 시간이면 알림 설정 안함
      if (now > notificationTime) {
        console.log('이미 알림 시간이 지났습니다.');
        return null;
      }

      // 알림까지 남은 시간(초) 계산
      const secondsUntilNotification = Math.max(1, Math.floor((notificationTime.getTime() - now.getTime()) / 1000));

      // 알림 내용 설정
      const title = '버스 출발 알림';
      const body = `${schedule.departureStop}에서 ${schedule.departureTime}에 출발하는 버스가 곧 출발합니다.`;
      
      // seconds 속성을 사용하여 알림 스케줄링
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { scheduleId: schedule.id },
        },
        trigger: {
          type: 'timeInterval' as any,
          seconds: secondsUntilNotification, 
          repeats: false
        }
      });
      
      console.log(`알림 설정 완료 (ID: ${identifier}), ${secondsUntilNotification}초 후`);
      return identifier;
    } catch (error) {
      console.error('알림 설정 중 오류가 발생했습니다:', error);
      return null;
    }
  };

  // 알림 취소 함수
  const cancelBusNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`알림 취소 완료 (ID: ${notificationId})`);
      return true;
    } catch (error) {
      console.error('알림 취소 중 오류가 발생했습니다:', error);
      return false;
    }
  };

  // 정류장별 시간표 보기 핸들러
  const handleViewSchedule = useCallback((stop: string) => {
    // console.log(`Viewing schedule for ${stop}`);
    setSelectedStop(stop);
    setModalVisible(true); // 모달 열기
    
    // 모달이 열릴 때 애니메이션
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  // 모달 닫기 핸들러
  const handleSheetClose = useCallback(() => {
    // 모달이 닫힐 때 애니메이션
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false); // 애니메이션이 끝난 후 모달 상태 변경
    });
  }, [slideAnim, fadeAnim]);

  // 시간표를 오전/오후로 분류하는 함수
  const getFormattedTimeTable = useCallback((stop: string) => {
    const stopSchedules = getSchedulesByStop(stop);
    
    // 오전/오후로 시간 분류
    const amSchedules = stopSchedules
      .filter(schedule => {
        const hour = parseInt(schedule.departureTime.split(':')[0]);
        return hour < 12;
      })
      .map(schedule => schedule.departureTime);
    
    const pmSchedules = stopSchedules
      .filter(schedule => {
        const hour = parseInt(schedule.departureTime.split(':')[0]);
        return hour >= 12;
      })
      .map(schedule => schedule.departureTime);
    
    // 오전/오후 배열 길이 맞추기 (더 긴 배열에 맞춤)
    const maxLength = Math.max(amSchedules.length, pmSchedules.length);
    
    const rows = [];
    for (let i = 0; i < maxLength; i++) {
      rows.push({
        am: amSchedules[i] || null,
        pm: pmSchedules[i] || null,
      });
    }
    
    return rows;
  }, []);

  // 현재 시간을 1초마다 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 다음 버스 정보 업데이트
useEffect(() => {
  // 도서관, 공과대 정류장의 다음 버스 정보 업데이트
  setLibraryNextBus(getNextBus("도서관", currentTime));
  setEngineeringNextBus(getNextBus("공과대", currentTime));

  // 다가오는 모든 버스 일정 업데이트
  const upcoming = getUpcomingSchedules(currentTime);
  
  // 기존 알림 상태 보존하면서 업데이트
  const upcomingWithNotify = upcoming.map(upBus => {
    const existingBus = schedules.find(s => s.id === upBus.id);
    if (existingBus) {
      return {
        ...upBus,
        notify: existingBus.notify,
        notificationId: existingBus.notificationId
      };
    }
    return upBus;
  });
  
  setUpcomingBuses(upcomingWithNotify);
}, [currentTime, schedules]);

// 알림 토글 핸들러 수정
const toggleNotification = async (id: string) => {
  const schedule = schedules.find(s => s.id === id);
  if (!schedule) return;

  // 현재 notify 상태의 반대 값
  const newNotifyState = !schedule.notify;
  
  // 즉시 UI 업데이트 (사용자에게 즉각적 피드백 제공)
  setSchedules(prev =>
    prev.map(s =>
      s.id === id ? { ...s, notify: newNotifyState } : s
    )
  );
  
  try {
    if (newNotifyState) {
      // 알림 활성화
      const notificationId = await scheduleBusNotification(schedule);
      
      if (notificationId) {
        // notificationId만 추가 업데이트 (notify는 이미 변경됨)
        setSchedules(prev =>
          prev.map(s =>
            s.id === id ? { ...s, notificationId } : s
          )
        );
        
        // 알림 추가 후 대기 중인 알림 목록 출력
        await logPendingNotifications();
      } else {
        // 알림 설정 실패 시 notify 상태 롤백
        console.log('알림 설정 실패');
        setSchedules(prev =>
          prev.map(s =>
            s.id === id ? { ...s, notify: !newNotifyState } : s
          )
        );
      }
    } else {
      // 알림 비활성화
      if (schedule.notificationId) {
        await cancelBusNotification(schedule.notificationId);
      }
      
      // notificationId 제거 (notify는 이미 변경됨)
      setSchedules(prev =>
        prev.map(s =>
          s.id === id ? { ...s, notificationId: undefined } : s
        )
      );
      
      // 알림 취소 후 대기 중인 알림 목록 출력
      await logPendingNotifications();
    }
  } catch (error) {
    // 오류 발생 시 상태 롤백
    console.error('알림 토글 오류:', error);
    setSchedules(prev =>
      prev.map(s =>
        s.id === id ? { ...s, notify: !newNotifyState } : s
      )
    );
  }
};

  // 알림 초기화 핸들러
  const resetNotifications = async () => {
    setIsResetting(true);
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of notifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      setSchedules(prev => prev.map(schedule => ({ ...schedule, notify: false, notificationId: undefined })));
      console.log('모든 알림이 초기화되었습니다.');
    } catch (error) {
      console.error('알림 초기화 중 오류 발생:', error);
    } finally {
      setIsResetting(false);
      setResetModalVisible(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { position: 'relative' }]}>
        {/* 상단부 - 실시간 버스 정보 */}
        <TopSection
          libraryNextBus={libraryNextBus}
          engineeringNextBus={engineeringNextBus}
          currentTime={currentTime}
          onResetNotifications={() => setResetModalVisible(true)}
        />

        {/* 전체 시간표 버튼 영역 */}
        <View style={styles.scheduleButtonContainer}>
          <FullScheduleButton 
            title="도서관 시간표" 
            onPress={() => handleViewSchedule("도서관")} 
          />
          <FullScheduleButton 
            title="공과대 시간표" 
            onPress={() => handleViewSchedule("공과대")} 
          />
        </View>

        {/* 참고 안내 메시지 */}
        <InfoCallout />

        {/* 하단부 - 시간표 목록 */}
        <BottomSection
          upcomingSchedules={upcomingBuses}
          onToggleNotification={toggleNotification}
        />

        {/* 전체 시간표를 보여주는 모달 */}
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleSheetClose}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: fadeAnim, // 배경의 페이드 인/아웃
              }
            ]}
          >
            {/* 상단 그림자 영역 - 탭하면 모달 닫힘 */}
            <TouchableOpacity
              style={styles.modalTopSection}
              activeOpacity={1}
              onPress={handleSheetClose}
            />
            
            {/* 하단 콘텐츠 영역 - 독립적으로 스크롤 가능 */}
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0], // 아래에서 위로 슬라이딩
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* 모달 헤더 */}
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>
                  {selectedStop ? `${selectedStop} 전체 시간표` : "버스 시간표"}
                </Text>
                <TouchableOpacity onPress={handleSheetClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={colors.BROWN_800} />
                </TouchableOpacity>
              </View>

              {/* 시간표 테이블 - 직접 스크롤 가능 */}
              <ScrollView 
                style={styles.timeTableContainer}
                contentContainerStyle={styles.timeTableContent}
              >
                <TimeTableHeader />
                
                {selectedStop && 
                  getFormattedTimeTable(selectedStop).map((row, index) => (
                    <TimeTableRow 
                      key={index} 
                      am={row.am} 
                      pm={row.pm} 
                    />
                  ))
                }
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* 알림 초기화 확인 모달 */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={resetModalVisible}
          onRequestClose={() => setResetModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.resetModalContent}>
              <Text style={styles.resetModalTitle}>알림 초기화</Text>
              <Text style={styles.resetModalMessage}>
                모든 알림을 초기화하시겠습니까?
              </Text>
              <View style={styles.resetModalButtons}>
                <TouchableOpacity
                  style={styles.resetModalButton}
                  onPress={() => setResetModalVisible(false)}
                  disabled={isResetting}
                >
                  <Text style={styles.resetModalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resetModalButton, styles.resetModalConfirmButton]}
                  onPress={resetNotifications}
                  disabled={isResetting}
                >
                  <Text style={styles.resetModalButtonText}>
                    {isResetting ? "초기화 중..." : "확인"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// 스타일 확장
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.GOLD_100,
  },
  header: {
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  timeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
  currentTime: {
    fontSize: 18,
    fontWeight: "500",
  },
  topSection: {
    flex: 0.6,
    // borderBottomWidth: 1,
    // borderBottomColor: "#e0e0e0",
    backgroundColor: colors.BROWN_500,
    elevation: 3,
    borderRadius: 16,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  topTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  topTimeIcon: {
    fontSize: 16,
    marginRight: 6,
    color: colors.WHITE,
  },
  topTime: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.WHITE,
    textAlign: "center",
    textAlignVertical: "center",
    marginBottom: 1,
  },
  stationsContainer: {
    flexDirection: "row",
    flex: 1,
  },
  topSectionDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "#e0e0e0",
    marginTop: 6,
    marginBottom: 8,
    height: "85%",
    alignSelf: "center",
  },
  busInfoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
  },
  stationContainer: {
    height: "20%",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  busTimeContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  stationIcon: {
    fontSize: 24,
    color: colors.GOLD_500,
  },
  stationName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.GOLD_500,
    marginLeft: 8,
    lineHeight: 26,
  },
  nextTime: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.WHITE,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 36,
    minHeight: 80,
    width: "100%",
  },
  departureTime: {
    justifyContent: "flex-end",
    fontSize: 20,
    color: colors.GRAY_200,
    marginBottom: 12,
  },
  noSchedule: {
    fontSize: 28,
    color: colors.GRAY_700,
    textAlign: "center",
    fontWeight: "500",
    textAlignVertical: "center",
    lineHeight: 36,
    marginBottom: 8,
    minHeight: 80,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  scheduleList: {
    paddingBottom: 16,
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    overflow: 'hidden', // 색상 테두리가 경계를 넘지 않도록
    borderLeftWidth: 4, // 기본 테두리 너비 (실제 색상은 동적으로 적용)
  },
  scheduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingLeft: 10, // 테두리와 내용 사이 간격 추가
  },
  scheduleStop: {
    fontSize: 16,
    fontWeight: "500",
    width: 60,
    color: colors.BROWN_800,
  },
  scheduleDivider: {
    height: 20, // 고정 높이
    width: 1, // 1픽셀 너비 구분선
    backgroundColor: colors.GRAY_300, // 옅은 회색
    marginHorizontal: 12, // 양쪽에 여백
    marginTop: 2, // 위쪽 여백
  },
  scheduleTime: {
    marginLeft: 12,
    fontSize: 16,
    color: "#424242",
    flex: 1, // 남은 공간 차지
  },
  notifyButton: {
    padding: 8,
  },
  emptyScheduleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyScheduleIcon: {
    fontSize: 40,
    color: colors.GRAY_500,
  },
  emptyScheduleText: {
    fontSize: 24,
    color: colors.GRAY_500,
    marginTop: 8,
  },
  calloutContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.GOLD_200,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    // marginTop: -4,
  },
  calloutIconContainer: {
    marginRight: 10,
  },
  calloutIcon: {
    fontSize: 24,
    color: colors.BROWN_800,
  },
  calloutText: {
    flex: 1,
    fontSize: 14,
    color: colors.BLACK,
    lineHeight: 18,
  },
  scheduleButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  fullScheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.BROWN_50,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    flex: 0.48,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    marginHorizontal: 2,
  },
  fullScheduleIcon: {
    marginRight: 6,
  },
  fullScheduleText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.BROWN_800,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // 하단부에 콘텐츠 배치
  },
  modalContent: {
    backgroundColor: colors.GOLD_100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    height: '70%', // 화면의 60%를 차지하도록 설정
    // 그림자 효과
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTopSection: {
    flex: 1, // 상단 영역이 남은 공간을 차지하도록 설정
  },
  timeTableContainer: {
    flex: 1,
  },
  timeTableContent: {
    paddingBottom: 20, // 스크롤 시 여백 추가
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GOLD_500,
    marginBottom: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.BROWN_800,
  },
  closeButton: {
    padding: 4,
  },
  timeTableHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.BROWN_500,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  timeTableHeaderCell: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  timeTableDivider: {
    // width: StyleSheet.hairlineWidth,
    width: 1.2,
    backgroundColor: colors.BROWN_300,
    height: "58%",
    alignSelf: "center",
  },
  timeTableHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.WHITE,
    paddingBottom: 2,
  },
  timeTableRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  timeTableCell: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
    borderRadius: 4,
  },
  timeTableText: {
    fontSize: 16,
    color: colors.BROWN_800,
  },
  resetModalContent: {
    backgroundColor: colors.WHITE,
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  resetModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  resetModalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  resetModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetModalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: colors.GRAY_300,
    alignItems: "center",
  },
  resetModalConfirmButton: {
    backgroundColor: colors.BROWN_500,
  },
  resetModalButtonText: {
    fontSize: 16,
    color: colors.WHITE,
  },
});
