 /*************************************
//
// quizmaster-socket app
//
**************************************/
// connect to our socket server
var socket = io.connect('http://127.0.0.1:3000/');

var app = app || {};

var User = ( function()
{
  var User = {};        // holds all public functions/objects
  User.name = "anonymous";

  return User;
}) ();

var QuizMaster = angular.module('QuizMaster', ['ngRoute', 'ngCookies']);

QuizMaster.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: 'views/login.ejs',
			controller: 'login',
		}).
		when('/game/:id', {
			templateUrl: 'views/game.ejs',
			controller: 'main',
		});

	//$locationProvider.html5Mode(true);
}]);

QuizMaster.value('Leipo', function() { 
	return {};
});

// QuizMaster.factory('Game', function($http) {
// 	var id;
// 	var quizmaster;
// 	function update_game(id) {
//     $http({
//       method  : 'GET',
//       url     : '/game/' + id,
//       data		: null,
//       headers : {'Content-Type': 'application/json'} 
//      })
//       .then(function success(data) {
//         console.log(data);
//         id = data.data.id;
//         quizmaster = data.data.quizmaster;
//       });
//    };

//    return {
//    		id: id,
//    		quizmaster: quizmaster,
//    		update_game: update_game
//    }
// });






// module.exports.controller = function(app){
// 	app.get("/game", function(req,res){
// 		res.render('game');
// 	});

// 	app.get("/game/:id", function(req, res) {
// 		// check if game exists
// 		var query = 'SELECT * FROM game WHERE room_id = ' + req.params.id + ';';
// 		connection.query(query, function(err, rows, fields) {
// 		  //if (err) throw err;
// 		  if(rows[0]) {
// 		  	res.send('The solution is: ' + rows[0].room_id);
// 		  }
// 		  else {
// 		  	res.send('Game does not exist');
// 		  }
// 		});
// 	});
// }