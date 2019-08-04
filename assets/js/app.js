var firebaseConfig;
var database;
var dbRef;
var connectionsRef;
var connectedRef;
var player1Choice;
var player2Choice;


var currentPlayer = prompt("Name");
sessionStorage.setItem("Name", currentPlayer);


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

        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
});

// dbRef.set({players:{
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

// When first loaded or when the connections list changes...
connectionsRef.on("value", function (snapshot) {

    //checks if there are no more than 2 players
    if(snapshot.numChildren() === 1 || snapshot.numChildren() === 2){
        console.log("test")
        var newUsersRef = database.ref().child("players").child(currentPlayer);
        var setup = {choice: ""};
        newUsersRef.set(setup);
    } else {
        console.log("No more player slots available!")
    }

    //removes player from database on disconnect
    (sessionStorage.getItem("Name") === currentPlayer) ? database.ref("/players/" + currentPlayer).onDisconnect().remove(): "";
    
    //Displays number of players connected
    $("#chat").text(snapshot.numChildren());
});

$("button").on("click", function(){
    database.ref("/players/" + currentPlayer).update({choice: $(this).attr("data-weapon")});
});

//when player makes a choice
database.ref("/players").on("value", function(snap){
    console.log(snap.key)
    
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