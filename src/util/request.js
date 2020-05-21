// 1. 引入 axios
import axios from 'axios'
// 2. 创建axios对象，配置默认配置
const httpRequest = axios.create({
  baseURL: 'http://localhost:8299/', // api的base_url
  timeout: 15000 // 请求超时时间

})
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// 3. 创建 request拦截器
httpRequest.interceptors.request.use(config => {
  return config
}, error => {
  Promise.reject(error)
})

// 4. 创建response 拦截器
httpRequest.interceptors.response.use(response => response, error => {
  console.log('httpRequest:', error)
  if (error && error.response) {
    switch (error.response.status) {
      case 400:
        error.message = '请求错误'
        break

      case 403:
        error.message = '权限不足,请联系管理员'
        break

      case 404:
        error.message = `请求地址出错: ${error.response.config.url}`
        break

      case 500:
        error.message = error.response.data.errorMsg
        break

      default:
        error.message = '服务器内部错误'
    }
  }
  return Promise.reject(error)
})
// 5. 导入
export default httpRequest
