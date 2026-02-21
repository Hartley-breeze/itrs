<!-- views/admin/Home.vue -->
<template>
  <div class="admin-layout">
    <!-- 左侧菜单 -->
    <div class="sidebar" :style="{ width: sidebarWidth + 'px' }" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <!-- logo -->
        <img src="/logo.png" alt="">
        <h2 v-if="!isCollapsed">TravelGuide</h2>
      </div>
      <div class="sidebar-menu">
        <ul class="nav-list">
          <li v-for="route in menuRoutes" :key="route.path" :class="{ active: currentRoute === route.path }"
            @click="$router.push(route.path)" :title="isCollapsed ? (route.name as string) : undefined">
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <span v-if="!isCollapsed">{{ route.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 拖拽条 -->
    <div class="drag-bar" @mousedown="startDrag" @dblclick="toggleCollapse"></div>

    <!-- 右侧内容区域 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="header">
        <div class="header-left">
          <el-breadcrumb separator="">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="item.path">
              <span class="path-name" v-if="index === breadcrumbList.length - 1">
                {{ item.meta?.title || item.name }}
              </span>
              <router-link v-else :to="item.path">
                {{ item.meta?.title || item.name }}
              </router-link>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand" class="custom-dropdown">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo?.avatar" />
              <span class="username">{{ userInfo?.username || '管理员' }}</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="content">
        <router-view />
      </div>
    </div>

    <el-dialog title="修改信息" v-model="dialogProfileVisible" width="500px" :close-on-click-modal="false">
      <el-form :model="updateUserInfo" label-width="80px" ref="formRef">
        <el-form-item label="头像">
          <div class="avatar-upload-container">
            <el-avatar :size="80" :src="updateUserInfo.avatar" />
            <el-upload class="avatar-uploader" action="http://localhost:21090/itrs/file/upload" :show-file-list="false"
              :on-success="handleImageSuccess">
              <el-button type="primary" size="small">
                <el-icon>
                  <Upload />
                </el-icon>
                上传头像
              </el-button>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="账号" prop="account">
          <el-input style="width: 90%" v-model="updateUserInfo.account" placeholder="请输入账号" :disabled="true" />
          <div class="tip-text">
            账号一经注册，不可修改
          </div>
        </el-form-item>

        <el-form-item label="昵称" prop="username">
          <el-input style="width: 90%" v-model="updateUserInfo.username" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="updateUserInfo.gender">
            <el-radio :label="1">女</el-radio>
            <el-radio :label="2">男</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input style="width: 90%" v-model="updateUserInfo.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input style="width: 90%" v-model="updateUserInfo.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="生日">
          <el-date-picker :value-format="'YYYY-MM-DD'" v-model="updateUserInfo.birthday" type="date" placeholder="选择生日"
            style="width: 90%" />
        </el-form-item>

      </el-form>

      <template #footer>
        <div style="display: flex;justify-content: center;align-items: center;margin-bottom: 20px;">
          <el-button round @click="dialogProfileVisible = false">取消</el-button>
          <el-button icon="CircleCheckFilled" round type="primary" @click="handleConfirm">
            确定修改
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { get, put } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import {
  getLastVisitedPath,
  clearLastVisitedPath,
  clearToken,
  clearRole,
  clearUserInfo,
  getSidebarWidth,
  setSidebarWidth,
  getSidebarCollapsed,
  setSidebarCollapsed
} from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 侧边栏宽度控制 - 从缓存读取或使用默认值
const DEFAULT_WIDTH = 118
const COLLAPSED_WIDTH = 80  // 最小宽度变更为80px
const MIN_WIDTH = 80        // 最小宽度变更为80px
const MAX_WIDTH = 188

// 响应式数据
const sidebarWidth = ref(getSidebarWidth() || DEFAULT_WIDTH)
const isCollapsed = ref(getSidebarCollapsed() || false)
const isDragging = ref(false)
const dialogProfileVisible = ref(false)
const updateUserInfo = reactive({
  avatar: '',
  account: '',
  username: '',
  gender: null,
  email: '',
  phone: '',
  birthday: null
})

// 监听折叠状态变化
watch(isCollapsed, (newVal) => {
  if (newVal) {
    sidebarWidth.value = COLLAPSED_WIDTH
  } else {
    sidebarWidth.value = DEFAULT_WIDTH
  }
  setSidebarCollapsed(newVal)
  setSidebarWidth(sidebarWidth.value)
})

const handleImageSuccess = (response: any) => {
  if (response.code === 200) {
    updateUserInfo.avatar = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

const handleConfirm = async () => {
  try {
    await put('/user', updateUserInfo)
    userStore.setUserInfo(updateUserInfo)
    dialogProfileVisible.value = false;
    ElMessage.success('个人信息修改成功')
  } catch (error: any) {
    ElMessage.error(error.message || '认证失败')
  }
}

// 用户信息 - 从 store 获取
const userInfo = computed(() => userStore.userInfo)

const profile = () => {
  Object.assign(updateUserInfo, {
    ...userStore.userInfo
  })
  dialogProfileVisible.value = true
}

// 认证获取用户信息
const fetchUserAuth = async () => {
  try {
    const response = await get('/user/auth')
    if (response.code === 200) {
      userStore.setUserInfo(response.data)
    } else {
      ElMessage.error(response.message || '认证失败')
      router.push('/login')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '认证请求失败')
    router.push('/login')
  }
}

// 获取菜单路由
const menuRoutes = computed(() => {
  const routes = router.getRoutes()

  const filteredRoutes = routes.filter(route => {
    const hasMenu = route.meta?.showInMenu
    const hasRole = route.meta?.roles?.includes(1)
    const isAdminRoute = route.path.startsWith('/admin/') && route.path !== '/admin'

    return hasMenu && hasRole && isAdminRoute
  })

  return filteredRoutes.sort((a, b) => (a.meta.menuOrder || 99) - (b.meta.menuOrder || 99))
})

// 当前路由
const currentRoute = computed(() => route.path)

// 面包屑
const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta?.breadcrumb !== false)
  return matched.map(item => ({
    path: item.path,
    name: item.name as string,
    meta: item.meta
  }))
})

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 拖拽功能
const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true

  // 禁用文本选择
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'

  const startX = e.clientX
  const startWidth = sidebarWidth.value

  const doDrag = (moveEvent: MouseEvent) => {
    if (!isDragging.value) return

    const deltaX = moveEvent.clientX - startX
    let newWidth = startWidth + deltaX

    // 限制宽度范围
    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH
    if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH

    sidebarWidth.value = newWidth

    // 自动切换折叠状态
    if (newWidth <= MIN_WIDTH) {
      isCollapsed.value = true
    } else if (newWidth > MIN_WIDTH + 20) { // 添加一些迟滞防止抖动
      isCollapsed.value = false
    }
  }

  const stopDrag = () => {
    if (!isDragging.value) return

    isDragging.value = false

    // 恢复文本选择
    document.body.style.userSelect = ''
    document.body.style.cursor = ''

    // 保存宽度到缓存
    setSidebarWidth(sidebarWidth.value)

    document.removeEventListener('mousemove', doDrag)
    document.removeEventListener('mouseup', stopDrag)
  }

  document.addEventListener('mousemove', doDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 用户操作
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      profile()
      break
    case 'logout':
      await handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 清除本地存储
    clearToken()
    clearRole()
    clearUserInfo()
    clearLastVisitedPath()

    // 跳转到登录页
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch {
    // 用户取消操作
  }
}

// 组件挂载时
onMounted(async () => {
  // 初始化折叠状态
  const savedWidth = getSidebarWidth()
  if (savedWidth && savedWidth <= MIN_WIDTH) {
    isCollapsed.value = true
  }

  // 先进行用户认证
  await fetchUserAuth()

  const lastPath = getLastVisitedPath()

  // 如果当前在 /admin 路径，尝试重定向
  if (route.path === '/admin') {
    const validLastPath = lastPath &&
      lastPath !== '/' &&
      lastPath !== '/login' &&
      lastPath !== '/register' &&
      lastPath.startsWith('/admin/')

    const redirectPath = validLastPath ? lastPath : '/admin/dashboard'
    console.log('Admin redirecting to:', redirectPath)
    router.push(redirectPath)
  }
})

// 确保清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', () => { })
  document.removeEventListener('mouseup', () => { })

  // 恢复文本选择（安全措施）
  document.body.style.userSelect = ''
  document.body.style.webkitUserSelect = ''
  document.body.style.cursor = ''
})
</script>

