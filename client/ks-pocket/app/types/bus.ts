// 버스 시간표 타입 정의
export type BusSchedule = {
  id: string;
  departureStop: string; // 출발 정류장 (도서관, 공과대)
  departureTime: string; // 출발 시간 (HH:MM 형식)
  notify: boolean;       // 알림 설정 여부
}