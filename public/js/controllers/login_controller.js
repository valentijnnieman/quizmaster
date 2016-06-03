QuizMaster.controller('login', ['$scope', '$http', '$route', '$routeParams', 
	'$location', '$cookies', function($scope, $http, $route, $routeParams, $location, $cookies) {

  $scope.logged_in = false;
  $scope.joined_team = false;
  $scope.login_data = {};
  $scope.create_data = {};
  $scope.create_team_data = {};
  $scope.message = 'Welkom!';
  $scope.game_to_join = 0;
  $scope.team_name = "";

  var user = {};
  var teams = {};

  $scope.login_form = function() {
    $http({
      method  : 'POST',
      url     : 'user/login',
      data    : $scope.login_data, //forms user object
      headers : {'Content-Type': 'application/json'} 
     })
      .then(function success(data) {
        $scope.logged_in = true;
        if (data.errors) {
          // Showing errors.
          // $scope.errorName = data.errors.name;
          // $scope.errorUserName = data.errors.username;
          // $scope.errorEmail = data.errors.email;
        } else {
          // store username as a cookie
          user = data.data;
          $cookies.put('id', data.data.id);
          $scope.show_teams();
        }
      }, function fail(data) {

      });
  };

  $scope.create_form = function() {
    $http({
      method  : 'POST',
      url     : 'user',
      data    : $scope.create_data, //forms user object
      headers : {'Content-Type': 'application/json'} 
     })
      .then(function success(data) {
        $scope.logged_in = true;
        if (data.errors) {
          // Showing errors.
          // $scope.errorName = data.errors.name;
          // $scope.errorUserName = data.errors.username;
          // $scope.errorEmail = data.errors.email;
        } else {
          $scope.login_data = $scope.create_data;
          $scope.login_form();
        }
      }, function fail(data) {

      });
  };

  $scope.update_form = function() {
    $http({
      method  : 'PUT',
      url     : 'user/' + $scope.user.id,
      data    : $scope.login_data,
      headers : {'Content-Type': 'application/json'} 
     })
      .then(function success(data) {
        $scope.logged_in = true;
        if (data.errors) {
          // Showing errors.
          // $scope.errorName = data.errors.name;
          // $scope.errorUserName = data.errors.username;
          // $scope.errorEmail = data.errors.email;
        } else {
          Leipo = data.data;
          $scope.login_form();
        }
      }, function fail(data) {

      });
  };

  $scope.show_teams = function() {
    $http.get('team').then(function(response) {
      var html = "";
      console.log(response);
      for(var i = 0; i < response.data.length; i++)
      {
        html += "<div id='" + 
          response.data[i].name +"' class='btn btn-danger team'>" + 
          response.data[i].name + "</div>";
      }
      $('.teams-list').html(html);
      $('.team').bind("click", $scope.login_team);
    });
  }

  $scope.create_team_form = function() {
    $http({
      method  : 'POST',
      url     : 'team',
      data    : $scope.create_team_data, //forms user object
      headers : {'Content-Type': 'application/json'} 
     })
      .then(function success(data) {
        if (data.errors) {
          // Showing errors.
          // $scope.errorName = data.errors.name;
          // $scope.errorUserName = data.errors.username;
          // $scope.errorEmail = data.errors.email;
        } else {
          $scope.joined_team = true;
          $scope.team_name = data.data;
          $scope.show_teams();
        }
      }, function fail(data) {

      });
  };

  $scope.reg_user_with_team = function() {
    $http({
      method  : 'POST',
      url     : 'team/register',
      data    : { "name": $scope.team_name, "user_id": user.id},
      headers : {'Content-Type': 'application/json'} 
     })
      .then(function success(data) {
        if (data.errors) {
          // Showing errors.
          // $scope.errorName = data.errors.name;
          // $scope.errorUserName = data.errors.username;
          // $scope.errorEmail = data.errors.email;
        } else {
          console.log("Registered user with team");
        }
      }, function fail(data) {
          console.log("Failed to register user with team");
      });
  }

  $scope.begin_game = function() {
    console.log('beginning game...');
    $http({
      method  : 'POST',
      url     : 'game',
      data    : user,
      headers : {'Content-Type': 'application/json'} 
     })
      .then(function success(data) {
        $scope.game_to_join = data.data.insertId
        $scope.join_game(data.data.insertId);
        console.log("successfully begun game " + $scope.game_to_join);
        $http.post('team/reg_team_with_game', 
          {"name": $scope.team_name, 
          "game_id": data.data.insertId});
      });
  }

  $scope.login_team = function() {
    $scope.joined_team = true;
    $scope.team_name = this.id;
    $scope.reg_user_with_team(); 
    $scope.show_teams();
  };

  $scope.join_game = function(game) {
    $http.post('team/reg_team_with_game', {"name": $scope.team_name, "game_id": $scope.game_to_join});
    $location.path('/game/' + game).replace();
  }
	
}]);