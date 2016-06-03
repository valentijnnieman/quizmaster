/*************************************
//
// quizmaster-socket app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var device  = require('express-device');
var mysql = require('mysql');
var fs = require('fs');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'guybrush1',
  database : 'quizmaster'
 });
var bodyParser = require('body-parser')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var runningPortNumber = process.env.PORT;

app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});

app.get("/", function(req, res){
	res.render('index', {});
});

/////////////////////////////////////////////
// USER
////////////////////

app.post("/user/login", function(req, res){
	var query = "SELECT * FROM user WHERE name = '" + req.body.name + "' && password = '" + req.body.password + "';";
	console.log(query);
	connection.query(query, function(err, rows, fields) {
	  //if (err) throw err;
	  if(rows[0]) {
	  	rows[0].password = '***';
	  	return res.json(rows[0]);
	  }
	  else {
	  	res.status(404);
	  }
	});
});

app.post("/user", function(req, res){
	// test if user's name already exists
	var test = "SELECT * FROM user WHERE name = '" + req.body.name + "';";
	connection.query(test, function(err, result) {
		if(result[0]){
			res.status(500).send("User already exists")
		}
		else {
			var query = "INSERT INTO user VALUES (NULL, '" + req.body.name + "', '" + req.body.password + "', 0);";
			console.log(query);
			connection.query(query, function(err, rows, fields) {
			  //if (err) throw err;
			  res.send('Created user');	
			});
		}
	});
});

app.put("/user/:id", function(req, res){
	var query = "UPDATE user SET name = '" + req.body.name + "'" + " WHERE id='" + req.params.id + "';";
	console.log(query);
	connection.query(query, function(err, rows, fields) {
	  //if (err) throw err;
	  res.send('Created user');	
	  });
});

app.get("/user/:id", function(req, res){
		// check if user exists
	var query = 'SELECT * FROM user WHERE id = ' + req.params.id + ';';
	connection.query(query, function(err, rows, fields) {
	  //if (err) throw err;
	  if(rows[0]) {
	  	return res.json(rows[0]);
	  }
	  else {
	  	res.send('User does not exist');
	  }
	});
});

/////////////////////////////////////////////
// TEAM
////////////////////

app.get("/team", function(req, res) {
	var query = 'SELECT * FROM team;';
	connection.query(query, function(err, result) {
		return res.json(result);
	});
});

app.post("/team", function(req, res){
	// test if team's name already exists
	var test = "SELECT * FROM team WHERE name = '" + req.body.name + "';";
	connection.query(test, function(err, result) {
		if(result[0]){
			res.status(500).send("Team already exists")
		}
		else {
			var query = "INSERT INTO team VALUES (NULL, '" + req.body.name + "', 0);";
			console.log(query);
			connection.query(query, function(err, rows, fields) {
			  //if (err) throw err;
			  res.send(req.body.name);	
			});
		}
	});
});

app.post("/team/register", function(req, res) {
	var get_team_id = "SELECT * FROM team WHERE name = '" + req.body.name + "';";
	connection.query(get_team_id, function(err, rows, fields) {
		var team_id = rows[0].id;

		// first attempt to delete duplicate values
		var delete_duplicate = "DELETE FROM users_in_team WHERE user_id = " + req.body.user_id + " && team_id = " + team_id + ";";
		connection.query(delete_duplicate, function(){ console.log('deleted dupe'); });
		console.log(delete_duplicate);
		var reg_user_with_team = "INSERT INTO users_in_team VALUES(" + req.body.user_id + ", " + team_id + ");";
		connection.query(reg_user_with_team, function(req, res) {

		});
	});
});

app.post("/team/reg_team_with_game", function(req, res) {
	var get_team_id = "SELECT * FROM team WHERE name = '" + req.body.name + "';";
	connection.query(get_team_id, function(err, rows, fields) {
		var team_id = rows[0].id;
				
		// first attempt to delete duplicate values
		var delete_duplicate = "DELETE FROM users_in_team WHERE team_id = " + team_id + " && game_id = " + req.body.game_id + ";";
		connection.query(delete_duplicate, function(){ console.log('deleted dupe'); });

		var reg_team_with_game = "INSERT INTO teams_in_game VALUES(" + team_id + ", " + req.body.game_id + ");";
		connection.query(reg_team_with_game, function(req, res) {

		});
	}); 
})

app.get("/team/users", function(req, res) {
	var get_users = "SELECT * FROM users_in_team WHERE team_id = " + req.body.team_id;
	connection.query(get_users, function(err, result) {
		return res.json(result);
	});
});

/////////////////////////////////////////////
// GAME
////////////////////

// app.post("/game/join", function(req, res){
// 	var query = "SELECT * FROM game WHERE room_id = '" + req.body.room_id + "';";
// 	console.log(query);
// 	connection.query(query, function(err, rows, fields) {
// 	  //if (err) throw err;
// 	  if(rows[0]) {
// 	  	return res.json(rows[0]);
// 	  }
// 	  else {
// 	  	res.status(404);
// 	  }
// 	});
// });

app.post("/game", function(req, res){
	var query = "INSERT INTO game VALUES (NULL, " + req.body.id + ", 0)";
	console.log(query);
	connection.query(query, function(err, result) {
	  //if (err) throw err;
	  console.log("NEW GAME -> ID: " + result.insertId);
	  return res.send(result);
	  });
});

app.get("/game/:id", function(req, res){
	var query = 'SELECT * FROM game WHERE id = ' + req.params.id + ';';
	console.log(query);
	connection.query(query, function(err, rows, fields) {
	  //if (err) throw err;
	  if(rows[0]) {
	  	return res.json(rows[0]);
	  }
	  else {
	  	console.log("======= FAILED TO GET GAME =====");
	  	res.send('Game does not exist');
	  }
	});
});

app.post("/game/on_hold", function(req, res) {
	var query = 'UPDATE game SET on_hold= NOT on_hold WHERE id = ' + req.body.id + ';';
	console.log(query);
	connection.query(query, function(err, rows, fields) {
		return res.send('updated game on_hold');
	}); 
});

app.get("/game/teams/:game_id", function(req, res) {
	var get_teams = "SELECT * FROM teams_in_game WHERE game_id = " + req.params.game_id;
	connection.query(get_teams, function(err, result) {
		return res.json(result);
	});
});

connection.connect();
console.log("connection is: " + connection);


// logs every request
app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});

	// goes onto the next function in line
	next();
});

io.sockets.on('connection', function (socket) {

	io.sockets.emit('blast', {msg:"<span style=\"color:red !important\">nieuwe speler</span>"});

  socket.on('room', function(room) {
    socket.join(room);
  });

	socket.on('blast', function(data, id, fn){
		io.sockets.to(id).emit('blast', {msg:data.msg});

		fn();//call the client back to clear out the field
	});

	socket.on('answer', function(id, fn) {
		io.sockets.to(id).emit('answer', {});

		fn();
	});

	socket.on('reset', function(id, fn) {
		io.sockets.to(id).emit('reset', {});

		fn();
	})

});


server.listen(runningPortNumber);