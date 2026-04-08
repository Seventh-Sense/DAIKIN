import { RouteRecordRaw } from "vue-router";

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/Home/index.vue"),
    children: [
      {
        path: "controller",
        name: "AddController",
        component: () => import("@/views/Flows/ControllerAdd/index.vue"),
      },
      {
        path: "firmwareupdate",
        name: "FirmwareUpdate",
        component: () => import("@/views/Flows/FirmwareUpdate/index.vue"),
      },
      {
        path: "devices",
        name: "EquipmentAddition",
        component: () => import("@/views/Flows/DeviceManage/index.vue"),
      },
      {
        path: "points/:id/:type/:name",
        name: "Points",
        component: () => import("@/views/Flows/Points/index.vue"),
      },
      {
        path: "mqtt",
        name: "MQTTConfiguration",
        component: () => import("@/views/Flows/MQTT/index.vue"),
      },
      {
        path: "ui",
        name: "UIConfiguration",
        component: () => import("@/views/Flows/UI/index.vue"),
      },
      {
        path: "check",
        name: "ConnectivityCheck",
        component: () => import("@/views/Flows/ConnectCheck/index.vue"),
      },
    ],
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
