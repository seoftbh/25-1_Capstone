// 버스 시간표 타입 정의
export interface BusSchedule {
  id: string;
  departureStop: string; // 출발 정류장 (도서관, 공과대)
  departureTime: string; // 출발 시간 (HH:MM 형식)
  notify: boolean;       // 알림 설정 여부
  notificationId?: string; // 알림 ID를 저장할 필드 추가
}