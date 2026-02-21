// 用户基础信息
export interface User {
  id?: number
  account: string
  username: string
  password?: string
  avatar?: string
  email?: string
  role: number
  gender: number
  phone?: string
  birthday?: string
  createTime?: string
  lastLoginTime?: string
  loginStatus?: boolean
  speakStatus?: boolean
}

// 用户密码修改DTO
export interface UserUpdatePasswordDTO {
  againPassword?: string
  newPassword?: string
  oldPassword?: string
}

// 用户查询参数
export interface UserQueryDto {
  current: number
  size: number
  role?: number | null
  username?: string | null
}

// 用户状态更新参数
export interface UserStatusUpdateDto {
  id: number
  loginStatus?: boolean
  speakStatus?: boolean
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  total?: number
}

// 用户列表响应
export interface UserListResponse extends ApiResponse<User[]> {
  total: number
}