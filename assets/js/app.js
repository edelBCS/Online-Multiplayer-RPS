var firebaseConfig;
var database;
var dbRef;
var connectionsRef;
var connectedRef;

//$(document).ready(function () {
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

    // connectionsRef references a specific location in our database.
    // All of our connections will be stored in this directory.
    connectionsRef = database.ref("/connections");

    // '.info/connected' is a special location provided by Firebase that is updated every time
    // the client's connection state changes.
    // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    connectedRef = database.ref(".info/connected");
//});

// When the client's connection state changes...
connectedRef.on("value", function (snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        var con = connectionsRef.push(true);
        console.log(snap.val());

        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function (snapshot) {
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    $("#chat").text(snapshot.numChildren());
});