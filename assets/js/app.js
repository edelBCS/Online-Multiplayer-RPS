var firebaseConfig;
var database;
var dbRef;

$(document).ready(function(){
  // Your web app's Firebase configuration
  firebaseConfig = {
    apiKey: "AIzaSyACzAWnyG_pLE7-4l0939rWUvevQMC2ZHc",
    authDomain: "rpsgame-4a7a0.firebaseapp.com",
    databaseURL: "https://rpsgame-4a7a0.firebaseio.com",
    projectId: "rpsgame-4a7a0",
    storageBucket: "",
    messagingSenderId: "434349031634",
    appId: "1:434349031634:web:28a183bda462b0a0"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  dbRef = database.ref();
});