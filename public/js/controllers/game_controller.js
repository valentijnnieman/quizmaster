QuizMaster.controller('game', ['$scope', '$http', '$cookies', '$routeParams', 
	function($scope, $http, $cookies, $routeParams) {
	//setup some common vars
	var $blastField = $('#blast'),
		$allPostsTextArea = $('#allPosts'),
		$onePostTextArea = $('#onePost'),
		$clearAllPosts = $('#clearAllPosts'),
		$sendBlastButton = $('#send'),
		$resetButton = $('#resetButton'),
		$clearButton = $('#clearButton'),
		$correctButton = $('#correctButton'),
		$messageField = $('#messageField'),
		$jumbo = $('.jumbotron'),
		$buzzer = $('#buzzer');

	var canAnswer = false;
	var answers_amount = 0;
	var game_id = $routeParams.id;
	var user_id = $cookies.get('id');

	$scope.teams_array = [];

	$scope.on_hold = 0;
	get_on_hold();

	$scope.current_user = {};

	function get_user()
	{
		$http.get('user/' + user_id)
		.then(function(response) {
			$scope.current_user = response.data;
			console.log($scope.current_user);
		});
	}

	function get_team(team_id)
	{
		console.log('get_team');
		$http.get('team/' + team_id)
		.then(function(response) {
			console.log('GET team/' + team_id);
			$scope.teams_array.push(response.data);
		});
	}

	get_user();
	//get_team(1)

	function get_on_hold()
	{
		$http.get('game/' + game_id)
		.then(function(response) {
			if(response.data.on_hold == 1) {
				$scope.on_hold = 1;
				canAnswer = false;
				$messageField.text('Er is gedrukt! Was het antwoord goed?');
				$messageField.addClass('alert-danger');
				$jumbo.addClass('jumbo--dark');
			}
			else if (response.data.on_hold == 0) {
				$scope.on_hold = 0;
				canAnswer = true;
			}
			console.log("Response data on hold: ");
			console.log(response.data.on_hold);
		});
	}

	function set_on_hold()
	{
		$http.post('game/on_hold', $scope.game).
		then(function(response) {
			//$scope.on_hold = get_on_hold();
			socket.emit("get_on_hold", game_id,
				function(data) {});
		});
	}

	// ugly way of checking if the current user id 
	// matches with the id of the game's quizmaster
	$http.get('game/' + game_id)
	.then(function(response) {
		$scope.game = response.data;
		$http.get('user/' + $scope.game.quizmaster)
		.then(function(response) {
			$scope.quizmaster = response.data;
			if($scope.quizmaster.name == $scope.current_user.name) {
				$scope.is_quizmaster = true;
			}
			else {
				$scope.is_quizmaster = false;
			}
		});
	});

	// $http.get('game/teams/' + game_id).then(function(res) {
	// 	console.log(res.data.length);
	// 	for(var i = 0; i < res.data.length; i++) {
	// 		get_team(res.data[i].team_id);
	// 	}
	// });

	//SOCKET STUFF

	// join the game
	socket.emit('room', game_id);

	socket.on('get_on_hold', function(data){
		console.log("caught get_on_hold! " + data);
		get_on_hold;
	});

	socket.on("reload", function() {
		$http.get('game/teams/' + game_id).then(function(res) {
			$scope.teams_array = [];
			for(var i = 0; i < res.data.length; i++) {
				get_team(res.data[i].team_id);
			}
		});
	});

	socket.on("blast", function(data){
		var copy = $allPostsTextArea.html();
		$allPostsTextArea.html('<p>' + copy + data.msg + "</p>");
		$allPostsTextArea.scrollTop($allPostsTextArea[0].scrollHeight - $allPostsTextArea.height());
		$allPostsTextArea.css('scrollTop', $allPostsTextArea.css('scrollHeight'));
		$onePostTextArea.html('<p class="green-color">' + data.msg + "</p>");
	});

	socket.on("answer", function(data) {
		canAnswer = false;
		console.log(data);
		console.log("the user was user " + data.user_id);
		$messageField.text('Er is gedrukt! Was het antwoord goed?');
		$messageField.addClass('alert-danger');
		$jumbo.addClass('jumbo--dark');

		if($scope.is_quizmaster) {
			$scope.answer_given = true;
			$http.get('user/' + data.user_id)
			.then(function(response) {
				$scope.user_that_answered = response.data;
			});
		}
		//$scope.on_hold = get_on_hold();
	});

	socket.on("reset", function(data) {
		$('.answer-message').removeClass('green-color');
		$messageField.text('Handen aan de knoppen!');
		$messageField.removeClass('alert-danger');
		$jumbo.removeClass('jumbo--dark');
		canAnswer = true;
		answers_amount = 0;
		if($scope.is_quizmaster) {
			$scope.answer_given = false;
		}
		//$scope.on_hold = get_on_hold();
		//socket.emit("get_on_hold", game_id, function(){});
	})
	
	$clearAllPosts.click(function(e){
		$allPostsTextArea.text('');
	});

	$sendBlastButton.click(function(e){

		var blast = $blastField.val();
		if(blast.length){
			socket.emit("blast", {msg:blast}, 
				function(data){
					$blastField.val('');
				});
		}
	});

	$blastField.keydown(function (e){
	    if(e.keyCode == 13){
	        $sendBlastButton.trigger('click');//lazy, but works
	    }
	})

	$scope.buzzerClick = function(e) {
		if(answers_amount < 3) {
			if(canAnswer) {
				set_on_hold();
				answers_amount += 1;
				socket.emit("blast", {msg: "<div class='answer-message green-color'>" + $scope.current_user.name + " weet het antwoord!" + "</div>", user_id: $scope.current_user.id}, game_id, 
					function(data){});
				socket.emit("answer",{user_id: $scope.current_user.id}, game_id, function(data){});	
			}
			else {
				answers_amount += 1;
				socket.emit("blast", {msg: "<div class='answer-message light-gray-color'>" + $scope.current_user.name + " is net te laat!" + "</div>"}, game_id,
					function(data) {});
			}
		}
	};

	$correctButton.click(function(e) {
		var id = $scope.user_that_answered.id
		console.log("id = " + id);
		$http.get('user/'+id+'/team')
		.then(function(response) {
			console.log("TEAM ID IS " + response.data.team_id);
			$http.put('team/score/' + response.data.team_id)
			.then(function(response) {
				socket.emit("reset", game_id, function(data) {});
				socket.emit("reload", game_id, function() {});
				set_on_hold();
			});

		});
	});

	$resetButton.click(function(e) {
		if($scope.on_hold == 1) {
			socket.emit("reset", game_id,
				function(data) {});
			set_on_hold();
		}
	})

	$clearButton.click(function() {
		$allPostsTextArea.html('');
	});
}]);
