import { RouteRecordRaw } from "vue-router";

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
  },
  {
    path: "/HelloWorld",
    name: "HelloWorld",
    component: () => import("@/components/HelloWorld/index.vue"),
  },
];

export const privateRoutes: RouteRecordRaw[] = [
  {
    path: "/HelloWorld",
    name: "HelloWorld",
    component: () => import("@/components/HelloWorld/index.vue"),
  },
];

const routes: RouteRecordRaw[] = [...publicRoutes, ...privateRoutes];

export default routes;
