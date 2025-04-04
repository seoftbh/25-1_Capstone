// 시설물 마커 데이터 정의
export type MarkerData = {
  id: string;
  category: string;
  position: {
    lat: number;
    lng: number;
  };
  shortName: string;
  fullName: string;
  description: string;
};

// 카테고리 정의
export const CATEGORIES = [
  { id: "campus", name: "교내시설" },
  { id: "convenience", name: "편의점" },
  { id: "atm", name: "ATM" },
  { id: "parking", name: "주차장" },
  { id: "restaurant", name: "식당" },
  { id: "admin", name: "행정시설" },
  { id: "restarea", name: "휴게실" },
];

// 마커 데이터 (실제 데이터로 대체 필요)
export const MARKERS: MarkerData[] = [
  {
    id: "building2",
    category: "campus",
    position: { lat: 35.1398, lng: 129.0985 },
    shortName: "2호관",
    fullName: "2호관 - 자연관",
    description: "물리학과, 화학과, 생명과학과가 위치함",
  },
  {
    id: "gs25_1",
    category: "convenience",
    position: { lat: 35.1399, lng: 129.0988 },
    shortName: "GS25",
    fullName: "GS25 대학로점",
    description: "24시간 편의점",
  },
  {
    id: "atm1",
    category: "atm",
    position: { lat: 35.1396, lng: 129.099 },
    shortName: "ATM",
    fullName: "부산은행 ATM",
    description: "24시간 이용 가능한 ATM",
  },
  {
    id: "parking1",
    category: "parking",
    position: { lat: 35.1393, lng: 129.0982 },
    shortName: "주차장A",
    fullName: "중앙 주차장",
    description: "총 200대 주차 가능",
  },
  {
    id: "restaurant1",
    category: "restaurant",
    position: { lat: 35.1391, lng: 129.0987 },
    shortName: "학식당",
    fullName: "중앙 학생 식당",
    description: "아침, 점심, 저녁 운영",
  },
  {
    id: "admin1",
    category: "admin",
    position: { lat: 35.1401, lng: 129.0984 },
    shortName: "행정실",
    fullName: "대학 본부",
    description: "학사 행정 업무 처리",
  },
  {
    id: "restarea1",
    category: "restarea",
    position: { lat: 35.14, lng: 129.0991 },
    shortName: "휴게실1",
    fullName: "중앙 휴게실",
    description: "학생들을 위한 휴식 공간",
  },
];
