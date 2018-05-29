import axios from "axios/index"

axios.defaults.params = {
  key: 'B8mAIlIGEMbj5JJx',
  secret: 'gOGBmowv6I9M483GgphZL0GpMRJSBsqR',
};
axios.defaults.baseURL = 'http://livescore-api.com/api-client/'

export * from "./handlers/fixtures"
export * from "./handlers/livescores"
