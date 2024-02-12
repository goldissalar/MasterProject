import store from './store';
export default function authHeader() {
    let access_token = store.state.auth.access_token
  
    if (access_token) {
      return { Authorization: 'Bearer ' + access_token };
    } else {
      return {};
    }
}
