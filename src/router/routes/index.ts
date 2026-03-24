import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: () => import('@/layouts/main/index.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          i18nKey: 'route.home',
          title: 'Home',
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      i18nKey: 'route.login',
      title: 'Login',
      unAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/exceptions/404.vue'),
    meta: {
      i18nKey: 'route.not-found',
      title: 'Not Found',
      constant: true,
    },
  },
]

export const routeMap: Route.RouteMap = {
  'root': '/',
  'home': '/home',
  'login': '/login',
  'not-found': '/:pathMatch(.*)*',
}

/**
 * get route name by route path
 * @param path route path
 */
export function getRouteName(path: Route.RoutePath) {
  const routeEntries = Object.entries(routeMap) as [Route.RouteKey, Route.RoutePath][]

  const routeName: Route.RouteKey | null = routeEntries.find(([, routePath]) => routePath === path)?.[0] || null

  return routeName
}
