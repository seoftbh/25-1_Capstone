// screens/ShortcutListScreen.tsx
import React from "react";
import { ScrollView, View } from "react-native";
import ShortcutItem from "../components/ShortcutItem";

export default function ShortcutList() {
  return (
    <View>
      <ShortcutItem
        iconName="home"
        title="홈페이지"
        url="https://kscms.ks.ac.kr/kor/Main.do"
      />
      <ShortcutItem
        iconName="calendar"
        title="학사일정"
        url="https://kscms.ks.ac.kr/haksa/CMS/HaksaScheduleMgr/list.do"
      />
      <ShortcutItem
        iconName="information-circle"
        title="학사정보"
        url="https://kscms.ks.ac.kr/haksa/Main.do"
      />
      <ShortcutItem
        iconName="globe"
        title="학생포털"
        url="https://portal.ks.ac.kr"
      />
      <ShortcutItem
        iconName="school"
        title="장학정보"
        url="https://kscms.ks.ac.kr/kor/CMS/Board/Board.do?mCode=MN094"
      />
      <ShortcutItem
        iconName="briefcase"
        title="취업정보"
        url="https://kscms.ks.ac.kr/kor/CMS/Board/Board.do?mCode=MN095"
      />
      <ShortcutItem
        iconName="megaphone"
        title="교내소식"
        url="https://kscms.ks.ac.kr/kor/CMS/Board/Board.do?mCode=MN091"
      />
      <ShortcutItem
        iconName="newspaper"
        title="경성뉴스"
        url="https://kscms.ks.ac.kr/welcome/CMS/Board/Board.do?mCode=MN083"
      />
      <ShortcutItem
        iconName="map"
        title="캠퍼스 지도"
        url="https://kscms.ks.ac.kr/kor/CMS/CampusMgr/list.do?mCode=MN041"
      />
      <ShortcutItem
        iconName="globe"
        title="교내 사이트"
        url="https://kscms.ks.ac.kr/kor/CMS/SiteLink/list.do?mCode=MN120"
      />
      <ShortcutItem
        iconName="call"
        title="교내 전화번호"
        url="https://kscms.ks.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN040"
      />
    </View>
  );
}
