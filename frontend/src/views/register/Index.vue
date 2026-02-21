<template>
  <div class="register-container">
    <div class="register-panel">
      <div class="right-register">
        <div class="welcome-section">
          <div class="sec-container">
            <img src="/logo.png" alt="Logo" />
            <div class="line"></div>
            <div class="text">Hi，加入我们吧</div>
          </div>
        </div>
        <div class="input-group">
          <div class="text">
            <input v-model="formData.account" class="act" placeholder="注册账号" />
          </div>
          <div class="text">
            <input v-model="formData.username" class="pwd" placeholder="用户名" />
          </div>
          <div class="text">
            <input v-model="formData.password" class="pwd" type="password" placeholder="输入密码" />
          </div>
          <div class="text">
            <input v-model="formData.pwdConfirm" class="pwd" type="password" placeholder="确认密码" />
          </div>
        </div>
        <div class="register-action">
          <span class="register-btn" @click="handleRegister">
            <span class="btn-text">{{ loading ? '注册中...' : '立即注册' }}</span>
            <span class="btn-icon"></span>
          </span>
        </div>
        <div class="tip">
          <p>已有账户？<span class="no-act" @click="toDoLogin">返回登录</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { post } from "@/utils/request.js"
import md5 from 'js-md5'

// 常量定义
const DELAY_TIME: number = 800

// 类型定义
interface RegisterForm {
  account: string
  username: string
  password: string
  pwdConfirm: string
}

// 路由实例
const router = useRouter()
const loading = ref<boolean>(false)

// 表单数据
const formData = reactive<RegisterForm>({
  account: '',
  username: '',
  password: '',
  pwdConfirm: ''
})

// 表单验证
const validateForm = (): boolean => {
  if (!formData.account.trim()) {
    ElMessage.info('请输入注册账号')
    return false
  }
  
  if (formData.account.length < 3 || formData.account.length > 20) {
    ElMessage.info('账号长度在 3 到 20 个字符')
    return false
  }
  
  if (!formData.username.trim()) {
    ElMessage.info('请输入用户名')
    return false
  }
  
  if (formData.username.length < 2 || formData.username.length > 20) {
    ElMessage.info('用户名长度在 2 到 20 个字符')
    return false
  }
  
  if (!formData.password.trim()) {
    ElMessage.info('请输入密码')
    return false
  }
  
  if (formData.password.length < 6 || formData.password.length > 20) {
    ElMessage.info('密码长度在 6 到 20 个字符')
    return false
  }
  
  if (formData.password !== formData.pwdConfirm) {
    ElMessage.info('两次输入密码不一致')
    return false
  }
  
  return true
}

// 返回登录页面
const toDoLogin = (): void => {
  router.push('/login')
}

// 注册方法
const handleRegister = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // 密码二次md5加密
    const hashedPwd: string = md5(md5(formData.password))
    
    // 构建注册参数
    const userRegisterDTO = {
      account: formData.account,
      password: hashedPwd,
      username: formData.username
    }

    await post('user/register', userRegisterDTO)
    
    ElMessage.success({
      message: '恭喜你，注册成功！',
      duration: 2500
    })

    // 延迟跳转登录页
    setTimeout(() => {
      router.push('/login')
    }, DELAY_TIME)

  } catch (error: any) {
    ElMessage.warning({
      message: error.message || '注册失败',
      duration: 1500
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(250, 250, 250);
  overflow: hidden;

  .register-panel {
    background: rgba(255, 255, 255);
    border-radius: 12px;
    width: 353px;
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    overflow: hidden;
    margin: 20px;
    padding-block: 10px;

    .right-register {
      padding: 40px 30px;

      .welcome-section {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 40px;

        .sec-container {
          display: flex;
          justify-content: left;
          gap: 14px;
          align-items: center;

          img {
            width: 50px;
            height: 50px;
          }

          .line {
            width: 1px;
            height: 10px;
            background-color: #666;
            font-weight: 600;
          }

          .text {
            color: #666;
            font-size: 24px;
            font-weight: bold;
            font-family:'Times New Roman', Times, serif;
          }
        }
      }

      .input-group {
        margin-bottom: 30px;

        .text {
          margin-bottom: 20px;

          .act,
          .pwd {
            background: rgb(255, 255, 255);
            border: 1px solid rgb(232, 232, 232);
            width: 100%;
            height: 50px;
            padding: 4px 20px;
            font-size: 20px;
            font-weight: 500;
            outline: none;
            border-radius: 6px;
            font-family: 'Times New Roman', Times, serif;
            transition: all 0.3s ease;

            &::placeholder {
              color: #a0a0a0;
            }

            &:focus {
              background: rgba(255, 255, 255, 0.9);
            }

            &:hover {
              background: rgba(255, 255, 255, 0.85);
            }
          }
        }
      }

      .register-action {
        .register-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 45px;
          background: #333;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow:
            0 4px 15px rgba(238, 238, 239, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }

          &:hover {
            transform: translateY(-2px);

            &::before {
              left: 100%;
            }
          }

          &:active {
            transform: translateY(0);
          }

          .btn-text {
            margin-right: 8px;
            position: relative;
            z-index: 1;
          }

          .btn-icon {
            font-size: 18px;
            position: relative;
            z-index: 1;
          }
        }
      }

      .tip {
        text-align: center;
        margin-top: 30px;

        p {
          color: #7f8c8d;
          font-size: 14px;
          margin: 0;

          .no-act {
            color: #333;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;

            &::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 0;
              height: 2px;
              background: #000;
              transition: width 0.3s ease;
            }

            &:hover {
              color: #000;

              &::after {
                width: 100%;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .register-container {
    .register-panel {
      width: 90%;
      max-width: 400px;
      margin: 10px;

      .right-register {
        padding: 40px 30px;
      }
    }
  }
}

@media (max-width: 480px) {
  .register-container {
    .register-panel {
      .right-register {
        padding: 30px 20px;
      }
    }
  }
}
</style>