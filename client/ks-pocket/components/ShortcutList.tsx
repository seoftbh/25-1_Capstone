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
        iconName="logo-github"
        title="GitHub"
        url="https://github.com"
      />
      <ShortcutItem
        iconName="mail-outline"
        title="이메일"
        url="mailto:test@example.com"
      />
      <ShortcutItem
        iconName="call-outline"
        title="전화 걸기"
        url="tel:01012345678"
      />
    </ScrollView>
  );
}
