import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Constants from "expo-constants";
import CategorySelector from "./components/CategorySelector";
import ReturnToLocationButton from "./components/ReturnToLocationButton";
import KakaoMapView from "./components/KakaoMapView";
import { MarkerData, MARKERS } from "./data/mapData";

export default function MapScreen() {
  const categories = [
    { id: "campus", name: "캠퍼스" },
    { id: "convenience", name: "편의시설" },
    { id: "cvs", name: "편의점" },
    { id: "atm", name: "ATM" },
    { id: "parking", name: "주차장" },
    { id: "restaurant", name: "식당" },
    { id: "admin", name: "행정" },
    { id: "restarea", name: "휴게공간" },
    { id: "sports", name: "체육시설" },
  ];

  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const location = {
    latitude: 35.1395,
    longitude: 129.0986,
  };

  const bounds = {
    sw: { lat: 35.1365, lng: 129.094 }, // 남서쪽 좌표
    ne: { lat: 35.145, lng: 129.102 }, // 북동쪽 좌표
  };

  const kakaoMapApiKey = Constants.expoConfig?.extra?.kakaoMapApiKey || "";

  // 카테고리 토글 처리 함수
  const handleToggleCategory = (categoryId: string) => {
    setActiveCategories((prev) => {
      if (prev.includes(categoryId)) {
        // 이미 활성화된 카테고리라면 제거
        const result = prev.filter((id) => id !== categoryId);

        // 마커 숨기기
        if (webViewRef.current && mapLoaded) {
          webViewRef.current.injectJavaScript(`
            try {
              hideMarkersByCategory('${categoryId}');
            } catch(e) {
              console.error('마커 숨기기 오류:', e);
            }
            true;
          `);
        }

        return result;
      } else {
        // 활성화되지 않은 카테고리라면 추가
        const result = [...prev, categoryId];

        // 마커 표시하기
        if (webViewRef.current && mapLoaded) {
          webViewRef.current.injectJavaScript(`
            try {
              showMarkersByCategory('${categoryId}');
            } catch(e) {
              console.error('마커 표시 오류:', e);
            }
            true;
          `);
        }

        return result;
      }
    });
  };

  // 초기 카테고리 설정 함수
  const handleInitCategories = (categoryIds: string[]) => {
    setActiveCategories(categoryIds);
  };

  // WebView와 네이티브 앱 간의 통신을 위한 핸들러
  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "boundsStatus") {
        setIsOutOfBounds(data.isOutOfBounds);
      } else if (data.type === "mapLoaded") {
        setMapLoaded(true);
      } else if (data.type === "error") {
        console.error("맵 에러:", data.message);
      } else if (data.type === "markerClicked") {
        // 마커 클릭 이벤트 처리
        console.log("마커 클릭:", data.marker);
      }
    } catch (error) {
      console.error("메시지 파싱 오류:", error);
    }
  };

  // 기본 위치로 돌아가는 함수
  const goToDefaultLocation = () => {
    if (webViewRef.current && mapLoaded) {
      webViewRef.current.injectJavaScript(`
        try {
          map.setCenter(new kakao.maps.LatLng(${location.latitude}, ${location.longitude}));
          map.setLevel(3);
          checkBounds(); // 위치 이동 후 경계 상태 즉시 확인
        } catch(e) {
          console.error('지도 위치 이동 오류:', e);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: '지도 위치 이동 중 오류 발생: ' + e.message
          }));
        }
        true;
      `);
    }
  };

  // 지도가 로드되었는지 확인하는 타이머
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!mapLoaded && webViewRef.current) {
        // 5초 후에도 지도가 로드되지 않은 경우 재로드 시도
        webViewRef.current.reload();
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [mapLoaded]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 카테고리 버튼 영역 */}
      <CategorySelector
        categories={categories}
        activeCategories={activeCategories}
        onToggleCategory={handleToggleCategory}
        onInitCategories={handleInitCategories}
      />

      {/* 경계 이탈 시 돌아가기 버튼 */}
      {isOutOfBounds && (
        <ReturnToLocationButton onPress={goToDefaultLocation} />
      )}

      {/* 지도 영역 */}
      <KakaoMapView
        ref={webViewRef}
        kakaoMapApiKey={kakaoMapApiKey}
        markers={MARKERS}
        location={location}
        bounds={bounds}
        onMessage={onMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
});
