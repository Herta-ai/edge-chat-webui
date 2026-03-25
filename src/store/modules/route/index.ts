import { computed, nextTick, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useBoolean } from '@sa/hooks'
import { router } from '@/router'
import { SetupStoreId } from '@/enum'
import { createStaticRoutes, getAuthVueRoutes } from '@/router/routes'
import { useTabStore } from '../tab'
import {
  getBreadcrumbsByRoute,
  getCacheRouteNames,
  getGlobalMenusByAuthRoutes,
  getSelectedMenuKeyPathByKey,
  sortRoutesByOrder,
  transformMenuToSearchMenus,
  updateLocaleOfGlobalMenus,
} from './shared'
import type { ElegantConstRoute, RouteKey } from '@elegant-router/types'
import type { RouteRecordRaw } from 'vue-router'

export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const tabStore = useTabStore()
  const { bool: isInitConstantRoute, setBool: setIsInitConstantRoute } = useBoolean()

  /** Home route key */
  const routeHome = ref(import.meta.env.VITE_ROUTE_HOME!)

  /** constant routes */
  const constantRoutes = shallowRef<ElegantConstRoute[]>([])

  function addConstantRoutes(routes: ElegantConstRoute[]) {
    const constantRoutesMap = new Map<string, ElegantConstRoute>([])

    routes.forEach((route) => {
      constantRoutesMap.set(route.name, route)
    })

    constantRoutes.value = Array.from(constantRoutesMap.values())
  }

  const removeRouteFns: (() => void)[] = []

  /** Global menus */
  const menus = ref<App.Global.Menu[]>([])
  const searchMenus = computed(() => transformMenuToSearchMenus(menus.value))

  /** Get global menus */
  function getGlobalMenus(routes: ElegantConstRoute[]) {
    menus.value = getGlobalMenusByAuthRoutes(routes)
  }

  /** Update global menus by locale */
  function updateGlobalMenusByLocale() {
    menus.value = updateLocaleOfGlobalMenus(menus.value)
  }

  /** Cache routes */
  const cacheRoutes = ref<RouteKey[]>([])

  /**
   * Exclude cache routes
   *
   * for reset route cache
   */
  const excludeCacheRoutes = ref<RouteKey[]>([])

  /**
   * Get cache routes
   *
   * @param routes Vue routes
   */
  function getCacheRoutes(routes: RouteRecordRaw[]) {
    cacheRoutes.value = getCacheRouteNames(routes)
  }

  /**
   * Reset route cache
   *
   * @default
   * @param routeKey
   */
  async function resetRouteCache(routeKey?: RouteKey) {
    const routeName = routeKey || (router.currentRoute.value.name as RouteKey)

    excludeCacheRoutes.value.push(routeName)

    await nextTick()

    excludeCacheRoutes.value = []
  }

  /** Global breadcrumbs */
  const breadcrumbs = computed(() => getBreadcrumbsByRoute(router.currentRoute.value, menus.value))

  /** Reset store */
  async function resetStore() {
    const routeStore = useRouteStore()

    routeStore.$reset()

    resetVueRoutes()

    // after reset store, need to re-init constant route
    await initConstantRoute()
  }

  /** Reset vue routes */
  function resetVueRoutes() {
    removeRouteFns.forEach(fn => fn())
    removeRouteFns.length = 0
  }

  /** init constant route */
  async function initConstantRoute() {
    if (isInitConstantRoute.value)
      return

    const staticRoute = createStaticRoutes()

    addConstantRoutes(staticRoute.constantRoutes)

    handleConstantAndAuthRoutes()

    setIsInitConstantRoute(true)

    tabStore.initHomeTab()
  }

  /** handle constant and auth routes */
  function handleConstantAndAuthRoutes() {
    const allRoutes = constantRoutes.value

    const sortRoutes = sortRoutesByOrder(allRoutes)

    const vueRoutes = getAuthVueRoutes(sortRoutes)

    resetVueRoutes()

    addRoutesToVueRouter(vueRoutes)

    getGlobalMenus(sortRoutes)

    getCacheRoutes(vueRoutes)
  }

  /**
   * Add routes to vue router
   *
   * @param routes Vue routes
   */
  function addRoutesToVueRouter(routes: RouteRecordRaw[]) {
    routes.forEach((route) => {
      const removeFn = router.addRoute(route)
      addRemoveRouteFn(removeFn)
    })
  }

  /**
   * Add remove route fn
   *
   * @param fn
   */
  function addRemoveRouteFn(fn: () => void) {
    removeRouteFns.push(fn)
  }

  /**
   * Get selected menu key path
   *
   * @param selectedKey Selected menu key
   */
  function getSelectedMenuKeyPath(selectedKey: string) {
    return getSelectedMenuKeyPathByKey(selectedKey, menus.value)
  }

  return {
    resetStore,
    routeHome,
    menus,
    searchMenus,
    updateGlobalMenusByLocale,
    cacheRoutes,
    excludeCacheRoutes,
    resetRouteCache,
    breadcrumbs,
    initConstantRoute,
    isInitConstantRoute,
    getSelectedMenuKeyPath,
  }
})
