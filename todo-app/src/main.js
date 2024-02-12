import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './css/styles.css';
import axios from 'axios';
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { fa } from "vuetify/iconsets/fa";
import { aliases, mdi } from "vuetify/lib/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";
import "@fortawesome/fontawesome-free/css/all.css";
import store from './auth/store';

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
      fa,
    },
  },
  components,
  directives
})

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.use(store);
app.config.globalProperties.$axios = axios;
app.mount('#app');
