/**
|--------------------------------------------------
| FeedList Component
|--------------------------------------------------
*/

import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import FeedItem from "./FeedItem";
import { colors } from "@/constants";

////////////////////////////////////////////////////////////
const dummyData = [
  {
    id: 1,
    userId: 1,
    title: "온관 다송지빓는다!",
    description:
      "몰언솔꼴고 아소울마길다 싀나죈 홍좀잔다 느사헤한르울은. 용긴일멜고 려오아 오즈고 디반헐호아 바대로써. 겨오맘 이오고 마려던 옺셔인롸는 클발선 순몹워다 느바자초아서 인다하변마 놔마를 하씬시 붐으사. 픙으면서 끼오드오구비의 지지잉으는 상마드기다 손있아밚게 딘쳼반숬으요흰고 오드다. 때대라도 디그라녀아뇬 소헐킨긱하등다 즛업짐뇐에 딤기하아흔어 이벛달노잔을 솔일날아 족흐를 으간러마 어깬이다. 지악 컥바간 마겔가역오겐기 반친이 던쟈고 히사비가 짜겅을까. 교산냄순는 고엑재섬벼미로 우이 기륜 다으읻어야 호랜만 방나랐일릇고이 듬으비핬아야 둔틔 산재를 횼난중게가. 갈바슌삼는 있즌각슥다 에잠 멩어움녹께서, 갱어즈그는 오족훴그키를 히헸새초 딨거의 저아으. 큰디어 자닾저 나임오로턴온은 탕롤가다 기재무가 단죠구도다.",
    createdAt: "2025-03-25T00:00:00.000Z",
    author: {
      id: 1,
      nickname: "nickname",
      imageUri: "https://placehold.co/150/hotpink/white.png",
    },
    imageUris: [],
    likes: [],
    hasVote: false,
    voteCount: 1,
    commentCount: 1,
    viewCount: 1,
  },
  {
    id: 2,
    userId: 1,
    title: "비픈고 인펀일사는 자옹인",
    description:
      "어기트과엠눌르도. 객긴덴쿠 릴짭알이나 으여르뢰디가 오기긴에구샀 외아몬도 그괸데 퐝너드먼 만구오일. 다니았아은자 시맀히는 가하벘너가 론존을 그보념쟐을 매피시힉는 다아곤이 곰래의 아린디긔는 조은엘다. 흡리웅따듯이 겨애흣공다 즈으템어야 농마를 디가비낭으로 툐여한을. 입런내상흐 허잭신습니다 니사구깅생의 둭아손터를 안다뜨다 프쵸레굏을 차오둈맹을 오둬익운짬. 됴태민의 으호후연을 나니궈노다 스온갈호난기우카아 김뎀하 쁘노 르헝의 이엉주루게, 기툰 라언사.",
    createdAt: "2025-03-25T00:00:00.000Z",
    author: {
      id: 1,
      nickname: "nickname",
      imageUri: "",
    },
    imageUris: [],
    likes: [],
    hasVote: false,
    voteCount: 1,
    commentCount: 1,
    viewCount: 1,
  },
];
////////////////////////////////////////////////////////////

function FeedList() {
  return (
    <FlatList
      data={dummyData}
      renderItem={({ item }) => <FeedItem post={item} />}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    // paddingVertical: 12,
    // backgroundColor: colors.GRAY_100,
    gap: 12,
  },
});

export default FeedList;
