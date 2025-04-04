import { View, Text, SafeAreaView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';

export default function MapScreen() {
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const location = {
    latitude: 35.1395,
    longitude: 129.0986
  };
  
  const bounds = {
    sw: { lat: 35.1365, lng: 129.0940 }, // 남서쪽 좌표
    ne: { lat: 35.1450, lng: 129.1020 }  // 북동쪽 좌표
  };
  
  const kakaoMapApiKey = Constants.expoConfig?.extra?.kakaoMapApiKey || '';
  
  // WebView와 네이티브 앱 간의 통신을 위한 핸들러
  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'boundsStatus') {
        setIsOutOfBounds(data.isOutOfBounds);
      } else if (data.type === 'mapLoaded') {
        setMapLoaded(true);
      } else if (data.type === 'error') {
        console.error('맵 에러:', data.message);
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
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
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}"></script>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // 전역 변수로 선언하여 모든 함수에서 접근 가능하도록 함
        var map;
        var bounds;
        
        // 지도 초기화
        function initMap() {
          var container = document.getElementById('map');
          var options = {
            center: new kakao.maps.LatLng(${location.latitude}, ${location.longitude}),
            level: 3
          };
          
          try {
            // 지도 생성
            map = new kakao.maps.Map(container, options);
            
            // 지도 로드 완료 알림
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded',
              success: true
            }));
            
            // 지도 이동 제한 영역 설정
            bounds = new kakao.maps.LatLngBounds(
              new kakao.maps.LatLng(${bounds.sw.lat}, ${bounds.sw.lng}),
              new kakao.maps.LatLng(${bounds.ne.lat}, ${bounds.ne.lng})
            );
            
            // 이벤트 리스너 등록
            kakao.maps.event.addListener(map, 'dragend', checkBounds);
            kakao.maps.event.addListener(map, 'zoom_changed', checkBounds);
            kakao.maps.event.addListener(map, 'bounds_changed', debounce(checkBounds, 300));
            
            // 기본 위치에 마커 표시
            var markerPosition = new kakao.maps.LatLng(${location.latitude}, ${location.longitude});
            var marker = new kakao.maps.Marker({
              position: markerPosition
            });
            marker.setMap(map);
            
            // 제한 영역 표시
            var rectangle = new kakao.maps.Rectangle({
              bounds: bounds,
              strokeWeight: 2,
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              fillColor: '#FF0000',
              fillOpacity: 0.1
            });
            rectangle.setMap(map);
            
            // 초기 상태 확인 (약간의 딜레이를 주어 지도가 완전히 로드된 후 체크)
            setTimeout(checkBounds, 1000);
          } catch(error) {
            console.error('카카오맵 초기화 오류:', error);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'Failed to initialize KakaoMap: ' + error.message
            }));
          }
        }
        
        // 디바운스 함수 (연속된 이벤트 호출 제한)
        function debounce(func, wait) {
          let timeout;
          return function() {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
          };
        }
        
        // 지도 이동 시 경계 체크
        function checkBounds() {
          if (!map || !bounds) return;
          
          try {
            var mapBounds = map.getBounds();
            
            // 수정된 방식으로 지도가 경계를 벗어났는지 확인
            // 현재 지도의 중심점
            var center = map.getCenter();
            
            // 중심점이 제한 영역 내에 있는지 확인
            var isOutOfBounds = !bounds.contain(center);
            
            // React Native에 경계 이탈 상태 전달
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'boundsStatus',
              isOutOfBounds: isOutOfBounds
            }));
          } catch(e) {
            console.error('경계 체크 오류:', e);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: '경계 체크 중 오류 발생: ' + e.message
            }));
          }
        }
        
        // 페이지 로드 시 지도 초기화
        document.addEventListener('DOMContentLoaded', initMap);
      </script>
    </body>
    </html>
  `;

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
      {isOutOfBounds && (
        <TouchableOpacity 
          style={styles.returnButton} 
          onPress={goToDefaultLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>기본 위치로 돌아가기</Text>
        </TouchableOpacity>
      )}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={onMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView 오류:', nativeEvent);
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative'
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  returnButton: {
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
    backgroundColor: '#3366FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});