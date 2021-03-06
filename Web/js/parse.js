Parse.initialize("XctRj8yjGvXLptN5MH6BdlBl2eE4bKVSDnYM8yVu", 
	"GzPkrCSUdURM3HTmtdtMjhKWJtiRvxWyMllWRifx");

var userColors = [
	'#F7977A', '#FDC68A', '#82CA9D', '#7EA7D8', '#A187BE', '#F49AC2'
]

//Check for cached user
$(document).ready(function(){
	var user = Parse.User.current();
	console.log(user);

	//Load login page or profile page if on home.html
	var currentPage = document.location.href;
	if (currentPage.indexOf("home.html") > -1) {
		if(user){
			showStart();
		} else {
			showLogIn();
		}
	}
});

function showLogIn(){
	$('#start-btn').hide();
	$('#logout-btn').hide();
	$('#profile-view').hide();
	$('#scores-view').hide();
	$('#input-method-view').hide();

	$('#guest-view').show();
	$('#signup-view').show();
	$('#login-view').show();	
}

function showStart(){
	$('#guest-view').hide();
	$('#signup-view').hide();
	$('#login-view').hide();

	$('#start-btn').show();
	$('#logout-btn').show();
	$('#profile-view').show();
	$('#scores-view').show();
	$('#input-method-view').show();

	//Gather info for profile card
	updateProfile();
}

function updateProfile(){
	var user = Parse.User.current();

	//Initialize with cached values
	var fullname = user.attributes.name;
	var username = user.attributes.username;
	var level = Math.floor(user.attributes.totalScore/10);
	var highScore = user.attributes.highScore;
	var color = user.attributes.color;

	//Update UI
	$('#fullname').text(fullname);
	$('#user_name').text('"'+username+'"');
	$('#level').text(level);
	$('#high-score').text(highScore);
	$('#profile-view').css('background-color', color); 
	$('#profile-pic').attr("src", user.attributes.identicon);

	//Update with Parse values
	var query = new Parse.Query(Parse.User);
	query.equalTo("username", user.attributes.username);
	query.find({
		success: function(data){
			var fullname = data[0].attributes.name;
			var level = Math.floor(data[0].attributes.totalScore/10);
			var highScore = data[0].attributes.highScore;
			var src = data[0].attributes.identicon;

			//Update UI
			$('#fullname').text(fullname);
			$('#level').text(level);
			$('#high-score').text(highScore);
			$('#profile-view').css('background-color', color);
			$('#profile-pic').attr("src", src);	
		}
	})	

	var statsQuery = new Parse.Query(Parse.Object.extend("Stats"));
	statsQuery.find({
		success: function(data){
			//Sort high scores
			data.sort(highScoreSort);

			//Update UI
			updateScoreTable(data);
		}
	})	
}

function highScoreSort(a, b){
	//Compare "a" and "b" 
	return (b.attributes.score - a.attributes.score); 
}

function updateScoreTable(data){
	var table = document.getElementById("high-scores");

	//Clear existing table rows
	for(i = table.rows.length; i > 0; i--) {
		table.deleteRow(i-1);
	}

	//Insert rows with top high score data
    for (i = 0; i < data.length; i++) {
		var row = table.insertRow(i);
		var name = row.insertCell(0);
		var score = row.insertCell(1);
		name.innerHTML = data[i].attributes.username;
		score.innerHTML = data[i].attributes.score;
    }
}

//Log out current user
function logOut(){
	Parse.User.logOut();
	showLogIn();
}

//Sign up a new user
function signUp(){
	var fullname = $('#new-fullname').val();
	var username = $('#new-username').val();
	var password = $('#new-password').val();
	var color = userColors[Math.floor(Math.random()*userColors.length)];

	//Banhammer XSS attacks
	if(fullname.indexOf('<') != -1 || username.indexOf('<') != -1 ||
		password.indexOf('<') != -1) {
		alert("Illegal Character");
		return;
	}

	//Generate unique identicon
	var hash = CryptoJS.MD5(username).toString();
	var identicon = new Identicon(hash, 210).toString();
	var picURL = 'data:image/png;base64,' +  identicon;

	var user = new Parse.User();
	user.set('name', fullname);
	user.set('username', username);
	user.set('password', password);
	user.set('totalScore', 0);
	user.set('highScore', 0);
	user.set('color', color);
	user.set('identicon', picURL);

	user.signUp(null, {
		success: function(data){
			console.log(data);
			showStart();
		},
		error: function(data, error){
			alert('Account already exists');
			console.log(error);
		}
	});	
}

//Log in an existing user
function logIn(){
	var username = $('#username').val();
	var password = $('#password').val();

	Parse.User.logIn(username, password, {
		success: function(user){
			console.log(user);
			showStart();
		},
		error: function(user, error){
			alert('Incorrect username or password');
			console.log(error);
		}
	})	
}

//Update high scores
function updateHighScore(score){
	var user = Parse.User.current();
	if (user) {
		var highScore = user.attributes.highScore;
		var totalScore = user.attributes.totalScore;
		totalScore += score;

		//Update user's total score
		user.set('totalScore', totalScore);
		user.save(null, {
			success: function(user) {},
			error: function(user, error) {
				console.log(error);
			}
		});

		//Update user's high score
		if (score > highScore) {
			user.set('highScore', score);
			user.save(null, {
				success: function(user) {},
				error: function(user, error) {
					console.log(error);
				}
			});
		}

		//Update global high scores
		var statsQuery = new Parse.Query(Parse.Object.extend("Stats"));
		statsQuery.find({
			success: function(data){
				//Sort high scores
				data.sort(highScoreSort);

				if (score > data[data.length-1].attributes.score) {
					//Replace lowest high score with new high score
					var Stats = Parse.Object.extend("Stats");
					var stat = new Stats();
					stat.id = data[data.length-1].id;

					stat.set('score', score);
					stat.set('username', user.attributes.username);

					stat.save(null, {
						success: function(stat) {
						},
						error: function(stat, error) {
							console.log(error);
						}
					});
				} else {
					//window.location.href = 'home.html';
				}
			},
			error: function(data, error){
				console.log(error);
			}
		})
	} else {		
		console.log("guest mode, no high score recorded");
	}
}


function reply_click(clicked_id) {
	var input_input = document.getElementById("input_input");
	input_input.value = clicked_id;
}

function startGame() {
	var input_form = document.getElementById("input_form");
	input_form.submit();
}
