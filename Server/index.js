let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http, {'pingTimeout': 7000, 'pingInterval': 3000});
var mysql	= require("mysql");

var db    =    mysql.createConnection({
      connectionLimit   :   100,
      host              :   '10.22.253.64',
      user              :   'asd',
      password          :   '',
      database          :   'intra-baru-mediakit',
      debug             :   false
});

db.connect(function(err){
    if (err) console.log(err)
})
var ga = ''
var gambar = ''
var message = []
var isInitNotes = false
var socketCount = 0
var chat = [];
var created_at = [];
var profPic = '';
var group = [];
var rooms = ['room1','room2','room3','room4','room5','room6','room7','room8','room9','room10','room11','room12','room13'];
app.get("/", function(req, res) {
    res.send("home");
});

http.listen(3001,"10.22.253.64", function(){
	console.log('listening in http://10.22.253.64:3001');
})
io.on('connection',(socket)=>{
	socket.on('disconnect',function(){
		io.emit('user-changed',{user:socket.nickname, event:'left'});
	});

	socket.on('set-nickname',(nickname)=>{
		console.log(nickname);
		socket.nickname = nickname.name;

		if(nickname.idbu==11){
			ga = 'room11';
		} else if (nickname.idbu==1){
			ga = 'room1';
		} else if(nickname.idbu==2){
			ga = 'room2';
		} else if(nickname.idbu==3){
			ga = 'room3';
		} else if(nickname.idbu==4){
			ga = 'room4';
		} else if(nickname.idbu==5){
			ga = 'room5';
		} else if(nickname.idbu==6){
			ga = 'room6';
		} else if(nickname.idbu==7){
			ga = 'room7';
		} else if(nickname.idbu==8){
			ga = 'room8';
		} else if(nickname.idbu==9){
			ga = 'room9';
		} else if(nickname.idbu==10){
			ga = 'room10';
		} else if(nickname.idbu==12){
			ga ='room12';
		} else if(nickname.idbu==13){
			ga = 'room13';
		}

		socket.room = ga;
		console.log(ga);
		socket.join(ga);
		socket.broadcast.to(ga).emit('updatechat', {name: socket.nickname,status:'online'});
		socket.emit('updaterooms', rooms, ga);
	});

	socket.on('sendchat', function (data) {
		console.log(data);
		var sql = 'INSERT INTO tbl_group(id_content,id_user,chat,filename,id_bu) VALUES("'+data.id_content+'","'+data.id_user+'","'+data.text+'","'+data.gambar+'","'+data.id_bu+'")';
			db.query(sql, function (err, result) {
				if (err) throw err;
				console.log("1 record inserted");	
			});

		// var sql = 'SELECT tbl_user.IMAGES FROM tbl_user WHERE tbl_user.ID_USER ='+data.id_user+' GROUP BY tbl_user.ID_USER';
		// 	db.query(sql, function (err, result) {
		// 		if (err) throw err;
		// 		profPic = result[0].IMAGES;
		// 		// console.log(profPic);

		// 	});
		// var sql = 'SELECT tbl_group.chat as text, tbl_group.filename as gambar, tbl_group.created_at as created, tbl_group.id_content FROM tbl_group WHERE tbl_group.id_bu=0';
		// 	db.query(sql, function (err, result) {
		// 		if (err) throw err;
		// 		// console.log(result);	
  //               io.emit('updatechat',result);
		// 	});
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', {id_content: data.id_content, text:data.text, name: socket.nickname, gambar: data.gambar, created: new Date()});
	});

	socket.on('view-message',(message)=>{
		console.log(message);
		var sql = 'SELECT tbl_group.id_content, tbl_group.chat as text, tbl_group.filename as gambar, tbl_group.created_at as created, tbl_group.id_content, tbl_user.username as name FROM tbl_group left join tbl_user on tbl_user.ID_USER = tbl_group.id_user WHERE tbl_group.id_bu='+message.id_bu+'';
			db.query(sql, function (err, result) {
				if (err) throw err;
				// console.log(result);	
                io.emit('cbmessage',result);
			});
	})

	socket.on('count-message',(count)=>{
		setInterval(function(){
			var sql = 'select count(a.tabs) as jumlahChat from notification a where a.tabs="CHAT" and a.id_bu='+count.id_bu;
		db.query(sql, function(err,result){
			if (err) throw err;
			io.emit('countMessage',result[0]);
			});
		});
	},1000);

	socket.on('delete-message',(count)=>{
		console.log(count);
		var sql = 'DELETE FROM notification WHERE id_bu = '+count.id_bu+' and tabs = "CHAT"';
		db.query(sql, function(err,result){
			if (err) throw err;
			io.emit('deleteMessage',result[0]);
			});
		});
});

