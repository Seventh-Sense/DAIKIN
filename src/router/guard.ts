import {
  Router,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";

export const setupRouterGuard = (router: Router) => {
  router.beforeEach(
    (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
        console.log(to, from)

        next()
    },
  );
  router.afterEach(() => {});
};
