import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import Owners from '../components/Owners.vue'
import MapView from '../components/MapView.vue'
import AdminSignup from '../components/AdminSignup.vue'
import auth from '../components/auth.vue'
import bookmarks from '../components/bookmarks.vue'
import more from '../components/more.vue'

const routes = [
  { path: '/', component: auth },
  { path: '/hello', component: HelloWorld },
  {path: '/map',name: 'MapView', component: MapView },
  {path:'/owners',component: Owners},{
    path:'/adminsignup',component:AdminSignup
  },
  {path:'/auth',component:auth},
  {path:'/bookmarks',component:bookmarks},
  {path:'/more',component:more}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router