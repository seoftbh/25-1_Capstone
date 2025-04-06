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
  Animated, // 애니메이션을 위한 추가
} from "react-native";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  // 정류장에 따라 테두리 색상 결정
  const borderColor = item.departureStop === "도서관" 
    ? colors.BROWN_400 
    : colors.BLUE_500;
    
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
        onPress={() => onToggleNotification(item.id)}
        style={styles.notifyButton}
      >
        <MaterialIcons
          name={item.notify ? "notifications-active" : "notifications-none"}
          size={24}
          color={item.notify ? "#4CAF50" : "#757575"}
        />
      </TouchableOpacity>
    </View>
  );
};

// 상단 실시간 버스 정보 섹션
const TopSection = ({
  libraryNextBus,
  engineeringNextBus,
  currentTime,
}: {
  libraryNextBus: BusSchedule | null;
  engineeringNextBus: BusSchedule | null;
  currentTime: Date;
}) => (
  <View style={styles.topSection}>
    {/* 상단에 현재 시간 표시 */}
    <View style={styles.topTimeContainer}>
      <MaterialCommunityIcons
        name="clock-time-three"
        style={styles.topTimeIcon}
      />
      <Text style={styles.topTime}>
        {timeUtils.getCurrentTimeFormatted(currentTime)}
      </Text>
    </View>

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
    <View style={styles.timeTableHeaderCell}>
      <Text style={styles.timeTableHeaderText}>오후</Text>
    </View>
  </View>
);

export default function BusScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedules, setSchedules] = useState<BusSchedule[]>(busSchedules);
  const [libraryNextBus, setLibraryNextBus] = useState<BusSchedule | null>(null);
  const [engineeringNextBus, setEngineeringNextBus] = useState<BusSchedule | null>(null);
  const [upcomingBuses, setUpcomingBuses] = useState<BusSchedule[]>([]);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // 애니메이션을 위한 값 추가
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    setUpcomingBuses(getUpcomingSchedules(currentTime));
  }, [currentTime, schedules]);

  // 알림 토글 핸들러
  const toggleNotification = (id: string) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id
          ? { ...schedule, notify: !schedule.notify }
          : schedule
      )
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { position: 'relative' }]}>
        {/* 상단부 - 실시간 버스 정보 */}
        <TopSection
          libraryNextBus={libraryNextBus}
          engineeringNextBus={engineeringNextBus}
          currentTime={currentTime}
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
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'flex-end' }}
              activeOpacity={1}
              onPress={handleSheetClose}
            >
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
                <TouchableOpacity 
                  activeOpacity={1} 
                  style={{ flex: 1 }}
                  onPress={(e) => {
                    e.stopPropagation();
                  }}
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

                  {/* 시간표 테이블 */}
                  <ScrollView style={styles.timeTableContainer}>
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
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
    justifyContent: 'flex-end', // 화면 하단에 위치
  },
  modalContent: {
    backgroundColor: colors.GOLD_100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    height: '60%', // 화면의 60%를 차지하도록 설정
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
  timeTableContainer: {
    flex: 1,
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
  timeTableHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.WHITE,
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
});
