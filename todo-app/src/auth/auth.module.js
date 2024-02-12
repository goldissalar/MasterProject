export const auth = {
  namespaced: true,

  state: {
    loggedIn: false,
    username: localStorage.getItem('username') != null ? localStorage.getItem('username') :  null,
    id: localStorage.getItem('id') != null ? localStorage.getItem('id') :  null,
  },
  mutations: {
    setJWT(state) {
      localStorage.setItem('authState', JSON.stringify(state));
    },
    logout(state) {
      state.loggedIn = false;
      state.username = null;
      state.id = null;
      localStorage.removeItem('authState');
    },
    getState(state) {
      console.log(state);
      const storedState = JSON.parse(localStorage.getItem('authState'));
      if (storedState) {
        Object.assign(state, storedState);
      }
    }
  }
};
