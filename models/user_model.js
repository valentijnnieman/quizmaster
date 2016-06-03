module.exports = function(app) {

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
    console.log(req.body.name + " ==== " + req.body.password);
    var query = "INSERT INTO user VALUES (NULL, '" + req.body.name + "', '" + req.body.password + "', 0);";
    console.log(query);
    connection.query(query, function(err, rows, fields) {
      //if (err) throw err;
      res.send('Created user'); 
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

}