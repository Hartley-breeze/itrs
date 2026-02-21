// 常量定义（全大写+下划线命名，保持原有规范）
const TOKEN_KEY = "token";
const USER_INFO_KEY = "userInfo";
const ROLE_KEY = "role";
const LAST_VISITED_PATH_KEY = "last_visited_path";
// 侧边栏宽度缓存
const SIDEBAR_WIDTH_KEY = 'sidebar_width'

// 定义用户信息类型（根据实际业务调整字段）
interface UserInfo {
  id?: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  // 其他字段...
}

// 获取侧边栏折叠状态
export const getSidebarCollapsed = (): boolean => {
  const collapsed = localStorage.getItem('sidebarCollapsed')
  return collapsed ? JSON.parse(collapsed) : false
}

// 设置侧边栏折叠状态
export const setSidebarCollapsed = (collapsed: boolean): void => {
  localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
}

export const getSidebarWidth = (): number | null => {
  const width = localStorage.getItem(SIDEBAR_WIDTH_KEY)
  return width ? parseInt(width, 10) : null
}

export const setSidebarWidth = (width: number): void => {
  localStorage.setItem(SIDEBAR_WIDTH_KEY, width.toString())
}

export const clearSidebarWidth = (): void => {
  localStorage.removeItem(SIDEBAR_WIDTH_KEY)
}

// ==================== Token 操作 ====================
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('LocalStorage access error:', e);
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

// ==================== 用户信息操作 ====================
export const getUserInfo = (): UserInfo | null => {
  try {
    const json = localStorage.getItem(USER_INFO_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('LocalStorage access error:', e);
    return null;
  }
};

export const setUserInfo = (userInfo: UserInfo): void => {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

export const clearUserInfo = (): void => {
  try {
    localStorage.removeItem(USER_INFO_KEY);
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

// ==================== 角色操作 ====================
export const getRole = (): number | null => {
  try {
    const role = localStorage.getItem(ROLE_KEY);
    return role ? Number(role) : null;
  } catch (e) {
    console.error('LocalStorage access error:', e);
    return null;
  }
};

export const setRole = (role: number): void => {
  try {
    localStorage.setItem(ROLE_KEY, String(role)); // 优化：用 String 替代 Number，避免存储为 [object Number]
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

export const clearRole = (): void => {
  try {
    localStorage.removeItem(ROLE_KEY);
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

// ==================== 路径记忆 ====================
export const getLastVisitedPath = (): string => {
  try {
    const path = localStorage.getItem(LAST_VISITED_PATH_KEY);
    return path || '/'; // 默认返回登录页
  } catch (e) {
    console.error('LocalStorage access error:', e);
    return '/';
  }
};

export const setLastVisitedPath = (path: string): void => {
  try {
    if (!['/login', '/register'].includes(path)) {
      localStorage.setItem(LAST_VISITED_PATH_KEY, path);
    }
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

export const clearLastVisitedPath = (): void => {
  try {
    localStorage.removeItem(LAST_VISITED_PATH_KEY);
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

// ==================== 通用方法 ====================
export const setStorage = <T = unknown>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

export const getStorage = <T = unknown>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch (e) {
    console.error('LocalStorage access error:', e);
    return null;
  }
};

export const clearStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};

// ==================== 清空所有 ====================
export const clearAll = (): void => {
  try {
    localStorage.clear();
  } catch (e) {
    console.error('LocalStorage access error:', e);
  }
};