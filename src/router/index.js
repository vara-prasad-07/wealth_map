import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import Owners from '../components/Owners.vue'
import MapView from '../components/MapView.vue'
import AdminSignup from '../components/AdminSignup.vue'
import auth from '../components/auth.vue'
import bookmarks from '../components/bookmarks.vue'

const routes = [
  { path: '/', component: auth },
  { path: '/hello', component: HelloWorld },
  {path: '/map', component: MapView },
  {path:'/owners',component: Owners},{
    path:'/adminsignup',component:AdminSignup
  },
  {path:'/auth',component:auth},
  {path:'/bookmarks',component:bookmarks}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router