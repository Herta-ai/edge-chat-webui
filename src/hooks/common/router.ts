import { useRouter } from 'vue-router'
import { router as globalRouter } from '@/router'
import type { RouteLocationRaw } from 'vue-router'
import type { RouteKey } from '@elegant-router/types'

/**
 * Router push
 *
 * Jump to the specified route, it can replace function router.push
 *
 * @param inSetup Whether is in vue script setup
 */
export function useRouterPush(inSetup = true) {
  const router = inSetup ? useRouter() : globalRouter
  const route = globalRouter.currentRoute

  const routerPush = router.push

  const routerBack = router.back

  async function routerPushByKey(key: RouteKey, options?: App.Global.RouterPushOptions) {
    const { query, params } = options || {}

    const routeLocation: RouteLocationRaw = {
      name: key,
    }

    if (Object.keys(query || {}).length) {
      routeLocation.query = query
    }

    if (Object.keys(params || {}).length) {
      routeLocation.params = params
    }

    return routerPush(routeLocation)
  }

  function routerPushByKeyWithMetaQuery(key: RouteKey) {
    const allRoutes = router.getRoutes()
    const meta = allRoutes.find(item => item.name === key)?.meta || null

    const query: Record<string, string> = {}

    meta?.query?.forEach((item) => {
      query[item.key] = item.value
    })

    return routerPushByKey(key, { query })
  }

  async function toHome() {
    return routerPushByKey('root')
  }

  return {
    toHome,
    routerPush,
    routerBack,
    routerPushByKey,
    routerPushByKeyWithMetaQuery,
  }
}
