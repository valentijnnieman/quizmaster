module.exports = function userRouter(router, connection) {
  router.post("/user/login", function(req, res){
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

  router.post("/user", function(req, res){
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

  router.put("/user/:id", function(req, res){
    var query = "UPDATE user SET name = '" + req.body.name + "'" + " WHERE id='" + req.params.id + "';";
    console.log(query);
    connection.query(query, function(err, rows, fields) {
      //if (err) throw err;
      res.send('Created user'); 
      });
  });

  router.get("/user/:id", function(req, res){
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

  router.get("/user/:id/team", function(req, res) {
    var query = "SELECT * FROM users_in_team WHERE user_id = " + req.params.id + ";";
    connection.query(query, function(err, rows, fields) {
      return res.json(rows[0]);
    })
  });

  return router;
}
