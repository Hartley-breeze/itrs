<template>
  <div class="user-layout">

    <div class="header">
      <!-- logo部分 -->
      <div class="logo">
        <img src="/logo.png" alt="">
        <div class="system-name">TravelGuide</div>
      </div>
      <!-- 功能区 -->
      <ul class="nav-list">
        <li v-for="route in menuRoutes" :key="route.path" :class="{ active: currentRoute === route.path }"
          @click="$router.push(route.path)">
          <span>{{ route.name }}</span>
        </li>
      </ul>
      <!-- 个人信息 -->
      <div class="info-container">
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
              <el-dropdown-item icon="Document" command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item icon="Setting" command="updatePasswordShowBlock">修改密码</el-dropdown-item>
              <el-dropdown-item icon="Right" command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="content">
      <router-view />
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
          <el-input style="width: 90%;" v-model="updateUserInfo.account" placeholder="请输入账号" :disabled="true" />
          <div class="tip-text">
            账号一经注册，不可修改
          </div>
        </el-form-item>

        <el-form-item label="昵称" prop="username">
          <el-input style="width: 90%;" v-model="updateUserInfo.username" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="updateUserInfo.gender">
            <el-radio :label="1">女</el-radio>
            <el-radio :label="2">男</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input style="width: 90%;" v-model="updateUserInfo.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input style="width: 90%;" v-model="updateUserInfo.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="生日">
          <el-date-picker :value-format="'YYYY-MM-DD'" v-model="updateUserInfo.birthday" type="date" placeholder="选择生日"
            style="width: 90%;" />
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

    <!-- 修改密码 -->
    <el-dialog title="修改密码" v-model="dialogPasswordVisible" width="450px" :close-on-click-modal="false">
      <el-form :model="updatePasswordInfo" label-width="100px" ref="formRef">

        <el-form-item label="原始密码" prop="oldPassword">
          <el-input style="width: 90%;" placeholder="请输入密码" v-model="updatePasswordInfo.oldPassword"
            show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="account">
          <el-input style="width: 90%;" placeholder="请输入密码" v-model="updatePasswordInfo.newPassword"
            show-password></el-input>
        </el-form-item>
        <el-form-item label="重复密码" prop="account">
          <el-input style="width: 90%;" placeholder="请输入密码" v-model="updatePasswordInfo.againPassword"
            show-password></el-input>
        </el-form-item>

      </el-form>

      <template #footer>
        <div style="display: flex;justify-content: center;align-items: center;margin-bottom: 20px;">
          <el-button round @click="updatePasswordCannel">取消</el-button>
          <el-button icon="CircleCheckFilled" round type="primary" @click="handleConfirmPassword">
            确定修改
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { get, put } from '@/utils/request'
import { updatePasswordApi } from '@/api/user-api'
import type { UserUpdatePasswordDTO } from '@/types/user.ts'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { ArrowDown, Upload } from '@element-plus/icons-vue'
import md5 from 'js-md5'
import {
  getLastVisitedPath,
  clearLastVisitedPath,
  clearToken,
  clearRole,
  clearUserInfo
} from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const dialogProfileVisible = ref(false)
const dialogPasswordVisible = ref(false)
const updateUserInfo = reactive({
  avatar: '',
  account: '',
  username: '',
  gender: null,
  email: '',
  phone: '',
  birthday: null
})

const updatePasswordInfo = reactive<UserUpdatePasswordDTO>({
  oldPassword: '',
  newPassword: '',
  againPassword: ''
})

const handleImageSuccess = (response: any) => {
  if (response.code === 200) {
    updateUserInfo.avatar = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

const handleConfirmPassword = async () => {
  try {
    if (!updatePasswordInfo.oldPassword) {
      ElMessage.warning('旧密码不为空')
      return;
    }
    if (!updatePasswordInfo.newPassword) {
      ElMessage.warning('新密码不为空')
      return;
    }
    if (!updatePasswordInfo.againPassword) {
      ElMessage.warning('重复密码不为空')
      return;
    }
    if (updatePasswordInfo.againPassword !== updatePasswordInfo.newPassword) {
      ElMessage.warning('前后新密码输入不一致')
      return;
    }
    updatePasswordInfo.oldPassword = md5(md5(updatePasswordInfo.oldPassword))
    updatePasswordInfo.newPassword = md5(md5(updatePasswordInfo.newPassword))
    updatePasswordInfo.againPassword = md5(md5(updatePasswordInfo.againPassword))
    await updatePasswordApi(updatePasswordInfo)
    ElMessage.success('密码修改成功')

    // 清除本地存储
    clearToken()
    clearRole()
    clearUserInfo()
    clearLastVisitedPath()

    // 跳转到登录页
    router.push('/login')
  } catch (error: any) {
    Object.assign(updatePasswordInfo, {
      oldPassword: '',
      newPassword: '',
      againPassword: ''
    })
    ElMessage.warning(error.message)
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

const updatePasswordCannel = () => {
  dialogPasswordVisible.value = false
  Object.assign(updatePasswordInfo, {
    oldPassword: '',
    newPassword: '',
    againPassword: ''
  })
}

const updatePasswordShowBlock = () => {
  dialogPasswordVisible.value = true
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
    const hasRole = route.meta?.roles?.includes(2)
    const isAdminRoute = route.path.startsWith('/user/') && route.path !== '/user'

    return hasMenu && hasRole && isAdminRoute
  })

  return filteredRoutes.sort((a, b) => (a.meta.menuOrder || 99) - (b.meta.menuOrder || 99))
})

// 当前路由
const currentRoute = computed(() => route.path)

// 用户操作
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      profile()
      break
    case 'updatePasswordShowBlock':
      updatePasswordShowBlock()
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
  // 先进行用户认证
  await fetchUserAuth()

  const lastPath = getLastVisitedPath()

  // 如果当前在 /user 路径，尝试重定向
  if (route.path === '/user') {
    const validLastPath = lastPath &&
      lastPath !== '/' &&
      lastPath !== '/login' &&
      lastPath !== '/register' &&
      lastPath.startsWith('/user/')

    const redirectPath = validLastPath ? lastPath : '/user/user-main'
    console.log('Admin redirecting to:', redirectPath)
    router.push(redirectPath)
  }

})

// 确保清理事件监听器
onUnmounted(() => {
  // 恢复文本选择（安全措施）
  document.body.style.userSelect = ''
  document.body.style.webkitUserSelect = ''
  document.body.style.cursor = ''
})
</script>

<style scoped lang="scss">
.user-layout {
  width: 100%;
  min-height: 100vh;
}

.content {
  padding-inline: 200px;
  padding-block: 30px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  height: 80px;
  padding-inline: 50px;
  background-color: white;

  .logo {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 10px;
    flex: 1;

    img {
      width: 30px;
      height: 30px;
    }

    .system-name {
      font-size: 20px;
      color: #333;
      font-weight: 500;
    }
  }
}

.nav-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex: 2;

  li {
    font-size: 16px;
    color: #666;
    cursor: pointer;
    padding: 4px 20px;
    position: relative;
    border-radius: 20px;
    transition: color 0.3s;

    &.active {
      background-color: rgb(51, 51, 51);
      color: rgb(255, 255, 255);
      font-weight: 500;

    }
  }
}

.info-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1;

  .user-info {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgb(250, 250, 250);
    }

    .username {
      font-size: 14px;
      color: #333;
    }
  }
}

.avatar-upload-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tip-text {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
