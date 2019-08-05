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

$("#newGameBtnDiv").hide();

getPlayerName();




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

// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
connectedRef = database.ref(".info/connected");

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

function getPlayerName() {

    currentPlayer = prompt("Name");
    sessionStorage.setItem("Name", currentPlayer);
}

// When first loaded or when the connections list changes...
connectionsRef.on("value", function (snapshot) {
    // if (snapshot.numChildren() > 2) {
    //     $("#newGameBtnDiv").hide();
    //     $("#buttonsDiv").hide();
    //     $("#fightInfo").text(`No player slot available...Sorry`)
    // } else {
        //checks if there are no more than 2 players
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
        } else if (snapshot.numChildren() === 2) {
            var newUsersRef = database.ref().child("players").child(currentPlayer);
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
        }
    // }

    //removes player from database on disconnect
    (sessionStorage.getItem("Name") === currentPlayer) ? database.ref("/players/" + currentPlayer).onDisconnect().remove(): "";

    //Displays number of players connected
    //$("#chat").text(snapshot.numChildren());
});

//when player selects their choice it updates the db
$(".weapon-btn").on("click", function () {
    database.ref("/players/" + currentPlayer).update({
        choice: $(this).attr("data-weapon")
    });
});

//when player makes a choice
database.ref("/players/").on("child_changed", function (snap) {
    console.log(snap.val())
    if (snap.val().status === "playing") {
        if (snap.key === currentPlayer && snap.val().choice != "") {
            playerChoice = snap.val().choice;
            drawPlayerSelection("playerDiv", playerChoice);
            $("#buttonsDiv").hide();
        } else
            opponentChoice = snap.val().choice;

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

    if (snap.val().status === "finished") {
        if (snap.key === currentPlayer) {
            $("#playerScore").html(`${currentPlayer}<br><br>Wins: ${snap.val().wins}<br>Losses: ${snap.val().losses}`)
        } else {
            $("#opponentScore").html(`Opponent<br><br>Wins: ${snap.val().wins}<br>Losses: ${snap.val().losses}`)
        }


    }
});

$("#resetGameBtn").on("click", function () {
    database.ref("/players/" + currentPlayer).update({
        choice: "",
        status: "ready"
    });
});

function resetGame() {
    $("#newGameBtnDiv").hide()
    $("#buttonsDiv").show();
    playerChoice = "";
    opponentChoice = "";
    $("#playerDiv").empty();
    $("#opponentDiv").empty();
}

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

    var temp = {
        wins: wins,
        losses: losses
    }
    database.ref("/players/" + currentPlayer).update(temp);

    $("#fightInfo").text(fightText);
    //database.ref("/players/" + currentPlayer).update({status: "finished"});
    $("#newGameBtnDiv").show()
    return fightText;
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