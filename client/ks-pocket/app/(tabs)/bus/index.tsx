/**
|--------------------------------------------------
| Bus Screen
|--------------------------------------------------
*/

import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MaterialIcons } from '@expo/vector-icons'

// 타입 및 유틸리티 임포트
import { BusSchedule } from '../../types/bus'
import { timeUtils } from '../../utils/timeUtils'
import { busSchedules, getNextBus, getUpcomingSchedules } from '../../data/busSchedules'

// 현재 시간 표시 헤더 컴포넌트
const CurrentTimeHeader = ({ currentTime }: { currentTime: Date }) => (
  <View style={styles.header}>
    <Text style={styles.currentTime}>{timeUtils.getCurrentTimeFormatted(currentTime)}</Text>
  </View>
);

// 버스 정류장 정보 컴포넌트
const StationInfoCard = ({ 
  stationName, 
  nextBus, 
  currentTime 
}: { 
  stationName: string, 
  nextBus: BusSchedule | null, 
  currentTime: Date 
}) => (
  <View style={styles.busInfoContainer}>
    <Text style={styles.stationName}>{stationName}</Text>
    {nextBus ? (
      <>
        <Text style={styles.nextTime}>
          {timeUtils.calculateRemainingTimeDetailed(nextBus.departureTime, currentTime)}
        </Text>
        <Text style={styles.departureTime}>
          {timeUtils.formatTo12Hour(nextBus.departureTime)}
        </Text>
      </>
    ) : (
      <Text style={styles.noSchedule}>운행 종료</Text>
    )}
  </View>
);

// 버스 시간표 항목 컴포넌트
const ScheduleItem = ({ 
  item, 
  onToggleNotification 
}: { 
  item: BusSchedule, 
  onToggleNotification: (id: string) => void 
}) => (
  <View style={styles.scheduleItem}>
    <View style={styles.scheduleInfo}>
      <Text style={styles.scheduleStop}>{item.departureStop}</Text>
      <Text style={styles.scheduleTime}>{timeUtils.formatTo12Hour(item.departureTime)}</Text>
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
  currentTime 
}: { 
  libraryNextBus: BusSchedule | null, 
  engineeringNextBus: BusSchedule | null, 
  currentTime: Date 
}) => (
  <View style={styles.topSection}>
    <StationInfoCard 
      stationName="도서관" 
      nextBus={libraryNextBus} 
      currentTime={currentTime} 
    />
    <StationInfoCard 
      stationName="공과대" 
      nextBus={engineeringNextBus} 
      currentTime={currentTime} 
    />
  </View>
);

// 하단 시간표 목록 섹션
const BottomSection = ({ 
  upcomingSchedules, 
  onToggleNotification 
}: { 
  upcomingSchedules: BusSchedule[], 
  onToggleNotification: (id: string) => void 
}) => (
  <View style={styles.bottomSection}>
    <Text style={styles.scheduleTitle}>이후 시간표</Text>
    <FlatList
      data={upcomingSchedules}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ScheduleItem 
          item={item} 
          onToggleNotification={onToggleNotification} 
        />
      )}
      contentContainerStyle={styles.scheduleList}
    />
  </View>
);

export default function BusScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedules, setSchedules] = useState<BusSchedule[]>(busSchedules);
  const [libraryNextBus, setLibraryNextBus] = useState<BusSchedule | null>(null);
  const [engineeringNextBus, setEngineeringNextBus] = useState<BusSchedule | null>(null);
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
    setLibraryNextBus(getNextBus('도서관', currentTime));
    setEngineeringNextBus(getNextBus('공과대', currentTime));
    
    // 다가오는 모든 버스 일정 업데이트
    setUpcomingBuses(getUpcomingSchedules(currentTime));
  }, [currentTime, schedules]);

  // 알림 토글 핸들러
  const toggleNotification = (id: string) => {
    setSchedules(prev => 
      prev.map(schedule => 
        schedule.id === id 
          ? { ...schedule, notify: !schedule.notify } 
          : schedule
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 시간 표시 */}
      <CurrentTimeHeader currentTime={currentTime} />
      
      {/* 상단부 - 실시간 버스 정보 */}
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

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currentTime: {
    fontSize: 18,
    fontWeight: '500',
  },
  topSection: {
    flexDirection: 'row',
    height: height * 0.3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  busInfoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  stationName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nextTime: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
    color: '#2196F3',
  },
  departureTime: {
    fontSize: 16,
    color: '#757575',
  },
  noSchedule: {
    fontSize: 16,
    color: '#F44336',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scheduleList: {
    paddingBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleStop: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 60,
  },
  scheduleTime: {
    fontSize: 16,
    marginLeft: 16,
    color: '#424242',
  },
  notifyButton: {
    padding: 8,
  },
});