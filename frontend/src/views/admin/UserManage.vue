<template>
  <div class="container">
    <div class="top-header">
      <div class="nav-left">
        <Tab :buttons="[
          { label: '全部', value: 'null' },
          { label: '管理员', value: '1' },
          { label: '普通用户', value: '2' }
        ]" :initialActive="userQueryDto.role?.toString() || 'null'" @change="handleRoleChange" />
      </div>
      <div class="nav-right">
        <div>
          <Input placeholder="搜索用户，按Enter↩︎键" @listener="handleSearch" />
        </div>
        <el-button type="primary" @click="handleAddUser">
          <el-icon>
            <Plus />
          </el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="username" label="用户基本信息">
          <template #default="scope">
            <div>
              <div>
                <div width="200" style="gap: 8px;display: flex;align-items: left;align-items: center;">
                  <div>
                    <el-tooltip class="item" effect="dark"
                      :content="`注册于：${scope.row.createTime}，上一次登录时间：${scope.row.lastLoginTime ? scope.row.lastLoginTime : '暂无'}`"
                      placement="bottom-start">
                      <img width="40px" height="40px"
                        style="cursor: pointer;border-radius: 50%;border: 2px dashed #555;" :src="scope.row.avatar"
                        alt="">
                    </el-tooltip>
                  </div>
                  <div style="font-size: 14px;">
                    <el-tooltip v-if="scope.row.username.length > 4" class="item" effect="dark"
                      :content="scope.row.username" placement="bottom-end">
                      <div style="width:80%;overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        {{ scope.row.username }}
                      </div>
                    </el-tooltip>
                    <div v-else>
                      {{ scope.row.username }}
                    </div>
                    <div style="font-size: 12px;">
                      账号：{{ scope.row.account }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" sortable width="160" label="邮箱">
          <template #default="scope">
            <div class="text-ellipsis">
              {{ scope.row.email || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" sortable width="90" label="性别">
          <template #default="scope">
            <el-tag :type="scope.row.gender === 1 ? 'primary' : 'success'" size="small">
              {{ scope.row.gender === 1 ? '女' : '男' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" sortable width="130" label="联系电话">
          <template #default="scope">
            <div class="text-ellipsis">
              {{ scope.row.phone || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="birthday" sortable width="130" label="出生年月">
          <template #default="scope">
            {{ scope.row.birthday || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="birthday" sortable width="160" label="账号状态">
          <template #default="scope">
            <div style="display: flex;justify-content: left;align-items: center;gap: 6px;">
              <el-switch @change="(value: any) => handleUserStatus(scope.row, 'login', value)"
                :model-value="scope.row.loginStatus" active-color="#e63f31" inactive-color="#f1f1f1" active-text="封禁"
                inactive-text="正常">
              </el-switch>
              <el-tooltip class="item" effect="dark" content="【封禁状态】用户不可登录；【正常状态】：账户正常使用" placement="bottom-end">
                <el-icon style="cursor: pointer;">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="birthday" sortable width="160" label="禁言状态">
          <template #default="scope">
            <div style="display: flex;justify-content: left;align-items: center;gap: 6px;">
              <el-switch @change="(value: any) => handleUserStatus(scope.row, 'speak', value)"
                :model-value="scope.row.speakStatus" active-color="#e63f31" inactive-color="#f1f1f1" active-text="禁言"
                inactive-text="正常">
              </el-switch>
              <el-tooltip class="item" effect="dark" content="【禁言状态】用户不可交流；【正常状态】：账户交流权限正常使用" placement="bottom-end">
                <el-icon style="cursor: pointer;">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="功能操作" width="130" align="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">
              <el-icon>
                <Edit />
              </el-icon>
              修改
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">
              <el-icon>
                <Delete />
              </el-icon>
              注销
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination">
        <el-pagination v-model:current-page="userQueryDto.current" v-model:page-size="userQueryDto.size"
          :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 用户信息操作弹窗 -->
    <el-dialog :title="isCreateModel ? '新增用户' : '修改信息'" v-model="dialogVisible" width="600px"
      :close-on-click-modal="false">
      <el-tabs v-model="tabActiveName" tab-position="right">
        <el-tab-pane label="核心信息" name="first">
          <el-form :model="userForm" label-width="80px" :rules="currentFormRules" ref="formRef">
            <el-form-item label="头像">
              <div class="avatar-upload-container">
                <el-avatar :size="80" :src="avatar" />
                <el-upload class="avatar-uploader" action="http://localhost:21090/itrs/file/upload"
                  :show-file-list="false" :on-success="handleImageSuccess" :before-upload="beforeAvatarUpload">
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
              <el-input v-model="userForm.account" placeholder="请输入账号" :disabled="!isCreateModel" />
              <div v-if="!isCreateModel" class="tip-text">
                账号一经注册，不可修改
              </div>
            </el-form-item>

            <el-form-item label="昵称" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入昵称" />
            </el-form-item>

            <el-form-item label="密码" prop="password" v-if="isCreateModel">
              <el-input v-model="userForm.password" type="password" show-password placeholder="请输入密码" />
              <div class="tip-text">
                请输入密码
              </div>
            </el-form-item>
            <el-form-item label="密码" v-else>
              <el-input v-model="password" type="password" show-password placeholder="请输入新密码" />
              <div class="tip-text">
                需要重置密码时在此输入
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="基本信息" name="second">
          <el-form :model="userForm" label-width="80px">
            <el-form-item label="身份">
              <el-radio-group v-model="userForm.role">
                <el-radio :label="1">管理员</el-radio>
                <el-radio :label="2">用户</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="性别">
              <el-radio-group v-model="userForm.gender">
                <el-radio :label="1">女</el-radio>
                <el-radio :label="2">男</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="手机号">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="生日">
              <el-date-picker :value-format="'YYYY-MM-DD'" v-model="userForm.birthday" type="date" placeholder="选择生日"
                style="width: 100%" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="confirmLoading">
          {{ isCreateModel ? '新增' : '修改' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog title="删除用户" v-model="deleteDialogVisible" width="400px">
      <span>确定删除用户 "{{ deleteUserData?.username }}" 吗？此操作不可恢复。</span>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmDelete" :loading="deleteLoading">
          确定删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElNotification, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, Upload, Warning } from '@element-plus/icons-vue'
import md5 from 'js-md5'
import Input from '@/components/Input.vue'
import Tab from '@/components/Tab.vue'
import type { User, UserQueryDto } from '@/types/user'
import { queryUsers, saveUser, updateUser, delUser, updateUserStatus } from '@/api/user-api'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const confirmLoading = ref(false)
const deleteLoading = ref(false)
const isCreateModel = ref(true)
const tabActiveName = ref('first')
const avatar = ref('')
const password = ref('')
const deleteUserData = ref<User | null>(null) // 重命名避免冲突
const formRef = ref<FormInstance>()

const userList = ref<User[]>([])
const total = ref(0)

const userQueryDto = reactive<UserQueryDto>({
  current: 1,
  size: 10,
  role: null,
  username: ''
})

const userForm = reactive<Partial<User>>({
  account: '',
  username: '',
  password: '',
  role: 2,
  gender: 2,
  email: '',
  phone: '',
  birthday: ''
})

// 表单验证规则
const formRules = reactive<FormRules>({
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3-20 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
})

// 动态表单验证规则
const currentFormRules = computed(() => {
  if (isCreateModel.value) {
    return formRules
  }
  const { password, ...otherRules } = formRules
  return otherRules
})

// 生命周期
onMounted(() => {
  fetchUserData()
})

// 修改用户状态（禁言状态/登录状态）
const handleUserStatus = async (userInfo: User, statusType: 'speak' | 'login', newValue: boolean) => {
  try {
    const fieldName = statusType === 'speak' ? 'speakStatus' : 'loginStatus'

    // 立即更新UI状态
    userInfo[fieldName] = newValue

    await updateUserStatus({
      id: userInfo.id!,
      [fieldName]: newValue
    })

    const messages = {
      speak: {
        title: '修改用户禁言状态',
        success: newValue ? '账号已禁言' : '账号已恢复交流权限'
      },
      login: {
        title: '修改用户登录状态',
        success: newValue ? '账号已封禁' : '账号已恢复正常'
      }
    }

    ElNotification.success({
      title: messages[statusType].title,
      message: messages[statusType].success,
      duration: 1500,
      position: 'bottom-right'
    })
  } catch (error: any) {
    // 回滚状态
    const fieldName = statusType === 'speak' ? 'speakStatus' : 'loginStatus'
    userInfo[fieldName] = !userInfo[fieldName]

    const errorMessages = {
      speak: '设置禁言状态异常',
      login: '设置登录状态异常'
    }

    ElMessage.error(error.message || errorMessages[statusType])
  }
}

// 查询用户列表
const fetchUserData = async () => {
  loading.value = true
  try {
    const response = await queryUsers(userQueryDto)
    userList.value = response.data
    total.value = response.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户数据失败')
  } finally {
    loading.value = false
  }
}

const handleRoleChange = (obj: { value: string }) => {
  userQueryDto.role = obj.value === 'null' ? null : Number(obj.value)
  userQueryDto.current = 1
  fetchUserData()
}

const handleSearch = (keyword: string) => {
  userQueryDto.username = keyword
  userQueryDto.current = 1
  fetchUserData()
}

const handleAddUser = () => {
  resetForm()
  isCreateModel.value = true
  dialogVisible.value = true
}

const handleEdit = (user: User) => {
  resetForm()
  Object.assign(userForm, user)
  avatar.value = user.avatar || ''
  isCreateModel.value = false
  dialogVisible.value = true
}

const handleDelete = (user: User) => {
  deleteUserData.value = user
  deleteDialogVisible.value = true
}

const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善表单信息')
    return
  }

  confirmLoading.value = true
  try {
    // 处理头像和密码
    const submitData = { ...userForm }
    submitData.avatar = avatar.value

    // 处理密码逻辑
    if (isCreateModel.value) {
      // 新增时使用表单中的密码
      if (submitData.password) {
        submitData.password = md5(md5(submitData.password))
      }
    } else {
      // 修改时使用单独的密码字段
      if (password.value) {
        submitData.password = md5(md5(password.value))
      } else {
        // 如果没有输入新密码，移除password字段
        delete submitData.password
      }
    }

    if (isCreateModel.value) {
      await saveUser(submitData)
      ElMessage.success('用户创建成功')
    } else {
      await updateUser(submitData)
      ElMessage.success('用户信息更新成功')
    }

    handleCancel()
    fetchUserData()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    confirmLoading.value = false
  }
}

const handleConfirmDelete = async () => {
  if (!deleteUserData.value?.id) return

  deleteLoading.value = true
  try {
    await delUser(deleteUserData.value.id)
    ElMessage.success('用户删除成功')
    deleteDialogVisible.value = false
    deleteUserData.value = null
    fetchUserData()
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  } finally {
    deleteLoading.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  formRef.value?.clearValidate()
  Object.assign(userForm, {
    account: '',
    username: '',
    password: '',
    role: 2,
    gender: 2,
    email: '',
    phone: '',
    birthday: ''
  })
  avatar.value = ''
  password.value = ''
  tabActiveName.value = 'first'
}

const handleSizeChange = (size: number) => {
  userQueryDto.size = size
  userQueryDto.current = 1
  fetchUserData()
}

const handleCurrentChange = (current: number) => {
  userQueryDto.current = current
  fetchUserData()
}

const handleImageSuccess = (response: any) => {
  if (response.code === 200) {
    avatar.value = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

const beforeAvatarUpload = (file: File) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}
</script>

<style scoped lang="scss">
.container {
  background: #fff;
  border-radius: 8px;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 26px 0;
  background: #fff;
  border-radius: 6px;

  .nav-left,
  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.table-container {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .username {
      font-weight: 500;
    }
  }

  .text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 16px 0;
}

.avatar-upload-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-tabs__content) {
  padding: 0 16px;
}

:deep(.el-table .cell) {
  padding: 0 6px !important;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>
