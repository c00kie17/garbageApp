const express = require('express')
const app = express()
var bodyParser = require("body-parser");
const path = require('path');
var mysql = require('mysql');
var moment = require('moment')
var promise = require('promise')
var async = require('async')

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "garbageapp"
});

con.connect()

app.use('/static', express.static(path.join(__dirname, 'html')))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/html/index.html')
})

app.get('/data',function(req,res){
	getweeklisting().then(function(data){
		res.send(data)
	}).catch(function(err){
		console.log(err)
		res.send("error")
	})
	
})

function getweeklisting(){
	return new promise(function(complete,reject){
		weekarray = []
		date = new Date()
		lastweek = date.setDate(date.getDate() - 6)
		con.query("select * from photodata", function (err, result) {
		    if (err) reject(err);
		    async.each(result,function (item,callback){
		    	pictimestamp = moment(item.email_timestamp,'YYYY-MM-DD HH:mm:ss.SSSSSS').unix() * 1000
		    	if (pictimestamp > lastweek){
		    		item['unixtimestamp'] = pictimestamp
		    		weekarray.push(item)
		    	}
		    	callback()	    	
		    },function(err){
		    	if (err) reject(err)
		    	complete(weekarray)	
		    })
		});
	})
}


app.listen(8080, function () {
  	console.log('main server started on => 8080!')
})