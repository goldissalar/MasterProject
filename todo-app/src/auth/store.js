import { createStore } from 'vuex';
import { auth } from './auth.module';

const store = createStore({
  modules: {
    auth
  }
});

store.commit('auth/getState');
export default store;
