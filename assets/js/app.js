var firebaseConfig;
var database;
var dbRef;
var connectionsRef;
var connectedRef;
var players;
var playerChoice = "";
var opponentChoice = "";


var currentPlayer = prompt("Name");
sessionStorage.setItem("Name", currentPlayer);
$("#newGameBtnDiv").hide();


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

$(".weapon-btn").on("click", function(){
    database.ref("/players/" + currentPlayer).update({choice: $(this).attr("data-weapon")});
});

//when player makes a choice
database.ref("/players/").on("child_changed", function(snap){
    console.log(snap.val())
    if(snap.key === currentPlayer){
        playerChoice = snap.val().choice;
        drawPlayerSelection("playerDiv", playerChoice);
        $("#buttonsDiv").hide();
    }
    else
        opponentChoice = snap.val().choice;

    if (playerChoice != "" && opponentChoice != ""){
        drawPlayerSelection("opponentDiv", opponentChoice);
        console.log(whoWon());
        $("#newGameBtnDiv").show()
    }
});

$("#resetGameBtn").on("click", function(){
    resetGame();
});

function resetGame(){
    $("#newGameBtnDiv").hide()
    $("#buttonsDiv").show();
    playerChoice = "";
    opponentChoice = "";
    $("#playerDiv").empty();
    $("#opponentDiv").empty();

}

function whoWon() {
    var fightNoun = "";

    if (playerChoice === opponentChoice)
        $("#fightInfo").text(`It's a Tie: ${playerChoice} vs ${opponentChoice}`);
    else if (playerChoice === 'rock' && (opponentChoice === ('paper' || 'spock')))
        return "loss";
    else if (playerChoice === 'paper' && (opponentChoice === ('scissors' || 'lizard')))
        return "loss";
    else if (playerChoice === 'scissors' && (opponentChoice === ('rock' || 'spock')))
        return "loss";
    else if (playerChoice === 'spock' && (opponentChoice === ('paper' || 'lizard')))
        return "loss";
    else if (playerChoice === 'lizard' && (opponentChoice === ('scissors' || 'rock')))
        return "loss";
    else
        return "Winner ";
}

function drawPlayerSelection(playerDiv, selection) {
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

    $(`#${playerDiv}`).append(spriteDiv).append(spriteText);
}