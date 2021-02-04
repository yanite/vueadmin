/**
 * 使用AES加密工具类
 */
import CryptoJS from 'crypto-js'

/**
 * 用户角色工具
 */
const user = {}

export default {
  user,
  setUser(para) {
    this.user = para
  },

  // MD5加密
  MD5(str) {
    return CryptoJS.MD5(str).toString()
  },
  // 加密
  encrypt(word, keyStr) {
    keyStr = keyStr || 'abcdefgabcdefg12'
    var key = CryptoJS.enc.Utf8.parse(keyStr) // Latin1 w8m31+Yy/Nw6thPsMpO5fg==
    var srcs = CryptoJS.enc.Utf8.parse(word)
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
  },
  // 解密
  decrypt(word, keyStr) {
    keyStr = keyStr || 'abcdefgabcdefg12'
    var key = CryptoJS.enc.Utf8.parse(keyStr) // Latin1 w8m31+Yy/Nw6thPsMpO5fg==
    var decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Utf8.stringify(decrypt).toString()
  },
  getUser() {
    const sessionUser = sessionStorage.getItem('sessionUser')
    let sessionUserValue = this.decrypt(sessionUser, null)
    sessionUserValue = JSON.parse(sessionUserValue)
    return sessionUserValue
  },
  setData(key, value) {
    sessionStorage.setItem(key, this.encrypt(JSON.stringify(value, null)))
  },
  getData(key) {
    let value = this.decrypt(sessionStorage.getItem(key), null)
    value = JSON.parse(value)
    return value
  }

}
