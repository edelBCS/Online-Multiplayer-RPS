var firebaseConfig;
var database;
var dbRef;
var connectionsRef;
var connectedRef;
var players;
var playerChoice = "";
var opponentChoice = "";
var playerStatus = "";
var opponentStatus = "";
var wins = 0;
var losses = 0;
var currentPlayer = "";
var gameStatus = "open";

$("#newGameBtnDiv").hide();
$("#buttonsDiv").hide();


//Firebase configuration
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

getPlayerName();

// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function (snap) {
    console.log(snap.val())
    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        var con = connectionsRef.push(true);

        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
});

async function getPlayerName() {
    var playerInfo = await database.ref("/players").once("value").then(function (snap) {
        var temp =  snap.numChildren();
        var temp2 = snap.val();
        return {noChilds: temp, oppkey: temp2};
    })

    console.log(playerInfo)
    if (playerInfo.noChilds >= 2) {
        database.goOffline();
        $("#fightInfo").text(`Too Many Players Connected...Try again later.`);
        $("#chat").hide();
        console.log("too many players")
        
    } else {
        currentPlayer = prompt("Name");
        sessionStorage.setItem("Name", currentPlayer);
        if (currentPlayer === null)
            location.replace("noname.html");
        else{
            console.log("Player Info " + playerInfo.oppkey)
            if(playerInfo.oppkey != null && playerInfo.oppkey[currentPlayer]){
                alert("Player already has that name!");
                getPlayerName();
            }else{
                
            }            
        }
            
        return currentPlayer;
    }
}

// When first loaded or when the connections list changes...
connectionsRef.on("value", function (snapshot) {
    if(gameStatus === "open"){
        if (snapshot.numChildren() === 1) {
            var newUsersRef = database.ref().child("players").child(currentPlayer);
            var setup = {
                choice: "",
                status: "waiting",
                wins: 0,
                losses: 0
            };
            newUsersRef.set(setup);
            $("#playerScore").html(`${currentPlayer}<br><br>Wins: ${wins}<br>Losses: ${losses}`);
            $("#opponentScore").html(`Waiting for Opponent...`);
            $("#buttonsDiv").hide();
        } else if (snapshot.numChildren() === 2) {
            var newUsersRef = database.ref().child("/players").child(currentPlayer);
            var setup = {
                choice: "",
                status: "playing",
                wins: 0,
                losses: 0
            };
            newUsersRef.set(setup);
            $("#playerScore").html(`${currentPlayer}<br><br>Wins: ${wins}<br>Losses: ${losses}`);
            $("#fightInfo").text(`Choose Your Weapon`);
            $("#opponentScore").html(`Opponent<br><br>Wins: ${wins}<br>Losses: ${losses}`);
            $("#buttonsDiv").show();
            gameStatus = "full";
        }
    }else if(gameStatus === "full" && snapshot.numChildren() === 1){
        gameStatus = "open";
        var newUsersRef = database.ref().child("players").child(currentPlayer);
            var setup = {
                choice: "",
                status: "waiting",
                wins: 0,
                losses: 0
            };
            newUsersRef.set(setup);
            $("#playerScore").html(`${currentPlayer}<br><br>Wins: ${wins}<br>Losses: ${losses}`);
            $("#opponentScore").html(`Waiting for Opponent...`);
            $("#fightInfo").text(`Opponent Disconnected`);
            $("#buttonsDiv").hide();
            $("#newGameBtnDiv").hide();
            $("#playerDiv").empty();
            $("#opponentDiv").empty();
            wins = 0;
            losses = 0;
    }

    //removes player from database on disconnect
    database.ref("/players/" + currentPlayer).onDisconnect().remove();
    database.ref("/chat").onDisconnect().remove();

    console.log(gameStatus)
});

//when player selects their choice it updates the db
$(".weapon-btn").on("click", function () {
    database.ref("/players/" + currentPlayer).update({
        choice: $(this).attr("data-weapon")
    });
});

//When player chice is updated in DB
database.ref("/players/").on("child_changed", function (snap) {
    console.log(snap.val())

    //Check if they are in a game
    if (snap.val().status === "playing") {
        //save players choice and draw to screen
        if (snap.key === currentPlayer && snap.val().choice != "") {
            playerChoice = snap.val().choice;
            drawPlayerSelection("playerDiv", playerChoice);
            $("#fightInfo").text(`Waiting for Opponent Selection...`);
            $("#buttonsDiv").hide();
            //otherwise save as opponent choice
        } else
            opponentChoice = snap.val().choice;

        //if both players have chosen, check who wins
        if (playerChoice != "" && opponentChoice != "") {
            drawPlayerSelection("opponentDiv", opponentChoice);

            database.ref("/players/" + currentPlayer).update({
                status: "finished"
            });

            console.log(whoWon());

            opponentStatus = "finished";
            playerStatus = "finished";

        }
    }

    //check to see if both players are ready for a new game
    if (snap.val().status === "ready") {
        if (snap.key === currentPlayer) {
            $("#fightInfo").text("Waiting for Opponent");
            playerStatus = snap.val().status;
        } else {
            $("#fightInfo").text("Opponent is Ready");
            opponentStatus = snap.val().status;
        }

        if (opponentStatus === "ready" && playerStatus === "ready") {
            resetGame();
            $("#fightInfo").text("Select Your Weapon!");
            database.ref("/players/" + currentPlayer).update({
                status: "playing"
            });
        }
    }

    //when game is finished write scores to the DOM
    if (snap.val().status === "finished") {
        if (snap.key === currentPlayer) {
            $("#playerScore").html(`${currentPlayer}<br><br>Wins: ${snap.val().wins}<br>Losses: ${snap.val().losses}`)
        } else {
            $("#opponentScore").html(`Opponent<br><br>Wins: ${snap.val().wins}<br>Losses: ${snap.val().losses}`)
        }


    }
});

