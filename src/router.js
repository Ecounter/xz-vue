import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Index from './views/Index'
import Details from './views/Details'
import Products from './views/Products'
import Login from './views/Login'
import NotFound from './views/NotFound'
//ES6

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', component: Home, children:[
        { path:"", component: Index },
        { path:"details", component: Details },
        { path:"products", component: Products },
    ]},
    { path: '/login', component: Login },
    { path: '/*', component:NotFound }
  ]
})
