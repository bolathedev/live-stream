import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import 'firebase/database';
import Vue from "vue"

let config = {
    apiKey: "AIzaSyD-p4iKRtSW9RH1wg_HLYqK1aTMlvYWX0g",
    authDomain: "reydaa-v1.firebaseapp.com",
    projectId: "reydaa-v1",
    storageBucket: "reydaa-v1.appspot.com",
    messagingSenderId: "31891085756",
    appId: "1:31891085756:web:4757b27c2b60494a5f73b9",
    measurementId: "G-5CH09DWKBN"
};

firebase.initializeApp(config)

const storage = firebase.storage();
const database = firebase.database();
const db = firebase.firestore();

Vue.prototype.$ui = ui
Vue.prototype.$database = database;
Vue.prototype.$db = db;
Vue.prototype.$storage = storage;
Vue.prototype.$firebase = firebase

