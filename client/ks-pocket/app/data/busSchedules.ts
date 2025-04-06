import { BusSchedule } from '../types/bus';

// 학교 셔틀버스 시간표 데이터
export const busSchedules: BusSchedule[] = [
  { id: '0', departureStop: '도서관', departureTime: '05:00', notify: false },
  { id: '1', departureStop: '도서관', departureTime: '09:00', notify: false },
  { id: '2', departureStop: '공과대', departureTime: '09:15', notify: false },
  { id: '3', departureStop: '도서관', departureTime: '09:30', notify: false },
  { id: '4', departureStop: '공과대', departureTime: '09:45', notify: false },
  { id: '5', departureStop: '도서관', departureTime: '10:00', notify: false },
  { id: '6', departureStop: '공과대', departureTime: '10:15', notify: false },
  { id: '7', departureStop: '도서관', departureTime: '12:10', notify: false },
  { id: '8', departureStop: '공과대', departureTime: '12:15', notify: false },
  { id: '9', departureStop: '도서관', departureTime: '12:20', notify: false },
  { id: '10', departureStop: '공과대', departureTime: '12:25', notify: false },
  { id: '11', departureStop: '도서관', departureTime: '12:50', notify: false },
  { id: '12', departureStop: '공과대', departureTime: '12:55', notify: false },
  { id: '13', departureStop: '도서관', departureTime: '13:00', notify: false },
  { id: '14', departureStop: '공과대', departureTime: '13:05', notify: false },
  { id: '15', departureStop: '공과대', departureTime: '13:10', notify: false },
  { id: '16', departureStop: '도서관', departureTime: '13:15', notify: false },
  { id: '17', departureStop: '공과대', departureTime: '13:20', notify: false },
  { id: '18', departureStop: '도서관', departureTime: '13:25', notify: false },
  { id: '19', departureStop: '공과대', departureTime: '13:30', notify: false },
  { id: '20', departureStop: '도서관', departureTime: '13:35', notify: false },
  { id: '21', departureStop: '공과대', departureTime: '13:40', notify: false },
  { id: '22', departureStop: '도서관', departureTime: '13:45', notify: false },
  { id: '23', departureStop: '공과대', departureTime: '13:50', notify: false },
  { id: '24', departureStop: '도서관', departureTime: '13:55', notify: false },
  { id: '25', departureStop: '공과대', departureTime: '14:00', notify: false },
  { id: '26', departureStop: '도서관', departureTime: '14:05', notify: false },
];

// 특정 정류장의 버스 일정만 필터링하는 유틸리티 함수
export const getSchedulesByStop = (stop: string): BusSchedule[] => {
  return busSchedules.filter(schedule => schedule.departureStop === stop);
};

// 현재 시간 이후의 다음 버스 찾기
export const getNextBus = (stop: string, currentTime: Date): BusSchedule | null => {
  const stopSchedules = getSchedulesByStop(stop);
  
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinutes;
  
  return stopSchedules.find(bus => {
    const [hours, minutes] = bus.departureTime.split(':').map(Number);
    const busTotalMinutes = hours * 60 + minutes;
    return busTotalMinutes >= currentTotalMinutes;
  }) || null;
};

// 시간을 분 단위로 변환하는 유틸리티 함수
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// 현재 시간 이후의 모든 버스 일정 가져오기 (상단 표시된 다음 버스 제외)
export const getUpcomingSchedules = (currentTime: Date): BusSchedule[] => {
  // 현재 시간 계산
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinutes;
  
  // 각 정류장의 다음 버스 찾기
  const nextLibraryBus = getNextBus('도서관', currentTime);
  const nextEngineeringBus = getNextBus('공과대', currentTime);
  
  // 다음 버스들의 ID를 배열에 저장
const nextBusIds: string[] = [];
  if (nextLibraryBus) nextBusIds.push(nextLibraryBus.id);
  if (nextEngineeringBus) nextBusIds.push(nextEngineeringBus.id);
  
  // 현재 시간 이후의 버스 중 상단에 표시된 버스를 제외한 나머지 버스 필터링
  return busSchedules
    .filter(bus => {
      const busTotalMinutes = timeToMinutes(bus.departureTime);
      
      // 현재 시간 이후이면서 상단에 표시된 버스가 아닌 경우만 포함
      return busTotalMinutes >= currentTotalMinutes && !nextBusIds.includes(bus.id);
    })
    .sort((a, b) => {
      // 출발 시간 순으로 정렬
      return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
    });
};