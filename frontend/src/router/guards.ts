// router/guards.ts
import { type RouteLocationNormalized } from 'vue-router'
import { getToken, getRole } from '@/utils/storage'

export const authGuard = (to: RouteLocationNormalized) => {
  const token = getToken()
  const role = getRole()
  
  console.log('🛡️ Auth Guard Check:', { 
    path: to.path, 
    requireAuth: to.meta.requireAuth,
    requiredRoles: to.meta.roles,
    userRole: role,
    hasToken: !!token 
  })

  // 不需要认证的路由直接放行
  if (!to.meta.requireAuth) {
    console.log('✅ No auth required')
    return true
  }

  // 需要认证但无token，跳转到登录页
  if (!token) {
    console.log('❌ No token, redirect to login')
    return '/login'
  }

  // 检查角色权限 - 修复逻辑
  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRole = Number(role)
    
    // 检查当前路由是否允许用户角色访问
    const hasPermission = to.meta.roles.includes(userRole)
    
    console.log('🔑 Role Check:', { 
      userRole, 
      requiredRoles: to.meta.roles, 
      hasPermission 
    })
    
    if (!hasPermission) {
      console.log('🚫 Role permission denied, redirecting based on user role')
      // 根据用户实际角色重定向
      if (userRole === 1) {
        return '/admin/dashboard'
      } else if (userRole === 2) {
        return '/user/user-main'
      } else {
        return '/login'
      }
    }
  }

  console.log('✅ Auth passed')
  return true
}