//Sets player to ready when newGameBtn is clicked
$("#resetGameBtn").on("click", function () {
    database.ref("/players/" + currentPlayer).update({
        choice: "",
        status: "ready"
    });

    $("#newGameBtnDiv").hide();
});

//resets DOM and var's for new game
function resetGame() {
    $("#newGameBtnDiv").hide()
    $("#buttonsDiv").show();
    playerChoice = "";
    opponentChoice = "";
    $("#playerDiv").empty();
    $("#opponentDiv").empty();
}

//Check who won the game 
function whoWon() {
    var fightNoun = "";
    var fightText = "";
    console.log(playerChoice);
    console.log(opponentChoice);

    if (playerChoice === opponentChoice) {
        fightText = `It's a Tie: ${playerChoice} vs ${opponentChoice}`;
    } else if (playerChoice === "rock" && (opponentChoice === "paper" || opponentChoice === "spock")) {
        (opponentChoice === "paper") ? fightNoun = "covers": "";
        (opponentChoice === "spock") ? fightNoun = "vaporizes": "";
        fightText = `You Lose: ${opponentChoice} ${fightNoun} ${playerChoice}`;
        ++losses;
    } else if (playerChoice === "paper" && (opponentChoice === "scissors" || opponentChoice === "lizard")) {
        (opponentChoice === "scissors") ? fightNoun = "cut": "";
        (opponentChoice === "lizard") ? fightNoun = "eats": "";
        fightText = `You Lose: ${opponentChoice} ${fightNoun} ${playerChoice}`;
        ++losses;
    } else if (playerChoice === "scissors" && (opponentChoice === "rock" || opponentChoice === "spock")) {
        (opponentChoice === "rock") ? fightNoun = "crushes": "";
        (opponentChoice === "spock") ? fightNoun = "smashes": "";
        fightText = `You Lose: ${opponentChoice} ${fightNoun} ${playerChoice}`;
        ++losses;
    } else if (playerChoice === "spock" && (opponentChoice === "paper" || opponentChoice === "lizard")) {
        (opponentChoice === "paper") ? fightNoun = "disproves": "";
        (opponentChoice === "lizard") ? fightNoun = "poisons": "";
        fightText = `You Lose: ${opponentChoice} ${fightNoun} ${playerChoice}`;
        ++losses;
    } else if (playerChoice === "lizard" && (opponentChoice === "scissors" || opponentChoice === "rock")) {
        (opponentChoice === "scissors") ? fightNoun = "decapitates": "";
        (opponentChoice === "rock") ? fightNoun = "crushes": "";
        fightText = `You Lose: ${opponentChoice} ${fightNoun} ${playerChoice}`;
        ++losses;
    } else {
        if (playerChoice === "rock") {
            if (opponentChoice === "scissors")
                fightNoun = "crushes";
            if (opponentChoice === "lizard")
                fightNoun = "crushes";
        } else if (playerChoice === "paper") {
            if (opponentChoice === "rock")
                fightNoun = "covers";
            if (opponentChoice === "spock")
                fightNoun = "disproves";
        } else if (playerChoice === "scissors") {
            if (opponentChoice === "paper")
                fightNoun = "cuts";
            if (opponentChoice === "lizard")
                fightNoun = "decapitates";
        } else if (playerChoice === "lizard") {
            if (opponentChoice === "spock")
                fightNoun = "poisons";
            if (opponentChoice === "paper")
                fightNoun = "eats";
        } else if (playerChoice === "spock") {
            if (opponentChoice === "scissors")
                fightNoun = "smashes";
            if (opponentChoice === "rock")
                fightNoun = "vaporizes";
        }
        fightText = `Winner: ${playerChoice} ${fightNoun} ${opponentChoice}`;
        ++wins;
    }

    console.log(`Wins: ${wins}, Losses: ${losses}`);

    //writes score to DB
    var temp = {
        wins: wins,
        losses: losses
    }
    database.ref("/players/" + currentPlayer).update(temp);

    $("#fightInfo").text(fightText);

    $("#newGameBtnDiv").show()

    return fightText;
}

//draws DOM elements for player selection
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

//pushes chat text to DB
$("#chatSendBtn").on("click", e => {
    e.preventDefault();

    dbRef.child("chat").push("<strong>" + currentPlayer + ":</strong> " + $("#chatText").val());

    $("#chatText").val("");


});

//Adds chat text to DOM
database.ref("/chat").on("child_added", function (snap) {
    $(".commentList")
        .append($("<li>")
            .append($("<div>")
                .addClass("commentText")
                .append($("<p>").html(snap.val()))
            )
        );

    $(".commentList").scrollTop($(".commentList").prop("scrollHeight"));

});

// //Removes all connections from players
// $("#kickOffBtn").on("click", e => {
//     connectionsRef.set({});
// });