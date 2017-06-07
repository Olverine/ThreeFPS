var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

var projectiles = [];
var projectileMaxIteration = 50;

app.use(express.static('public'));

app.get('/', function(req, res){
	console.log("Someone connected");

	res.sendFile(__dirname + "/public/index.html");
});

app.get('/asset/texture', function(req, res){
	res.sendFile(__dirname + "/public/textures/" + req.query.id);
});

app.get('/asset/model', function(req, res){
	res.sendFile(__dirname + "/public/models/" + req.query.id);
});

http.listen(port, function(){
	console.log('Server running!');
	console.log('listening on port: ' + port);
});

var id = 0;
io.on('connection', function(socket){
	console.log("user connected to socket!");
	socket.id = id++;
	socket.emit("id", socket.id);

	socket.on("update", function(position, lookX, lookY){
		socket.broadcast.emit('update', {
			id: socket.id,
			position: position,
			lookX: lookX,
			lookY: lookY
		});
	});

	socket.on("disconnect", function(){
		console.log(id + " disconnected");
		socket.broadcast.emit('disconnection', socket.id);
	});

	socket.on("shoot", function(point, direction){
		var projectile = {
			id: id++,
			point: point,
			direction: direction,
			iteration: 0
		};

		projectiles.push(projectile);
	});
});

setInterval(function(){
	projectiles.forEach(function(projectile){
		projectile.iteration ++;
		if(projectile.iteration >= projectileMaxIteration)
			io.sockets.emit("removeProjectile", projectile.id);
		else
			io.sockets.emit("projectileUpdate", projectile.id, projectile.point, projectile.direction, projectile.iteration);
	});
}, 30);
