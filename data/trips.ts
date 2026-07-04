export type Trip = {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  date: string;
  title: string;
  description: string;
  photos: string[];
};

export const trips: Trip[] = [
  {
    id: "japan-tokyo",
    country: "일본",
    city: "도쿄",
    lat: 35.6762,
    lng: 139.6503,
    date: "2025-03-12",
    title: "네온사인 사이를 걷다",
    description: "시부야 스크램블 교차로와 신주쿠 골목을 밤새 돌아다녔다. 여행의 시작을 알리는 도시.",
    photos: ["/placeholder/tokyo-1.jpg", "/placeholder/tokyo-2.jpg"],
  },
  {
    id: "vietnam-hanoi",
    country: "베트남",
    city: "하노이",
    lat: 21.0278,
    lng: 105.8342,
    date: "2025-03-28",
    title: "구시가지의 아침",
    description: "이른 아침 호안끼엠 호수 주변을 걸으며 마신 에그커피가 아직도 생각난다.",
    photos: ["/placeholder/hanoi-1.jpg"],
  },
  {
    id: "turkey-istanbul",
    country: "튀르키예",
    city: "이스탄불",
    lat: 41.0082,
    lng: 28.9784,
    date: "2025-04-15",
    title: "두 대륙을 잇는 도시",
    description: "아야소피아와 그랜드 바자르, 그리고 보스포루스 해협을 건너며 유럽과 아시아를 하루에 오갔다.",
    photos: ["/placeholder/istanbul-1.jpg", "/placeholder/istanbul-2.jpg"],
  },
  {
    id: "italy-rome",
    country: "이탈리아",
    city: "로마",
    lat: 41.9028,
    lng: 12.4964,
    date: "2025-05-02",
    title: "모든 길은 여기로",
    description: "콜로세움 앞에서 맞은 노을. 2000년 전 돌바닥 위에 서 있다는 감각이 낯설고 좋았다.",
    photos: ["/placeholder/rome-1.jpg"],
  },
  {
    id: "morocco-marrakech",
    country: "모로코",
    city: "마라케시",
    lat: 31.6295,
    lng: -7.9811,
    date: "2025-05-20",
    title: "붉은 도시의 시장",
    description: "제마엘프나 광장의 소음과 향신료 냄새, 그리고 사하라로 향하기 전 마지막 도시의 활기.",
    photos: ["/placeholder/marrakech-1.jpg", "/placeholder/marrakech-2.jpg"],
  },
  {
    id: "peru-cusco",
    country: "페루",
    city: "쿠스코",
    lat: -13.5319,
    lng: -71.9675,
    date: "2025-06-10",
    title: "구름 위의 도시로 가는 관문",
    description: "고산병과 씨름하며 도착한 쿠스코, 마추픽추로 떠나기 전 며칠을 보낸 잉카의 옛 수도.",
    photos: ["/placeholder/cusco-1.jpg"],
  },
];
