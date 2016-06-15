module.exports = function userRouter(router, connection) {

  router.post("/game", function(req, res){
    var query = "INSERT INTO game VALUES (NULL, " + req.body.id + ", 0)";
    console.log(query);
    connection.query(query, function(err, result) {
      //if (err) throw err;
      console.log("NEW GAME -> ID: " + result.insertId);
      return res.send(result);
      });
  });

  router.get("/game/:id", function(req, res){
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

  router.post("/game/on_hold", function(req, res) {
    var query = 'UPDATE game SET on_hold= NOT on_hold WHERE id = ' + req.body.id + ';';
    console.log(query);
    connection.query(query, function(err, rows, fields) {
      return res.send('updated game on_hold');
    }); 
  });

  router.get("/game/teams/:game_id", function(req, res) {
    var get_teams = "SELECT * FROM teams_in_game WHERE game_id = " + req.params.game_id;
    connection.query(get_teams, function(err, result) {
      return res.json(result);
    });
  });

  return router;
}
