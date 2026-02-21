// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setLastVisitedPath } from "@/utils/storage"
import { authGuard } from './guards'

declare module 'vue-router' {
  interface RouteMeta {
    requireAuth?: boolean
    icon?: string
    iconType?: 'el' | 'custom'
    showInMenu?: boolean
    menuOrder?: number
    roles?: number[]
    keepAlive?: boolean
    breadcrumb?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Index.vue'),
    meta: {
      requireAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register/Index.vue'),
    meta: {
      requireAuth: false,
    },
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Home.vue'),
    meta: {
      requireAuth: true,
      roles: [1],
      showInMenu: false,
    },
    redirect: '/admin/dashboard', // 简化为直接重定向
    children: [
      {
        path: 'dashboard',
        name: '仪表盘',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: {
          requireAuth: true,
          showInMenu: true,
          menuOrder: 1,
          icon: 'DataBoard',
          iconType: 'el',
          breadcrumb: true,
          roles: [1],
          keepAlive: true
        }
      },
      {
        path: 'user-manage',
        name: '用户管理',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: {
          requireAuth: true,
          showInMenu: true,
          menuOrder: 2,
          icon: 'User',
          iconType: 'el',
          breadcrumb: true,
          roles: [1],
          keepAlive: true
        }
      },
    ]
  },
  {
    path: '/user',
    component: () => import('@/views/user/UserHome.vue'),
    meta: {
      requireAuth: true,
      roles: [2],
      showInMenu: false,
    },
    redirect: '/user/user-main', // 简化为直接重定向
    children: [
      {
        path: 'user-main',
        name: '用户首页',
        component: () => import('@/views/user/UserMain.vue'),
        meta: {
          requireAuth: true,
          showInMenu: true,
          menuOrder: 1,
          icon: 'HomeFilled',
          iconType: 'el',
          breadcrumb: true,
          roles: [2],
          keepAlive: true
        }
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由全局前置守卫 - 权限验证
router.beforeEach((to, from, next) => {
  console.log('🚀 Router beforeEach - from:', from.path, 'to:', to.path)
  const result = authGuard(to)
  if (result === true) {
    next()
  } else {
    console.log('🔀 Router redirecting to:', result)
    next(result)
  }
})

// 路由守卫 - 记录访问路径
router.afterEach((to) => {
  console.log('✅ Route changed to:', to.fullPath)
  if (to.meta.requireAuth) {
    setLastVisitedPath(to.fullPath)
  }
})

export default router