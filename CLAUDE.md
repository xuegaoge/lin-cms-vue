# LinCMS Vue 管理端开发指南

## 技术栈

- **Vue 3** - 前端框架（组合式 API）
- **Element Plus** - UI 组件库
- **Vue Router 4** - 路由管理
- **Vuex 4** - 状态管理
- **Axios** - HTTP 客户端
- **ESLint + Airbnb** - 代码规范
- **Prettier** - 代码格式化
- **Sass/SCSS** - CSS 预处理

## 项目架构

### 目录结构
```
src/
├── api/                      # API 接口
│   ├── request.js            # Axios 配置
│   ├── auth.js               # 认证接口
│   ├── user.js               # 用户接口
│   └── ...                   # 其他接口
├── components/               # 公共组件
│   ├── BaseTable/            # 基础表格组件
│   ├── BaseForm/             # 基础表单组件
│   └── ...                   # 其他组件
├── layouts/                  # 布局组件
│   ├── BasicLayout.vue       # 基础布局
│   ├── BlankLayout.vue       # 空白布局
│   └── ...                   # 其他布局
├── router/                   # 路由配置
│   ├── index.js              # 路由主文件
│   ├── modules/              # 路由模块
│   │   ├── auth.js           # 认证路由
│   │   ├── user.js           # 用户管理路由
│   │   └── ...               # 其他路由
├── store/                    # Vuex 状态管理
│   ├── index.js              # Store 主文件
│   ├── modules/              # 模块
│   │   ├── auth.js           # 认证状态
│   │   ├── user.js           # 用户状态
│   │   └── ...               # 其他状态
├── styles/                   # 全局样式
│   ├── variables.scss        # 样式变量
│   ├── mixins.scss           # 混合宏
│   └── global.scss           # 全局样式
├── utils/                    # 工具函数
│   ├── auth.js               # 认证工具
│   ├── request.js            # 请求工具
│   └── ...                   # 其他工具
├── views/                    # 页面组件
│   ├── Dashboard/            # 仪表盘
│   ├── User/                 # 用户管理
│   │   ├── List.vue          # 用户列表
│   │   ├── Create.vue        # 创建用户
│   │   └── Edit.vue          # 编辑用户
│   └── ...                   # 其他页面
├── App.vue                   # 根组件
└── main.js                   # 入口文件
```

## 快速开始

### 环境要求
- Node.js 16+（推荐 Node 18+）
- pnpm 或 npm

### 安装与运行
```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev
# 或
npm run serve

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 运行单元测试
npm run test:unit

# 代码检查
npm run lint
```

### 访问
- **管理面板**：http://localhost:8080（默认 Vue CLI 端口）

## 开发规范

### 代码风格
- 遵循 ESLint Airbnb 配置
- 使用 Vue 3 组合式 API
- 组件命名使用 PascalCase（MyComponent.vue）
- 文件命名使用 kebab-case（my-component.vue）
- 常量使用 UPPER_SNAKE_CASE

### 组件开发
```vue
<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <el-button @click="handleClick">点击</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 定义属性
defineProps({
  title: {
    type: String,
    default: '默认标题'
  }
})

// 定义事件
const emit = defineEmits(['click'])

// 响应式数据
const count = ref(0)

// 方法
const handleClick = () => {
  count.value++
  emit('click', count.value)
}
</script>

<style lang="scss" scoped>
.my-component {
  padding: 20px;
}
</style>
```

### 路由配置
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/Index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'dashboard',
          roles: ['admin']
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 权限检查
  if (to.meta.roles) {
    const roles = store.getters.roles
    if (hasPermission(roles, to.meta.roles)) {
      next()
    } else {
      next('/403')
    }
  } else {
    next()
  }
})

