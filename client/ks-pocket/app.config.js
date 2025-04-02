const dotenv = require('dotenv');
dotenv.config();

// app.json의 내용을 가져와서 확장합니다
const appJson = require('./app.json');

// 환경 변수를 extra 필드에 추가
module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      openaiApiKey: process.env.OPENAI_API_KEY,
    }
  }
};