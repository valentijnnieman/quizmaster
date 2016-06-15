module.exports = function userRouter(router, connection) {

  router.get("/team", function(req, res) {
    var query = 'SELECT * FROM team;';
    connection.query(query, function(err, result) {
      return res.json(result);
    });
  });

  router.get("/team/:id", function(req, res) {
    var query = "SELECT * FROM team WHERE id = " + req.params.id;
    connection.query(query, function(err, rows, fields) {
      return res.json(rows[0]);
    });
  });

  router.post("/team", function(req, res){
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

  router.put("/team/score/:id", function(req, res){
    var query = "UPDATE team SET score = score + 1 WHERE id='" + req.params.id + "';";
    console.log(query);
    connection.query(query, function(err, rows, fields) {
      //if (err) throw err;
      res.send('+1 to team' + req.params.id); 
      });
  });

  router.post("/team/register", function(req, res) {
    var get_team_id = "SELECT * FROM team WHERE name = '" + req.body.name + "';";
    connection.query(get_team_id, function(err, rows, fields) {
      var team_id = rows[0].id;

      // first attempt to delete duplicate values
      var delete_duplicate = "DELETE FROM users_in_team WHERE user_id = " + req.body.user_id + ";";
      connection.query(delete_duplicate, function(){ console.log('deleted dupe'); });
      console.log(delete_duplicate);
      var reg_user_with_team = "INSERT INTO users_in_team VALUES(" + req.body.user_id + ", " + team_id + ");";
      connection.query(reg_user_with_team, function(req, res) {

      });
    });
  });

  router.post("/team/reg_team_with_game", function(req, res) {
    var get_team_id = "SELECT * FROM team WHERE name = '" + req.body.name + "';";
    connection.query(get_team_id, function(err, rows, fields) {
      var team_id = rows[0].id;
          
      // first attempt to delete duplicate values
      var delete_duplicate = "DELETE FROM teams_in_game WHERE team_id = " + team_id + " && game_id = " + req.body.game_id + ";";
      connection.query(delete_duplicate, function(){ console.log('deleted dupe'); });

      var reg_team_with_game = "INSERT INTO teams_in_game VALUES(" + team_id + ", " + req.body.game_id + ");";
      connection.query(reg_team_with_game, function(req, res) {

      });
    }); 
  })

  router.get("/team/users", function(req, res) {
    var get_users = "SELECT * FROM users_in_team WHERE team_id = " + req.body.team_id;
    connection.query(get_users, function(err, result) {
      return res.json(result);
    });
  });

  return router;
}