<style scoped lang="scss">
.nav-list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 20px;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    cursor: pointer;
    color: #333;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background-color: rgb(240, 240, 240);
      color: #333;
    }

    .el-icon {
      font-size: 20px;
      flex-shrink: 0;
      transition: margin 0.2s ease;
    }

    span {
      transition: opacity 0.2s ease;
    }
  }
}

// 折叠状态下的样式
.sidebar.collapsed {
  .nav-list li {
    justify-content: center;
    padding: 0 10px;

    .el-icon {
      margin: 0 10px; // 图标设置左右外边距10px
    }

    span {
      opacity: 0;
      width: 0;
    }
  }

  .sidebar-header {
    justify-content: center;
    padding: 15px 10px;

    h2 {
      display: none;
    }

    img {
      margin: 0 auto; // logo居中
      display: block;
    }
  }
}

.avatar-upload-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.path-name {
  font-size: 20px;
  padding-inline: 4px;
}

.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  .sidebar {
    background-color: rgb(255, 255, 255);
    color: white;
    transition: width 0.2s ease;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border-right: 1px solid rgb(232, 232, 232);

    .sidebar-header {
      padding: 15px 20px;
      display: flex;
      justify-content: left;
      align-items: center;
      gap: 6px;
      background-color: rgb(255, 255, 255);
      border-bottom: 1px solid rgb(232, 232, 232);
      transition: all 0.2s ease;

      img {
        width: 30px;
        height: 30px;
        transition: all 0.2s ease;
      }

      h2 {
        margin: 0;
        font-size: 18px;
        color: #333;
        transition: opacity 0.2s ease;
      }
    }

    .sidebar-menu {
      flex: 1;
      overflow-y: auto;
    }
  }

  .drag-bar {
    width: 6px;
    background-color: #fafafa;
    cursor: col-resize;
    transition: background-color 0.2s;
    flex-shrink: 0;
    position: relative;
    z-index: 1000;

    &:hover {
      background-color: rgb(64, 158, 255);
    }

    &:active {
      background-color: rgb(64, 158, 255);
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .header {
      height: 60px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      border-bottom: 1px solid rgb(232, 232, 232);

      .header-left {
        .el-breadcrumb {
          font-size: 18px;
        }
      }

      .header-right {
        :deep(.custom-dropdown .el-dropdown-selfdefine) {
          outline: none !important;
          border: none !important;
        }

        :deep(.custom-dropdown:focus .el-dropdown-selfdefine) {
          outline: none !important;
          border: none !important;
        }

        .user-info {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.2s;

          &:hover {
            background-color: #fff;
          }

          .username {
            margin: 0 8px;
            font-size: 16px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
        }
      }
    }

    .content {
      flex: 1;
      padding: 10px 20px;
      overflow-y: auto;
      background-color: fff;
    }
  }
}
</style>
