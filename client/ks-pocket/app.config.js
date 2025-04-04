const dotenv = require('dotenv');
dotenv.config();

// app.json의 내용을 가져와서 확장
const appJson = require('./app.json');

// 환경 변수를 extra 필드에 추가
module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      openaiApiKey: process.env.OPENAI_API_KEY,
      openaiAssistantId: process.env.OPENAI_ASSISTANT_ID,
      kakaoMapApiKey: process.env.KAKAO_MAP_API_KEY,
    }
  }
};