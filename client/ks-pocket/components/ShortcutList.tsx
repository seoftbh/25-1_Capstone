// screens/ShortcutListScreen.tsx
import React from "react";
import { ScrollView } from "react-native";
import ShortcutItem from "../components/ShortcutItem";

export default function ShortcutList() {
  return (
    <ScrollView>
      <ShortcutItem
        iconName="home-outline"
        title="홈페이지"
        url="https://example.com"
      />
      <ShortcutItem
        iconName="newspaper-outline"
        title="공지사항"
        url="https://github.com"
      />
      <ShortcutItem
        iconName="calendar-outline"
        title="일정"
        url="mailto:test@example.com"
      />
    </ScrollView>
  );
}
