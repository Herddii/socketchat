let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get("/", function(req, res) {
    res.send("home");
});

// io.on('connection', function(socket){
//   console.log('a user connected');
// });
io.on('connection',(socket)=>{
	console.log('a user connected');
	socket.on('disconnect',function(){
		io.emit('user-changed',{user:socket.nickname, event:'left'});
	});

	socket.on('set-nickname',(nickname)=>{
		socket.nickname = nickname;
		io.emit('user-changed',{user:nickname,event:'joined'});
	});

	socket.on('add-message',(message)=>{
		// console.log(message.text);
		io.emit('message',{text:message.text,from: socket.nickname, created: new Date()});
	});
});


http.listen(3001,"10.22.253.64", function(){
	console.log('listening in http://10.22.253.64:3001');
})