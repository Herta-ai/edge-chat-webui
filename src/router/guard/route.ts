import type {
  Router,
} from 'vue-router'

/**
 * create route guard
 *
 * @param router router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (_to, _from, next) => {
    // const initRoute: Route.RouteKey = 'init'

    // @todo：如果未初始化，先跳转/init

    next()
  })
}
