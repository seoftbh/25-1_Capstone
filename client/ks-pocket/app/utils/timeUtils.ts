// 시간 형식 변환 유틸리티
export const timeUtils = {
  // 시간을 12시간 형식으로 변환
  formatTo12Hour: (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${period} ${hour12}:${minutes.toString().padStart(2, '0')}`;
  },

  // 현재 시간을 12시간 형식으로 반환
  getCurrentTimeFormatted: (currentTime: Date): string => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${period} ${hour12}:${minutes.toString().padStart(2, '0')}`;
  },

  // 버스 출발까지 남은 시간 계산 (분 단위)
  calculateRemainingTime: (timeString: string, currentTime: Date): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const busTotalMinutes = hours * 60 + minutes;
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinutes;
    
    return busTotalMinutes - currentTotalMinutes;
  },

  // 버스 출발까지 남은 시간을 초 단위까지 계산하여 표시 문자열 반환
  calculateRemainingTimeDetailed: (timeString: string, currentTime: Date): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // 버스 출발 시간을 초 단위로 변환
    const busDate = new Date(currentTime);
    busDate.setHours(hours, minutes, 0, 0);
    
    // 현재 시간과의 차이를 밀리초 단위로 계산
    const diffMs = busDate.getTime() - currentTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    // 분과 초 계산
    const remainingMinutes = Math.floor(diffSeconds / 60);
    const remainingSeconds = diffSeconds % 60;
    
    // 1분 미만이면 "곧 출발"
    if (remainingMinutes < 1) {
      return "잠시 후 출발";
    }
    
    // 그렇지 않으면 분:초 형식으로 반환
    return `${remainingMinutes}분 ${remainingSeconds}초 후 출발`;
  }
};