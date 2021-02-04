//跨域代理前缀

// const API_PROXY_PREFIX='/sk-api'
const BASE_URL = process.env.VUE_APP_API_BASE_URL
module.exports = {
  LOGIN: `|${BASE_URL}|sysuser/login`,
  ROUTES: `${BASE_URL}sysuser/getInfo`,
  GOODS: `${BASE_URL}/goods`,
  GOODS_COLUMNS: `${BASE_URL}/columns`,
}
