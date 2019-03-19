let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
var mysql	= require("mysql");

var db    =    mysql.createConnection({
      connectionLimit   :   100,
      host              :   '10.22.253.64',
      user              :   'root',
      password          :   '',
      database          :   'intra-mediakit',
      debug             :   false
});

db.connect(function(err){
    if (err) console.log(err)
})

var message = []
var isInitNotes = false
var socketCount = 0
app.get("/", function(req, res) {
    res.send("home");
});

http.listen(3001,"10.22.253.64", function(){
	console.log('listening in http://10.22.253.64:3001');
})
// io.on('connection', function(socket){
//   console.log('a user connected');
// });
io.on('connection',(socket)=>{
	console.log('a user connected');
	socket.on('disconnect',function(){
		io.emit('user-changed',{user:socket.nickname, event:'left'});
	});

	socket.on('set-nickname',(nickname)=>{
		console.log(nickname);
		socket.nickname = nickname;
		io.emit('user-changed',{user:nickname,event:'joined'});
	});

	socket.on('add-message',(message)=>{
		console.log(message);
		db.query('SELECT * FROM tbl_user WHERE username="'+message.user+'"').on('result',function(data){
			var a = data.ID_USER;
			var sql = 'INSERT INTO tbl_group(id_user,chat,id_bu) VALUES("'+data.ID_USER+'","'+message.text+'","'+data.ID_BU+'")';
			db.query(sql, function (err, result) {
				if (err) throw err;
				console.log("1 record inserted");	
			});
			var view = 'SELECT * FROM tbl_group WHERE id_bu='+data.ID_BU+'';
			db.query(view, function(err, result){
				if (err) throw err;
			});
		});
		
		io.emit('message',{text:message.text, from: socket.nickname, created: new Date()});
	});

	socket.on('view-message',(message)=>{
		db.query('SELECT * FROM tbl_user WHERE username="'+message.user+'"').on('result',function(data){
			var a = data.ID_USER;
			db.query('SELECT * FROM tbl_group WHERE id_bu='+data.ID_BU+'')
            .on('result', function(data){
                messages.push(data)
            })
            .on('end', function(){
                socket.emit('initial notes', notes)
            })
		});
	})
});