export default router
```

### 状态管理
```javascript
// store/modules/user.js
export default {
  namespaced: true,
  state: {
    userInfo: null,
    token: null
  },
  mutations: {
    SET_USER_INFO(state, info) {
      state.userInfo = info
    },
    SET_TOKEN(state, token) {
      state.token = token
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const { data } = await authApi.login(credentials)
      commit('SET_TOKEN', data.token)
      commit('SET_USER_INFO', data.userInfo)
    },
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER_INFO', null)
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    userInfo: state => state.userInfo
  }
}
```

## API 调用

### Axios 配置
```javascript
// api/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { code, message, data } = response.data
    if (code === 200) {
      return data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  error => {
    if (error.response?.status === 401) {
      // 跳转到登录页
      router.push('/login')
    }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
```

### API 接口示例
```javascript
// api/user.js
import request from './request'

export const userApi = {
  // 获取用户列表
  getUserList(params) {
    return request({
      url: '/cms/user',
      method: 'get',
      params
    })
  },

  // 创建用户
  createUser(data) {
    return request({
      url: '/cms/user',
      method: 'post',
      data
    })
  },

  // 更新用户
  updateUser(id, data) {
    return request({
      url: `/cms/user/${id}`,
      method: 'put',
      data
    })
  },

  // 删除用户
  deleteUser(id) {
    return request({
      url: `/cms/user/${id}`,
      method: 'delete'
    })
  }
}
```

## 权限控制

### 指令实现
```javascript
// utils/auth.js
export function hasPermission(roles, permission) {
  if (!permission) return true
  return roles.includes(permission)
}

// 全局指令
const permissionDirective = {
  mounted(el, binding) {
    const { value } = binding
    const roles = store.getters.roles
    if (!hasPermission(roles, value)) {
      el.style.display = 'none'
    }
  }
}

export default permissionDirective
```

### 使用方式
```vue
<template>
  <div>
    <!-- 按钮级别的权限控制 -->
    <el-button v-permission="'user:create'">创建用户</el-button>

    <!-- 根据角色显示不同内容 -->
    <div v-if="hasRole('admin')">
      <p>管理员专用内容</p>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'

const store = useStore()

const hasRole = role => {
  return store.getters.roles.includes(role)
}
</script>
```

## 样式指南

### 全局样式变量
```scss
// styles/variables.scss
// 主色调
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;

// 文字颜色
$text-color: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$text-placeholder: #c0c4cc;

// 边框颜色
$border-color: #dcdfe6;
$border-light: #e4e7ed;

// 背景颜色
$bg-color: #f5f7fa;
$bg-white: #ffffff;

// 间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
```

### 组件样式规范
```scss
.my-component {
  padding: $spacing-md;
  background: $bg-white;
  border-radius: 4px;

  .title {
    font-size: 18px;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $spacing-md;
  }

  .content {
    color: $text-regular;
    line-height: 1.6;
  }

  // BEM 命名规范
  &__element {
    display: block;
  }

  &--modifier {
    background: $primary-color;
  }
}
```

## 表单处理

### 基础表单组件
```vue
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formRef = ref()

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6-20 位', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  await formRef.value.validate()
  // 提交表单
}

const handleReset = () => {
  formRef.value.resetFields()
}
</script>
```

## 表格处理

### 基础表格组件
```vue
<template>
  <el-table
    :data="tableData"
    v-loading="loading"
    style="width: 100%"
  >
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="username" label="用户名" />
    <el-table-column prop="email" label="邮箱" />
    <el-table-column label="操作" width="200">
      <template #default="{ row }">
        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const tableData = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const data = await userApi.getUserList()
    tableData.value = data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

## 测试

### 单元测试（Jest + Vue Test Utils）
```javascript
// tests/unit/components/MyComponent.spec.js
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: '测试标题'
      }
    })
    expect(wrapper.text()).toContain('测试标题')
  })
})
```

### 运行测试
```bash
# 运行所有测试
npm run test:unit

# 监听模式
npm run test:unit -- --watch

# 生成覆盖率报告
npm run test:unit -- --coverage
```

## 构建与部署

### 构建配置
```bash
# 构建开发版本
npm run build:dev

# 构建生产版本
npm run build:prod

# 分析打包大小
npm run build:analyze
```

### 环境配置
```bash
# .env.development
VUE_APP_API_BASE_URL=https://api.dev.example.com

# .env.production
VUE_APP_API_BASE_URL=https://api.prod.example.com
```

### GitHub Actions 部署
- 工作流：`.github/workflows/deploy-to-server.yml`
- 触发条件：推送到 `main` 或 `vue-next` 分支
- 部署方式：SSH 部署

## 常见问题

### 样式穿透
```scss
// 使用 :deep() 穿透 scoped 样式
:deep(.el-table) {
  font-size: 14px;
}
```

### 动态引入组件
```javascript
// 懒加载组件
const AsyncComponent = defineAsyncComponent(() =>
  import('@/components/MyComponent.vue')
)
```

### 路由懒加载
```javascript
// 路由组件懒加载
const routes = [
  {
    path: '/user',
    component: () => import('@/views/User/Index.vue')
  }
]
```

## 性能优化

1. **路由懒加载**：使用动态导入
2. **组件懒加载**：使用 `defineAsyncComponent`
3. **图片懒加载**：`v-lazy` 指令
4. **虚拟滚动**：大量数据列表
5. **缓存策略**：keep-alive 缓存页面

## 相关资源

- **Vue 3 文档**：https://v3.cn.vuejs.org/
- **Element Plus 文档**：https://element-plus.org/
- **Vue Router 文档**：https://next.router.vuejs.org/
- **Vuex 文档**：https://next.vuex.vuejs.org/
- **Axios 文档**：https://axios-http.com/
