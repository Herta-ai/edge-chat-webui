import { localStg } from '@/utils/storage'
import type {
  Router,
} from 'vue-router'

/**
 * create route guard
 *
 * @param router router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, _, next) => {
    const rootRoute: Route.RouteKey = 'root'
    const loginRoute: Route.RouteKey = 'login'

    const isLogin = Boolean(localStg.get('token'))
    const needLogin = !to.meta.unAuth

    // if it is login route when logged in, then switch to the root page
    if (to.name === loginRoute && isLogin) {
      next({ name: rootRoute })
      return
    }

    // if the route does not need login, then it is allowed to access directly
    if (!needLogin) {
      next()
      return
    }

    // the route need login but the user is not logged in, then switch to the login page
    if (!isLogin) {
      next({ name: loginRoute, query: { redirect: to.fullPath } })
      return
    }

    next()
  })
}
