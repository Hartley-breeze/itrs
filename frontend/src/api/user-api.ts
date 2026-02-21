import { post, put, del } from '@/utils/request'
import type { User, UserQueryDto, UserStatusUpdateDto,UserUpdatePasswordDTO, UserListResponse, ApiResponse } from '@/types/user'

// 查询用户列表
export const queryUsers = (params: UserQueryDto): Promise<UserListResponse> => {
  return post<UserListResponse>('/user/query', params)
}

// 新增用户
export const saveUser = (user: Partial<User>): Promise<ApiResponse> => {
  return post<ApiResponse>('/user/save', user)
}

// 更新用户信息
export const updateUser = (user: Partial<User>): Promise<ApiResponse> => {
  return put<ApiResponse>('/user/validUpdate', user)
}

// 删除用户
export const delUser = (id: number): Promise<ApiResponse> => {
  return del<ApiResponse>(`/user/${id}`)
}

// 更新用户状态
export const updateUserStatus = (params: UserStatusUpdateDto): Promise<ApiResponse> => {
  return put<ApiResponse>('/user/status', params)
}

// 修改密码
export const updatePasswordApi = (params: UserUpdatePasswordDTO): Promise<ApiResponse> => {
  return put<ApiResponse>('/user/updatePassword', params)
}