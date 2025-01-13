import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Start',
      component: StartView
    },
    //  {
     // path: '/poll/:id',
    //  name: 'PollView',
    //  component: () => import('../views/PollView.vue')
   // },
    {
      path: '/lobby/:id',
      name: 'LobbyView',
      component: () => import('../views/LobbyView.vue')
    },
   
    

    {
      path: '/game/:gamePin',
      name: 'GameView',
      component: () => import('../views/GameView.vue'),
      
    },
    {
      path: '/customgames/:gamePin?',
      name: 'CustomGamesView',
      component: () => import ('../views/CustomGamesView.vue')
    }

  ]
})

export default router
