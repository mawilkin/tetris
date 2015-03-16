Parse.initialize("XctRj8yjGvXLptN5MH6BdlBl2eE4bKVSDnYM8yVu", 
	"GzPkrCSUdURM3HTmtdtMjhKWJtiRvxWyMllWRifx");

var colors = [
	'#F7977A', '#FDC68A', '#82CA9D', '#7EA7D8', '#A187BE', '#F49AC2'
]

//Check for cached user
$(document).ready(function(){
	var user = Parse.User.current();
	console.log(user);

	if(user){
		showStart();
	} else {
		showLogIn();
	}
});

function showLogIn(){
	$('#start-btn').hide();
	$('#logout-btn').hide();
	$('#profile-view').hide();

	$('#signup-view').show();
	$('#login-view').show();	
}

function showStart(){
	$('#signup-view').hide();
	$('#login-view').hide();

	$('#start-btn').show();
	$('#logout-btn').show();
	$('#profile-view').show();

	//Set random profile card color
	var color = colors[Math.floor(Math.random()*colors.length)];
	$('#profile-view').css('background-color', color); 

	//Gather info for profile card
	updateProfile();
}

function updateProfile(){
	var user = Parse.User.current();

	//Initialize with cached values
	var imageUrl = user.attributes.photo;
	var fullname = user.attributes.name;
	var level = Math.floor(user.attributes.totalScore/10);
	var highScore = user.attributes.highScore;

	//Update UI
	//$('#photo').css('background-image', 'url("' + imageUrl + '")');
	$('#fullname').text(fullname);
	$('#level').text(level);
	$('#high-score').text(highScore);

	//Update with Parse values
	var query = new Parse.Query(Parse.User);
	query.equalTo("username", user.attributes.username);
	query.find({
		success: function(data){
			imageUrl = data[0].attributes.photo;
			fullname = data[0].attributes.name;
			level = Math.floor(data[0].attributes.totalScore/10);
			highScore = data[0].attributes.highScore;

			//Update UI
			//$('#photo').css('background-image', 'url("' + imageUrl + '")');
			$('#fullname').text(fullname);
			$('#level').text(level);
			$('#high-score').text(highScore);
		}
	})	
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

	var user = new Parse.User();
	user.set('name', fullname);
	user.set('username', username);
	user.set('password', password);
	user.set('totalScore', 0);
	user.set('highScore', 0);

	user.signUp(null, {
		success: function(data){
			console.log(data);
			showStart();
		},
		error: function(data, error){
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
			console.log(error);
		}
	})
	
}