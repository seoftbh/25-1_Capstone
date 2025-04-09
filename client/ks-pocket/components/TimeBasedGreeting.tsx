import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { commonStyles } from "@/constants/CommonStyles";
import { colors } from "@/constants";
import { View } from "react-native";

interface GreetingMessage {
  text: string;
  subtext: string;
}

const TimeBasedGreeting = () => {
  const [greeting, setGreeting] = useState<GreetingMessage>({
    text: "",
    subtext: "",
  });

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      let message: GreetingMessage;

      if (currentHour >= 6 && currentHour < 9) {
        message = {
          text: "좋은 아침이에요! 🌞",
          subtext: "오늘도 힘찬 하루 시작해봐요!",
        };
      } else if (currentHour >= 9 && currentHour < 12) {
        message = {
          text: "좋은 오전이에요! ☕",
          subtext: "오늘 할 일, 차근차근 완성해봐요.",
        };
      } else if (currentHour >= 12 && currentHour < 18) {
        message = {
          text: "좋은 오후예요! 🏙️",
          subtext: "남은 시간도 힘내봐요!",
        };
      } else if (currentHour >= 18 && currentHour < 21) {
        message = {
          text: "오늘 하루 수고 많았어요! 🌇",
          subtext: "따뜻한 저녁시간 보내봐요.",
        };
      } else {
        message = {
          text: "오늘도 수고 많았어요. 🌙",
          subtext: "편안한 밤 보내고, 내일 또 만나요!",
        };
      }

      setGreeting(message);
    };

    // Update greeting immediately
    updateGreeting();

    // Set up an interval to update the greeting every minute
    const intervalId = setInterval(updateGreeting, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.mainText}>{greeting.text}</Text>
      <Text style={styles.subtitleText}>{greeting.subtext}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: "100%",
    // margin:32,
    padding: 16,
    // backgroundColor: 'pink',
  },
  mainText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.GRAY_900,
  },
  subtitleText: {
    fontSize: 16,
    marginTop: 8,
    color: colors.GRAY_600,
    fontWeight: "500",
  },
});

export default TimeBasedGreeting;
