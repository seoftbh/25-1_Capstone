import React, { forwardRef } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { MarkerData } from "../data/mapData";

type KakaoMapViewProps = {
  kakaoMapApiKey: string;
  markers: MarkerData[];
  location: {
    latitude: number;
    longitude: number;
  };
  bounds: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  };
  onMessage: (event: WebViewMessageEvent) => void;
};

const KakaoMapView = forwardRef<WebView, KakaoMapViewProps>(
  ({ kakaoMapApiKey, markers, location, bounds, onMessage }, ref) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
          #map { width: 100%; height: 100%; }
          .customOverlay {
            padding: 10px;
            background: white;
            border-radius: 5px;
            border: 1px solid #ccc;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            max-width: 250px;
          }
          .customOverlay .title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .customOverlay .desc {
            font-size: 12px;
          }
          .markerLabel {
            padding: 3px 8px;
            border-radius: 12px;
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
            white-space: nowrap;
            transform: translateY(-10px);
            box-shadow: 0 1px 2px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
          }
          .markerLabel i {
            margin-right: 4px;
            font-size: 10px;
          }
          
          /* 카테고리별 색상 */
          .campus { background: rgba(41, 128, 185, 0.85); }
          .convenience { background: rgba(39, 174, 96, 0.85); }
          .atm { background: rgba(142, 68, 173, 0.85); }
          .parking { background: rgba(230, 126, 34, 0.85); }
          .restaurant { background: rgba(231, 76, 60, 0.85); }
          .admin { background: rgba(52, 73, 94, 0.85); }
          .restarea { background: rgba(127, 140, 141, 0.85); }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // 전역 변수로 선언하여 모든 함수에서 접근 가능하도록 함
          var map;
          var bounds;
          var markers = ${JSON.stringify(markers)};
          var markerObjects = {};
          var overlays = {};
          var labelOverlays = {}; // 마커에 표시할 라벨 오버레이
          
          // 카테고리별 마커 관리
          var categoryMarkers = {
            campus: [],
            convenience: [],
            atm: [],
            parking: [],
            restaurant: [],
            admin: [],
            restarea: []
          };
          
          // 카테고리별 설정
          var categoryConfig = {
            campus: {
              color: '#2980b9',
              icon: 'fa-university',
              size: new kakao.maps.Size(32, 37)
            },
            convenience: {
              color: '#27ae60',
              icon: 'fa-store',
              size: new kakao.maps.Size(28, 33)
            },
            atm: {
              color: '#8e44ad',
              icon: 'fa-money-bill-alt',
              size: new kakao.maps.Size(28, 33)
            },
            parking: {
              color: '#e67e22',
              icon: 'fa-parking',
              size: new kakao.maps.Size(28, 33)
            },
            restaurant: {
              color: '#e74c3c',
              icon: 'fa-utensils',
              size: new kakao.maps.Size(28, 33)
            },
            admin: {
              color: '#34495e',
              icon: 'fa-building',
              size: new kakao.maps.Size(28, 33)
            },
            restarea: {
              color: '#7f8c8d',
              icon: 'fa-coffee',
              size: new kakao.maps.Size(28, 33)
            }
          };
          
          // SVG 마커 생성 함수
          function createMarkerImageSVG(color) {
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg width="32" height="37" viewBox="0 0 32 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.16344 0 0 7.16344 0 16C0 27.68 16 37 16 37C16 37 32 27.68 32 16C32 7.16344 24.8366 0 16 0Z" fill="' + color + '"/><circle cx="16" cy="16" r="8" fill="white"/></svg>');
          }
          
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
              
              // 제한 영역 표시
              var rectangle = new kakao.maps.Rectangle({
                bounds: bounds,
                strokeWeight: 2,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                fillColor: '#FF0000',
                fillOpacity: 0.1
              });
              // rectangle.setMap(map);
              
              // 마커 초기화
              initMarkers();
              
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
          
          // 마커 초기화 함수
          function initMarkers() {
            markers.forEach(markerData => {
              var markerPosition = new kakao.maps.LatLng(markerData.position.lat, markerData.position.lng);
              
              // 카테고리별 설정 적용
              var config = categoryConfig[markerData.category] || {
                color: '#2c3e50', 
                icon: 'fa-map-marker-alt',
                size: new kakao.maps.Size(28, 33)
              };
              
              // SVG 기반 마커 이미지 생성
              var markerImage = new kakao.maps.MarkerImage(
                createMarkerImageSVG(config.color),
                config.size
              );
              
              // 마커 생성
              var marker = new kakao.maps.Marker({
                position: markerPosition,
                image: markerImage,
                clickable: true
              });
              
              // 마커 클릭 이벤트 등록
              kakao.maps.event.addListener(marker, 'click', function() {
                // 마커 클릭 시 React Native에 이벤트 전달
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'markerClicked',
                  marker: markerData
                }));
                
                // 커스텀 오버레이 표시 또는 숨기기
                toggleOverlay(markerData.id);
              });
              
              // 마커 정보 저장
              markerObjects[markerData.id] = marker;
              
              // 카테고리별 마커 그룹에 추가
              categoryMarkers[markerData.category].push(marker);
              
              // 마커 위에 shortName 표시하는 라벨 오버레이 생성
              var labelContent = '<div class="markerLabel ' + markerData.category + '">' + 
                                '<i class="fas ' + config.icon + '"></i>' + 
                                markerData.shortName + '</div>';
              var labelOverlay = new kakao.maps.CustomOverlay({
                content: labelContent,
                position: markerPosition,
                yAnchor: 2.5,  // 마커 위에 표시
                zIndex: 1
              });
              
              // 라벨 오버레이 저장
              labelOverlays[markerData.id] = labelOverlay;
              
              // 상세 정보 오버레이 컨텐츠
              var infoContent = '<div class="customOverlay">' +
                            '<div class="title">' + markerData.fullName + '</div>' +
                            '<div class="desc">' + markerData.description + '</div>' +
                            '</div>';
              
              // 상세 정보 오버레이 생성
              var infoOverlay = new kakao.maps.CustomOverlay({
                content: infoContent,
                position: markerPosition,
                yAnchor: 1.5
              });
              
              // 오버레이 정보 저장
              overlays[markerData.id] = {
                overlay: infoOverlay,
                visible: false
              };
            });
          }
          
          // 오버레이 표시/숨기기 토글 함수
          function toggleOverlay(markerId) {
            if (overlays[markerId]) {
              var overlayInfo = overlays[markerId];
              if (overlayInfo.visible) {
                overlayInfo.overlay.setMap(null);
                overlayInfo.visible = false;
              } else {
                overlayInfo.overlay.setMap(map);
                overlayInfo.visible = true;
              }
            }
          }
          
          // 카테고리별 마커 표시 함수
          function showMarkersByCategory(category) {
            if (categoryMarkers[category]) {
              categoryMarkers[category].forEach(function(marker) {
                marker.setMap(map);
                
                // 해당 카테고리의 모든 마커에 대한 라벨도 표시
                markers.forEach(function(markerData) {
                  if (markerData.category === category && labelOverlays[markerData.id]) {
                    labelOverlays[markerData.id].setMap(map);
                  }
                });
              });
            }
          }
          
          // 카테고리별 마커 숨기기 함수
          function hideMarkersByCategory(category) {
            if (categoryMarkers[category]) {
              categoryMarkers[category].forEach(function(marker) {
                marker.setMap(null);
                
                // 해당 카테고리의 모든 마커에 대한 라벨과 오버레이 숨김
                markers.forEach(function(markerData) {
                  if (markerData.category === category) {
                    // 라벨 숨기기
                    if (labelOverlays[markerData.id]) {
                      labelOverlays[markerData.id].setMap(null);
                    }
                    
                    // 상세 정보 오버레이 숨기기
                    if (overlays[markerData.id] && overlays[markerData.id].visible) {
                      overlays[markerData.id].overlay.setMap(null);
                      overlays[markerData.id].visible = false;
                    }
                  }
                });
              });
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

    return (
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={onMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView 오류:", nativeEvent);
        }}
      />
    );
  }
);

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default KakaoMapView;
