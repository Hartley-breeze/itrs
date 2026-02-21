import axios from 'axios'
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearToken } from '@/utils/storage'

// 环境配置：Vite 环境变量
const ENV = import.meta.env.MODE
const BASE_URL_MAP = {
  // 开发环境
  // development: 'http://localhost:21090/api/v1.0/itrs-api',
  development: 'http://localhost:21090/itrs',

  // 生产环境 - 云部署时，xxx替换成实际的云服务器IP地址
  // production: 'http://xxx:21090/api/v1.0/itrs-api',
  production: 'http://xxx:21090/itrs',
}

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL_MAP[ENV as keyof typeof BASE_URL_MAP] || BASE_URL_MAP.development,
  timeout: 30000, // 30秒超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 请求队列：存储请求标识和 AbortController
const pendingRequests = new Map<string, AbortController>()

/**
 * 生成请求唯一标识
 */
const generateReqKey = (config: AxiosRequestConfig): string => {
  const { method, url, params, data } = config
  return [
    method?.toUpperCase() || '',
    url || '',
    JSON.stringify(params || {}),
    JSON.stringify(data || {}),
  ].join('&')
}

/**
 * 添加请求到队列
 */
const addPendingRequest = (config: InternalAxiosRequestConfig): void => {
  const requestKey = generateReqKey(config)
  if (pendingRequests.has(requestKey)) {
    pendingRequests.get(requestKey)?.abort()
    pendingRequests.delete(requestKey)
  }

  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequests.set(requestKey, controller)
}

/**
 * 从队列移除请求
 */
const removePendingRequest = (config: InternalAxiosRequestConfig): void => {
  const requestKey = generateReqKey(config)
  if (pendingRequests.has(requestKey)) {
    pendingRequests.delete(requestKey)
  }
}

/**
 * 清空所有 pending 请求
 */
export const clearPendingRequests = (): void => {
  pendingRequests.forEach((controller) => controller.abort())
  pendingRequests.clear()
}

// 定义统一响应类型
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 扩展 AxiosRequestConfig 类型
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    addPendingRequest(config)

    // 添加 Token
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // GET 请求数组参数处理
    if (config.method === 'get' && config.params) {
      config.paramsSerializer = (params: Record<string, any>) => {
        return Object.keys(params)
          .map((key) => {
            const value = params[key]
            if (Array.isArray(value)) {
              return value
                .map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
                .join('&')
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          })
          .join('&')
      }
    }

    return config
  },
  (error: AxiosError): Promise<AxiosError> => {
    ElMessage.error('请求初始化失败')
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): ApiResponse['data'] => {
    removePendingRequest(response.config as InternalAxiosRequestConfig)

    const { data } = response
    const { code = 200, message = '请求成功' } = data

    // 业务状态码处理
    if (code !== 200) {
      if (code === 401) {
        clearToken()
        ElMessage.error('登录状态已过期，请重新登录')
        // 跳转登录页逻辑
        // window.location.href = '/login'
      } else {
        console.log('request error:', message || '请求失败')

        // ElMessage.error(message || '请求失败')
      }
      return Promise.reject(new Error(message || '请求失败'))
    }

    return data
  },
  (error: AxiosError): Promise<AxiosError> => {
    // 移除失败请求
    if (error.config) {
      removePendingRequest(error.config as InternalAxiosRequestConfig)
    }

    // 处理取消请求
    if (axios.isCancel(error)) {
      console.log('请求已取消：', error.message)
      return Promise.reject(new Error('请求已取消'))
    }

    // 请求超时处理
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      ElMessage.error('请求超时，请重试')
      return Promise.reject(error)
    }

    // HTTP 状态码处理
    const { response } = error
    let errorMsg = '网络连接异常'

    if (response) {
      switch (response.status) {
        case 400:
          errorMsg = '请求参数错误'
          break
        case 401:
          clearToken()
          errorMsg = '登录状态已过期，请重新登录'
          // 跳转登录页
          // window.location.href = '/login'
          break
        case 403:
          errorMsg = '拒绝访问'
          break
        case 404:
          errorMsg = `请求地址不存在: ${error.config?.url}`
          break
        case 500:
          errorMsg = '服务器内部错误'
          break
        case 503:
          errorMsg = '服务不可用'
          break
        default:
          errorMsg = `连接错误 ${response.status}`
      }
    } else if (error.request) {
      errorMsg = '网络连接失败，请检查网络'
    }
    console.error('request error:', errorMsg)
    // ElMessage.error(errorMsg)
    return Promise.reject(error)
  },
)

/**
 * 封装常用请求方法
 */
// GET 请求
export const get = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return request.get(url, { params, ...config })
}

// POST 请求
export const post = <T = any>(
  url: string,
  data?: Record<string, any> | FormData,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return request.post(url, data, config)
}

// PUT 请求
export const put = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return request.put(url, data, config)
}

// DELETE 请求
export const del = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return request.delete(url, { params, ...config })
}

// 文件上传封装
export const upload = <T = any>(
  url: string,
  file: File,
  onUploadProgress?: (progressEvent: any) => void,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)

  return request.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    ...config,
  })
}

// 下载文件
export const download = (
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<Blob> => {
  return request.get(url, {
    params,
    responseType: 'blob',
    ...config,
  })
}

export default request
