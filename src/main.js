import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./quasar";
import "./agora";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/database";

let config = {
  apiKey: "AIzaSyAYbSWw3CSqaJs-CXQbUfV9c2jbYNf9cKs",
  authDomain: "livestream-app-v1.firebaseapp.com",
  projectId: "livestream-app-v1",
  storageBucket: "livestream-app-v1.appspot.com",
  messagingSenderId: "60815454448",
  appId: "1:60815454448:web:4ee17b77cef5baef2b1235",
  measurementId: "G-EC2YHMFHDS",
};

firebase.initializeApp(config);

const storage = firebase.storage();
const database = firebase.database();
const db = firebase.firestore();

Vue.prototype.$database = database;
Vue.prototype.$db = db;
Vue.prototype.$storage = storage;
Vue.prototype.$firebase = firebase;
Vue.use(ElementUI);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
