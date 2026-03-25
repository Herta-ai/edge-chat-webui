import { useAppStore } from '@/store/modules/app'
import { useRouteStore } from '@/store/modules/route'
import type { Router } from 'vue-router'

/**
 * create route guard
 *
 * @param router router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const appStore = useAppStore()
    const routeStore = useRouteStore()

    if (!routeStore.isInitConstantRoute) {
      // initialize the auth route
      await routeStore.initConstantRoute()
      return {
        path: to.path,
      }
    }

    if (to.name === 'wizard') {
      return true
    }

    if (!appStore.isInit) {
      // 直接 return 路由对象即可实现跳转
      return { name: 'wizard' }
    }

    // 4. 其他情况，放行 (返回 true 或不写 return)
    return true
  })
}
