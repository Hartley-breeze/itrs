import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 1. 导入 Element Plus 核心和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 2. 导入所有图标（或按需导入，下文有按需方案）
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 3. 全局注册 Element Plus
app.use(ElementPlus, {
  locale: zhCn, // 国际化
})

// 4. 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
