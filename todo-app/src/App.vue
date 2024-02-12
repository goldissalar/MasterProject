<template>
  <v-app>
    <v-app-bar app color="#2196F3" dark v-if="loggedIn">
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col>
            <router-link to="/todos" class="nav-link">Todos</router-link>
            <button @click="logout" class="button button--primary button_navigation nav-link right-btn">Logout</button>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <v-app-bar app color="#2196F3" dark v-if="!loggedIn">
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col>
            <router-link to="/login" class="nav-link">Login</router-link>
            <router-link to="/register" class="nav-link">Registrieren</router-link>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <v-main>
      <v-container>
        <router-view/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from "vue";
import store from './auth/store';
import router from './router';

let loggedIn = computed(() => store.state.auth.loggedIn);

function logout() {
  store.commit('auth/logout');
  router.push('/login');
}
</script>
