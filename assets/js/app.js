var firebaseConfig;
var database;
var dbRef;
var connectionsRef;
var connectedRef;
var player1Choice;
var player2Choice;

var playerName = prompt("Name");

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
        console.log("snap val" + snap)

        // Add user to the connections list.
        var con = connectionsRef.push(true);

        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
});

dbRef.set({players:{
        player1: {
            name: "",
            status: "",
            choice: ""
        },
        player2: {
            name: "",
            status: "",
            choice: ""
        }
    }
})

// When first loaded or when the connections list changes...
connectionsRef.on("value", function (snapshot) {
    

    // database.ref('/players').once('value').then(function(a){
    //     console.log(a.val())
        // dbRef.update({players:{
        //         player1: {
        //             name: "",
        //             status: "",
        //             choice: ""
        //         },
        //         player2: {
        //             name: "",
        //             status: "",
        //             choice: ""
        //         }
        //     }
        // })
        console.log(snapshot.numChildren())
        if (snapshot.numChildren() === 1){
            database.ref('/players/player1/').update({name: playerName});
            sessionStorage.setItem("playerNo", "1");
        }
        else if (snapshot.numChildren() === 2){
            database.ref('/players/player2/').update({name: playerName});
            sessionStorage.setItem("playerNo", "2");
        }
        else
            console.log("No Player slots available");

    //})
    console.log(sessionStorage.getItem("playerNo"));
    //(sessionStorage.getItem("playerNo") === "1")?database.ref("/players/player1").onDisconnect().update({name: ""}):"";
    //(sessionStorage.getItem("playerNo") === "2")?database.ref("/players/player2").onDisconnect().update({name: ""}):"";

    // sessionStorage.setItem()
    // dbRef.set({

    // })
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    $("#chat").text(snapshot.numChildren());
});

function whoWon() {
    if (player1Choice === player1Choice)
        return "tie";
    else if (player1Choice === 'rock' && (player2Choice === ('paper' || 'spock')))
        return "player2";
    else if (player1Choice === 'paper' && (player2Choice === ('scissors' || 'lizard')))
        return "player2";
    else if (player1Choice === 'scissors' && (player2Choice === ('rock' || 'spock')))
        return "player2";
    else if (player1Choice === 'spock' && (player2Choice === ('paper' || 'lizard')))
        return "player2";
    else if (player1Choice === 'lizard' && (player2Choice === ('scissors' || 'rock')))
        return "player2";
    else
        return "player1";
}

function drawPlayerSelection(player, selection) {
    var imgID;

    switch (selection) {
        case "rock":
            imgID = "rockImg";
            break;
        case "paper":
            imgID = "paperImg";
            break;
        case "scissors":
            imgID = "scissorImg";
            break;
        case "lizard":
            imgID = "lizardImg";
            break;
        case "spock":
                imgID = "spockImg";
                break;
    }
    var spriteDiv = 
        $("<div>")
            .attr("id", "spriteDiv")
            .addClass("rounded-top mx-auto")
            .append($("<img>")
                .attr("id", imgID)
                .attr("src", "assets/images/rpsls-sprite.png")
                .attr("alt", "sprite-image")
                .addClass("spriteImg")
            );

    var spriteText = $("<h2>")
            .addClass("spriteTag col-12 text-center mx-auto rounded-bottom")
            .text(selection.toUpperCase());

    $(`#${player}`).append(spriteDiv).append(spriteText);
}