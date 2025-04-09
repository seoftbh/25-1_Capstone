import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "@/constants";
import Constants from "expo-constants";

type WeatherData = {
  temperature: number;
  condition: string;
  icon: string;
};

const weatherEmojis: Record<string, string> = {
  Clear: "☀️ 맑음",
  Clouds: "☁️ 흐림",
  Rain: "🌧️ 비",
  Drizzle: "🌦️ 이슬비",
  Thunderstorm: "⛈️ 뇌우",
  Snow: "❄️ 눈",
  Mist: "🌫️ 옅은 안개",
  Fog: "🌫️ 짙은 안개",
  Haze: "🌫️ 연무",
  Dust: "😷 황사",
  Sand: "😷 모래바람",
  Smoke: "💨 연기",
  Tornado: "🌀 태풍",
  default: "🌡️ 날씨 정보 없음",
};

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);

        // 학교의 좌표(위도, 경도)
        const latitude = 35.1395;
        const longitude = 129.0986;

        // 환경 변수에서 API 키 가져오기
        const apiKey = Constants.expoConfig?.extra?.openWeatherApiKey;

        if (!apiKey) {
          throw new Error("API 키가 설정되지 않았습니다");
        }

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=kr`;
        console.log("API 요청 URL:", apiUrl.replace(apiKey, "API_KEY_HIDDEN"));

        const response = await fetch(apiUrl);

        console.log("API 응답 상태:", response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.text();
          console.error("API 오류 응답:", errorData);
          throw new Error(
            `날씨 정보를 가져오는데 실패했습니다. 상태 코드: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("날씨 데이터:", data);

        // 한국어로 날씨 상태 표시
        setWeatherData({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description, // 한글 날씨 설명
          icon: weatherEmojis[data.weather[0].main] || weatherEmojis.default,
        });
      } catch (err: any) {
        console.error("날씨 데이터 fetch 오류:", err);
        setError(err.message || "날씨 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.BROWN_800} />
        <Text style={styles.loadingText}>날씨 정보 로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.weatherEmoji}>🌡️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.weatherInnerContainer}>
      <Text style={styles.weatherText}>지금 학교 날씨는</Text>
        <Text style={styles.weatherEmoji}>{weatherData?.icon}</Text>
        <Text style={styles.temperatureText}>, {weatherData?.temperature}°C</Text>
        {/* <Text style={styles.conditionText}>{weatherData?.condition}</Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.GOLD_200,
    borderRadius: 16,
    paddingTop: 20,
    paddingBottom: 24,
    // marginHorizontal: 16,
    marginTop: 20,
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: colors.BROWN_300,
  },
  weatherInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  weatherEmoji: {
    fontSize: 20,
    fontWeight: "500",
    color: colors.BROWN_800,
    marginLeft: 12,
  },
  weatherText: {
    fontSize: 20,
    fontWeight: "500",
    color: colors.BROWN_800,
    // marginBottom: 4,
  },
  temperatureText: {
    fontSize: 20,
    fontWeight: "500",
    color: colors.BROWN_800,
    marginTop: 4,
  },
  conditionText: {
    fontSize: 16,
    color: colors.BROWN_500,
    // marginTop: 4,
  },
  loadingText: {
    fontSize: 14,
    color: colors.BROWN_500,
    // marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.RED_500,
    marginTop: 8,
    textAlign: "center",
  },
});

export default WeatherWidget;
