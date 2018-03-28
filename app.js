var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require("body-parser");

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 10000);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',function(req,res,next){
  var context = {};
  res.render('home');
  // console.log("Got a get request to /");
 });


/* Downloading database table on home page */
app.get('/downloadDB',function(req,res,next){
  var context = {};
 
  // console.log("Got a get request to /downloadDB");
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
          if(err){
            next(err);
            return;
          }
          context.results = JSON.stringify(rows);
          res.send(context.results);
        }); 
});

/* Inserting new value on top of home page */
app.get('/insert',function(req,res,next){
  var context = {};
  mysql.pool.query("INSERT INTO workouts (`name`,`reps`,`weight`,`date`,`lbs`) VALUES (?, ?, ?, ?, ?)", 
    [req.query.name,req.query.reps, req.query.weight, req.query.date, req.query.lbs], function(err, result){
    if(err){
      next(err);
      return;
    }

    mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
          if(err){
            next(err);
            return;
          }
          context.results = JSON.stringify(rows);
          res.send(context.results);
          // console.log(context.results);
        }); 
  });
});

app.get('/delete',function(req,res,next){
  var context = {};
  /*Deleting row with sent id */
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    /*Sending back updated database data */
        mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
          if(err){
            next(err);
            return;
          }
          context.results = JSON.stringify(rows);
          res.send(context.results);
          // console.log(context.results);
        }); 
   });
});

///simple-update?id=2&name=The+Task&done=false&due=2015-12-5
app.get('/start-update',function(req,res,next){
  var context = {};
  // console.log("Received simple-update get request");
  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, rows, fields){
    if(err){
      next(err);
      return;
    } 

    var tempRow = rows[0];
    for(var prop in tempRow)
      {
        if(tempRow.hasOwnProperty(prop)) 
        {
            if(tempRow[prop] != null)
            {
             context[prop] = tempRow[prop];
            }
            else
            {
              context[prop] = null;
            }      
        }
      }
  //Converting date to proper ISO format if not null
    if(context["date"] != null)
    {
        var convertedDate = JSON.stringify(context["date"]).substring(0, 11) + "\"";
        context["date"] = JSON.parse(convertedDate);
    }

    // console.log("sending start update contents:" + JSON.stringify(context));
    res.render('update', context);
  });
});


///safe-update?id=1&name=The+Task&done=false
app.post('/update',function(req,res,next){
  var context = {};
  // console.log("Received update post request");
  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
        [req.body.name || curVals.name, 
        req.body.reps, req.body.weight, req.body.date, 
        req.body.lbs, req.body.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        res.send("Updated data for row id" + req.body.id.toString());
      });
    }
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  // console.log("Got a get request to /reset-table");
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ 
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      // context.results = "Table reset";
      res.render('home');
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
