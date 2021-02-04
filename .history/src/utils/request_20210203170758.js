import axios from 'axios'
import Cookie from 'js-cookie'
import { message } from 'ant-design-vue';
// 跨域认证信息 header 名
const xsrfHeaderName = 'Authorization'

axios.defaults.timeout = 5000
axios.defaults.withCredentials = true
axios.defaults.xsrfHeaderName = xsrfHeaderName
axios.defaults.xsrfCookieName = xsrfHeaderName
const axiosConfig = {
  baseURL: process.env.VUE_APP_SERVER_API,
  timeout: 1000,
  withCredentials: true,
  headers: {'X-Custom-Header': 'foobar',clientType: 'WEB',}
}
// create an axios instance
const service = axios.create(axiosConfig)

// request interceptor
service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers[ 'clientType' ] = 'WEB'
    config.headers[ 'token' ] = localStorage.token
  }
  return config
})

  
// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (res.code !== 0) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    if (error.response.data.code === 401) {
      Message({
        message: error.response.data.msg + ',请重新登录',
        type: 'error',
        duration: 2 * 1000
      })
      // store.dispatch('user/logout')
      // setTimeout(() => {
        // router.push('/login')
      // }, 2000)
    } else {
      Message({
        message: error,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }
  }
)

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */
const get = function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(process.env.VUE_APP_SERVER_API + url, {
      params: params,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'clientType': 'WEB'
      }
    })
      .then(response => {
        if (response.data.code !== 0) {
          Message({
            message: response.data.msg || 'Error',
            type: 'error',
            duration: 5 * 1000
          })
        }
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

// /**
//  * 封装post请求
//  * @param url
//  * @param data
//  * @returns {Promise}
//  */
const post = function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.post(process.env.VUE_APP_SERVER_API + url, data,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'clientType': 'WEB'
        }

      }).then(response => {
      if (response.data.code !== 0) {
        this.$nodify({
          message: response.data.msg || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
      }
      resolve(response.data)
    }, err => {
      reject(err)
    })
  })
}

const getBinary = function getBinary(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(process.env.VUE_APP_SERVER_API + url, {
      params: params,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'clientType': 'WEB'
      },
      responseType: 'blob'
    }).then(response => {
      // resolve(response.data)
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' })
      const downloadElement = document.createElement('a')
      const href = window.URL.createObjectURL(blob)
      downloadElement.href = href
      downloadElement.download = 'rate.xls'
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement) // 下载完成移除元素
      window.URL.revokeObjectURL(href) // 释放掉blob对象
    }, err => {
      reject(err)
    })
  })
}

const getBinaryByPost = function getBinaryByPost(url, data) {
  return new Promise((resolve, reject) => {
    axios.post(process.env.VUE_APP_SERVER_API + url, data, { responseType: 'blob' }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      let filename = '下载文件.xls'
      try {
        filename = decodeURIComponent(response.headers['content-disposition'].split('=')[1])
      } catch (error) {
        console.log(error)
      }
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
    }, err => {
      reject(err)
    })
  })
}

const uploadFile = function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.post(process.env.VUE_APP_SERVER_API + url, data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'clientType': 'WEB'
        }
      }).then(response => {
      resolve(response.data)
    }, err => {
      reject(err)
    })
  })
}


// 认证类型
const AUTH_TYPE = {
  BEARER: 'Bearer',
  BASIC: 'basic',
  AUTH1: 'auth1',
  AUTH2: 'auth2',
}

// http method
const METHOD = {
  GET: 'get',
  POST: 'post',
}

/**
 * axios请求
 * @param url 请求地址
 * @param method {METHOD} http method
 * @param params 请求参数
 * @returns {Promise<AxiosResponse<T>>}
 */
async function request( url, method, params, config ) {
  const cfg = Object.assign( axiosConfig, config )
  console.log(cfg)
  switch (method) {
    case METHOD.GET:
      return axios.get(url, { params, ...cfg })
    case METHOD.POST:
      return axios.post(url, params, cfg)
    default:
      return axios.get(url, { params, ...cfg })
  }
}

/**
 * 设置认证信息
 * @param auth {Object}
 * @param authType {AUTH_TYPE} 认证类型，默认：{AUTH_TYPE.BEARER}
 */
function setAuthorization(auth, authType = AUTH_TYPE.BEARER) {
  switch (authType) {
    case AUTH_TYPE.BEARER:
      Cookie.set(xsrfHeaderName, 'Bearer ' + auth.token, {
        expires: auth.expireAt,
      })
      break
    case AUTH_TYPE.BASIC:
    case AUTH_TYPE.AUTH1:
    case AUTH_TYPE.AUTH2:
    default:
      break
  }
}

/**
 * 移出认证信息
 * @param authType {AUTH_TYPE} 认证类型
 */
function removeAuthorization(authType = AUTH_TYPE.BEARER) {
  switch (authType) {
    case AUTH_TYPE.BEARER:
      Cookie.remove(xsrfHeaderName)
      break
    case AUTH_TYPE.BASIC:
    case AUTH_TYPE.AUTH1:
    case AUTH_TYPE.AUTH2:
    default:
      break
  }
}

/**
 * 检查认证信息
 * @param authType
 * @returns {boolean}
 */
function checkAuthorization(authType = AUTH_TYPE.BEARER) {
  switch (authType) {
    case AUTH_TYPE.BEARER:
      if (Cookie.get(xsrfHeaderName)) {
        return true
      }
      break
    case AUTH_TYPE.BASIC:
    case AUTH_TYPE.AUTH1:
    case AUTH_TYPE.AUTH2:
    default:
      break
  }
  return false
}

/**
 * 加载 axios 拦截器
 * @param interceptors
 * @param options
 */
function loadInterceptors(interceptors, options) {
  const { request, response } = interceptors
  // 加载请求拦截器
  request.forEach((item) => {
    let { onFulfilled, onRejected } = item
    if (!onFulfilled || typeof onFulfilled !== 'function') {
      onFulfilled = (config) => config
    }
    if (!onRejected || typeof onRejected !== 'function') {
      onRejected = (error) => Promise.reject(error)
    }
    axios.interceptors.request.use(
      (config) => onFulfilled(config, options),
      (error) => onRejected(error, options)
    )
  })
  // 加载响应拦截器
  response.forEach((item) => {
    let { onFulfilled, onRejected } = item
    if (!onFulfilled || typeof onFulfilled !== 'function') {
      onFulfilled = (response) => response
    }
    if (!onRejected || typeof onRejected !== 'function') {
      onRejected = (error) => Promise.reject(error)
    }
    axios.interceptors.response.use(
      (response) => onFulfilled(response, options),
      (error) => onRejected(error, options)
    )
  })
}

/**
 * 解析 url 中的参数
 * @param url
 * @returns {Object}
 */
function parseUrlParams(url) {
  const params = {}
  if (!url || url === '' || typeof url !== 'string') {
    return params
  }
  const paramsStr = url.split('?')[1]
  if (!paramsStr) {
    return params
  }
  const paramsArr = paramsStr.replace(/&|=/g, ' ').split(' ')
  for (let i = 0; i < paramsArr.length / 2; i++) {
    const value = paramsArr[i * 2 + 1]
    params[paramsArr[i * 2]] =
      value === 'true' ? true : value === 'false' ? false : value
  }
  return params
}

export {
  post,
  get,
  getBinary,
  getBinaryByPost,
  uploadFile,
  METHOD,
  AUTH_TYPE,
  request,
  setAuthorization,
  removeAuthorization,
  checkAuthorization,
  loadInterceptors,
  parseUrlParams,
}
