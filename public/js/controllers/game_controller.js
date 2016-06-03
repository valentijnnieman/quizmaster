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
		$messageField = $('#messageField'),
		$jumbo = $('.jumbotron');
		$buzzer = $('#buzzer');

	var canAnswer = false;
	var answers_amount = 0;
	var game_id = $routeParams.id;
	var user_id = $cookies.get('id');
  
  get_on_hold();

	$scope.current_user = {};

	function get_user()
	{
		$http.get('user/' + user_id)
		.then(function(response) {
			$scope.current_user = response.data;
		});
	}

	get_user();

	function get_on_hold()
	{
		$http.get('game/' + game_id)
		.then(function(response) {
			$scope.on_hold = response.data.on_hold;
			console.log("on_hold = " + $scope.on_hold);
			if(response.data.on_hold == 1) {
		  	canAnswer = false;
				$messageField.text('Er is gedrukt! Was het antwoord goed?');
				$messageField.addClass('alert-danger');
				$jumbo.addClass('jumbo--dark');
			}
			else if (response.data.on_hold == 0) {
				canAnswer = true;
			}
		});
	}

	function set_on_hold()
	{
		console.log("set on hold is called!");
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

	$http.get('game/teams/' + game_id).then(function(res) {
		$scope.id_of_teams = res;
	});

	//SOCKET STUFF

	// join the game
	socket.emit('room', game_id);

	socket.on('get_on_hold', function(data){
		console.log("caught get_on_hold!");
		$scope.on_hold = get_on_hold;
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
		$messageField.text('Er is gedrukt! Was het antwoord goed?');
		$messageField.addClass('alert-danger');
		$jumbo.addClass('jumbo--dark');
		//$scope.on_hold = get_on_hold();
	});

	socket.on("reset", function(data) {
		$('.answer-message').removeClass('green-color');
		$messageField.text('Handen aan de knoppen!');
		$messageField.removeClass('alert-danger');
		$jumbo.removeClass('jumbo--dark');
		canAnswer = true;
		answers_amount = 0;
		//$scope.on_hold = get_on_hold();
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

	$buzzer.click(function(e) {
		if(answers_amount < 3) {
			if(canAnswer) {
				set_on_hold();
				answers_amount += 1;
				socket.emit("blast", {msg: "<div class='answer-message green-color'>" + $scope.current_user.name + " weet het antwoord!" + "</div>"}, game_id, 
					function(data){});
				socket.emit("answer", game_id, function(data){});	
			}
			else {
				answers_amount += 1;
				socket.emit("blast", {msg: "<div class='answer-message light-gray-color'>" + $scope.current_user.name + " is net te laat!" + "</div>"}, game_id,
					function(data) {});
			}
		}
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