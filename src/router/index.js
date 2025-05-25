import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import Owners from '../components/Owners.vue'
import MapView from '../components/MapView.vue'
import AdminSignup from '../components/AdminSignup.vue'
import auth from '../components/auth.vue'

const routes = [
  { path: '/', component: MapView },
  { path: '/hello', component: HelloWorld },
  {path: '/map', component: MapView },
  {path:'/owners',component: Owners},{
    path:'/adminsignup',component:AdminSignup
  },
  {path:'/auth',component:auth}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router