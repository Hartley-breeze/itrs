<template>
  <div class="login-container">
    <div class="login-panel">
      <div class="right-login">
        <div class="welcome-section">
          <div class="sec-container">
            <img src="/logo.png" alt="Logo" />
            <div class="line"></div>
            <div class="text">TravelGuide</div>
          </div>
        </div>
        <div class="input-group">
          <div class="text">
            <input v-model="account" class="act" placeholder="登录账号" />
          </div>
          <div class="text">
            <input v-model="password" class="pwd" type="password" placeholder="密码" />
          </div>
        </div>
        <div class="login-action">
          <span class="login-btn" @click="login">
            <span class="btn-text">立即登录</span>
            <span class="btn-icon"></span>
          </span>
        </div>
        <div class="tip">
          <p>还没有账号？<span class="no-act" @click="toDoRegister">立即注册</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { post } from "@/utils/request.js"
import { setToken, setRole, getToken, getRole } from "@/utils/storage.js"
import md5 from 'js-md5'

// 常量定义
const DELAY_TIME: number = 500

// 类型定义
interface LoginResponse {
  code: number
  data: {
    token: string
    role: number
  }
  message?: string
}

interface UserLoginDTO {
  account: string
  password: string
}

// 路由实例
const router = useRouter()

// 响应式数据
const account = ref<string>('')
const password = ref<string>('')

// 跳转注册页面
const toDoRegister = (): void => {
  router.push('/register')
}

/**
 * 登录方法
 */
const login = async (): Promise<void> => {
  if (!account.value.trim() || !password.value.trim()) {
    ElMessage.info({
      message: '账号或密码不能为空，请注意填写',
      duration: 1500,
    })
    return
  }

  // 密码的二次md5加密
  const hashedPwd: string = md5(md5(password.value))

  // 构建登录入参
  const userLoginDTO: UserLoginDTO = {
    account: account.value,
    password: hashedPwd
  }

  try {
    const data: LoginResponse = await post('user/login', userLoginDTO)

    // 将 token 存储至 localStorage 里面
    setToken(data.data.token)

    setTimeout((): void => {
      // 从响应中取出用户角色
      const { role } = data.data
      // 存储用户角色
      setRole(role)
      // 根据用户角色跳转路由页面
      navigateToRole(role)
    }, DELAY_TIME)

    ElMessage.success('登录成功');
  } catch (error: any) {
    ElMessage.warning({
      message: error.message || '登录失败',
      duration: 1500,
    })
  }
}

/**
 * 角色跳转逻辑
 */
const navigateToRole = (role: number): void => {
  switch (role) {
    case 1:
      router.push('/admin')
      break
    case 2:
      router.push('/user')
      break
    default:
      console.warn('未知的角色类型:', role)
      ElMessage.warning('未知的用户角色')
      break
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(250, 250, 250);
  overflow: hidden;

  .login-panel {
    background: rgba(255, 255, 255);
    border-radius: 12px;
    width: 353px;
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    overflow: hidden;
    margin: 20px;
    padding-block: 40px;

    .right-login {
      padding: 40px 30px;

      .welcome-section {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 40px;

        .sec-container {
          display: flex;
          justify-content: left;
          gap: 12px;
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
            font-family: 'Times New Roman', Times, serif;
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

      .login-action {
        .login-btn {
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
  .login-container {
    .login-panel {
      width: 90%;
      max-width: 400px;
      margin: 10px;

      .right-login {
        padding: 40px 30px;
      }
    }
  }
}

@media (max-width: 480px) {
  .login-container {
    .login-panel {
      .right-login {
        padding: 30px 20px;
      }
    }
  }
}
</style>
