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
        path: "controller/:address",
        name: "AddController",
        component: () => import("@/views/Flows/ControllerAdd/index.vue"),
      },
      {
        path: "firmwareupdate/:address",
        name: "FirmwareUpdate",
        component: () => import("@/views/Flows/FirmwareUpdate/index.vue"),
      },
      {
        path: "devices/:address",
        name: "EquipmentAddition",
        component: () => import("@/views/Flows/DeviceManage/index.vue"),
      },
      {
        path: "points/:id/:type/:name",
        name: "Points",
        component: () => import("@/views/Flows/Points/index.vue"),
      },
      {
        path: "mqtt/:address",
        name: "MQTTConfiguration",
        component: () => import("@/views/Flows/MQTT/index.vue"),
      },
      {
        path: "ui/:address",
        name: "UIConfiguration",
        component: () => import("@/views/Flows/UI/index.vue"),
      },
      {
        path: "check/:address",
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
