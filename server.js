/*************************************
//
// quizmaster-socket app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var router = express.Router();
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

app.set('connection', connection);
var bodyParser = require('body-parser')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var runningPortNumber = process.env.PORT;

// I need to access everything in '/public' directly
app.use(express.static(__dirname + '/public'));

//set the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname +'/views');

app.use(device.capture());


app.get("/", function(req, res){
	res.render('index', {});
});

var user = require('./controllers/user')(router, connection);
app.use('/', user);

var team = require('./controllers/team')(router, connection);
app.use('/', team);

var game = require('./controllers/game')(router, connection);
app.use('/', game);

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
    io.sockets.to(room).emit('reload', {});
  });

	socket.on('get_on_hold', function(id, fn) {
		io.sockets.to(id).emit('get_on_hold', {});

		fn();
	});

	socket.on('blast', function(data, id, fn){
		io.sockets.to(id).emit('blast', {msg:data.msg});

		fn();//call the client back to clear out the field
	});

	socket.on('reload', function(id, fn) {
		io.sockets.to(id).emit('reload', {});

		fn();
	});

	socket.on('answer', function(data, id, fn) {
		io.sockets.to(id).emit('answer', {user_id:data.user_id});

		fn();
	});

	socket.on('reset', function(id, fn) {
		io.sockets.to(id).emit('reset', {});

		fn();
	})

});


server.listen(runningPortNumber);
