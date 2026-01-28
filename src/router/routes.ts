import { RouteRecordRaw } from "vue-router";

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "HelloWorld",
    component: () => import("@/components/HelloWorld/index.vue"),
  },
];

export const privateRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "HelloWorld",
    component: () => import("@/components/HelloWorld/index.vue"),
  },
];

const routes: RouteRecordRaw[] = [...publicRoutes, ...privateRoutes];

export default routes;
