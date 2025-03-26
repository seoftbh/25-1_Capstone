import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors } from "@/constants";
import {
  Ionicons as IonIcons,
} from "@expo/vector-icons";
import CustomTabBarButton from "./CustomTabBarButton";

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {/* 왼쪽 탭들: 버스와 지도 */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate("bus")}
      >
        <IonIcons
          name={state.index === 1 ? "bus" : "bus-outline"}
          size={24}
          color={state.index === 1 ? colors.GOLD_700 : "#8E8E93"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: state.index === 1 ? colors.GOLD_700 : "#8E8E93" },
          ]}
        >
          버스
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate("map")}
      >
        <IonIcons
          name={state.index === 2 ? "map" : "map-outline"}
          size={24}
          color={state.index === 2 ? colors.GOLD_700 : "#8E8E93"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: state.index === 2 ? colors.GOLD_700 : "#8E8E93" },
          ]}
        >
          지도
        </Text>
      </TouchableOpacity>

      {/* 중앙 홈 버튼 */}
      <View style={styles.centerButtonContainer}>
        <CustomTabBarButton 
          onPress={() => {
            console.log("Home 버튼 클릭"); // 디버깅용 로그
            navigation.navigate("index");
          }} 
        />
      </View>

      {/* 오른쪽 탭들: 게시판과 더보기 */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate("board")}
      >
        <IonIcons
          name={state.index === 3 ? "create" : "create-outline"}
          size={24}
          color={state.index === 3 ? colors.GOLD_700 : "#8E8E93"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: state.index === 3 ? colors.GOLD_700 : "#8E8E93" },
          ]}
        >
          게시판
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate("more")}
      >
        <IonIcons
          name={
            state.index === 4
              ? "ellipsis-horizontal-circle-sharp"
              : "ellipsis-horizontal-circle"
          }
          size={24}
          color={state.index === 4 ? colors.GOLD_700 : "#8E8E93"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: state.index === 4 ? colors.GOLD_700 : "#8E8E93" },
          ]}
        >
          더보기
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 68,
    backgroundColor: "white",
    borderTopWidth: 0,
    paddingTop: 6,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});