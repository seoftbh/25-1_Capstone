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
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

// 타입 및 유틸리티 임포트
import { BusSchedule } from "../../types/bus";
import { timeUtils } from "../../utils/timeUtils";
import {
  busSchedules,
  getNextBus,
  getUpcomingSchedules,
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

// 버스 시간표 항목 컴포넌트
const ScheduleItem = ({
  item,
  onToggleNotification,
}: {
  item: BusSchedule;
  onToggleNotification: (id: string) => void;
}) => (
  <View style={styles.scheduleItem}>
    <View style={styles.scheduleInfo}>
      <Text style={styles.scheduleStop}>{item.departureStop}</Text>
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

export default function BusScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedules, setSchedules] = useState<BusSchedule[]>(busSchedules);
  const [libraryNextBus, setLibraryNextBus] = useState<BusSchedule | null>(
    null
  );
  const [engineeringNextBus, setEngineeringNextBus] =
    useState<BusSchedule | null>(null);
  const [upcomingBuses, setUpcomingBuses] = useState<BusSchedule[]>([]);

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
    <SafeAreaView style={styles.container}>
      {/* 상단부 - 실시간 버스 정보 (내부에 시간 포함) */}
      <TopSection
        libraryNextBus={libraryNextBus}
        engineeringNextBus={engineeringNextBus}
        currentTime={currentTime}
      />

      {/* 하단부 - 시간표 목록 */}
      <BottomSection
        upcomingSchedules={upcomingBuses}
        onToggleNotification={toggleNotification}
      />
    </SafeAreaView>
  );
}

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
    flex: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: colors.BROWN_500,
    elevation: 3,
    borderRadius: 16,
    margin: 16,
    overflow: "hidden", // 둥근 모서리 내부에 컨텐츠가 포함되도록
  },
  topTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: "rgba(255,255,255,0.2)",
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
    // paddingVertical: 16,
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
    // paddingTop: 8,
  },
  busTimeContainer: {
    flex: 1, // 나머지 공간 모두 차지
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "pink",
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
    // paddingBottom: 36,
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  scheduleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleStop: {
    fontSize: 16,
    fontWeight: "500",
    minWidth: 60,
  },
  scheduleTime: {
    fontSize: 16,
    marginLeft: 16,
    color: "#424242",
  },
  notifyButton: {
    padding: 8,
  },
  emptyScheduleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 16,
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
});
