//跨域代理前缀

// const API_PROXY_PREFIX='/sk-api'
const BASE_URL = process.env.VUE_APP_API_BASE_URL
module.exports = {
  LOGIN: `sysuser/login`,
  ROUTES: `sysuser/login`,
  GOODS: `goods`,
  GOODS_COLUMNS: `columns`,
}
