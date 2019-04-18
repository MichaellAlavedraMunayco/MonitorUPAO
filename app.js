const http = require('http');
const express = require('express');
var exphbs = require('express-handlebars');
var session = require('express-session');
var bodyParser = require('body-parser')
const morgan = require('morgan');
var admin = require("firebase-admin");
// Instancia de express
const app = express();
// Instancia de servidor
const server = http.createServer(app);
// Definición de puertos, 3000 por defecto
app.set('port', process.env.PORT || 3000);
// Definición de clave de autenticación de firebase
var serviceAccount = require("./monitor-upao-firebase-adminsdk-y3vd2-a26370f4ff.json");
// Inicialización de servicio de firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://monitor-upao.firebaseio.com/"
});
// Instancia de base de datos
var db = admin.database();
// Definición de handlebars, por defecto views/main
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
// Definición de rutas de archivos CSS y JS
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
// Firma de cookie por sesion
app.use(session({
  secret: 'XADASXASD'
}));
// Variable de sesion
var ssn;
// Formateo de datos enviados al servidor en JSON
app.use(bodyParser.urlencoded({
  extended: false
}));
// Enrutamiento al contenido principal de la aplicación (homepage)
app.get('/', (req, res) => {
  // Establecer session
  ssn = req.session;
  // Captura de datos firebase, llenado de lista de carreras
  var ref = db.ref("carreras");
  ref.on("value", function(snapshot) {
    res.render('home', {
      "title": "Registra o actualiza tu semestre",
      "carreras": snapshot.val()
    });
  });
});
// Funcionalidad para el registro de usuarios
app.post('/register', function(req, res) {
  ssn = req.session;
  var newuser = req.body;
  ssn.id_alumno = newuser.id_alumno;
  ssn.id_carrera = newuser.id_carrera;
  var exists = false;
  var ref = db.ref("usuarios");
  ref.once('value').then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val().id_alumno == ssn.id_alumno) {
        exists = true;
      }
      return true;
    });
    if (exists) {
      console.log("ya existe usuario");
    } else {
      ref.push(newuser);
    }
  });
});
// Funcionalidad para el ingreso de usuarios
app.post('/login', function(req, res) {

});
// Funcionalidad respuesta al envío de datos con el método POST al servidor
app.post('/extraccion_data_alumno', function(req, res) {
  var user = JSON.parse(req.body.data);
  db.ref("usuarios").push(user);
  res.render('home', user);
});
app.post('/carrera', (req, res) => {
  // db.ref("bases").push(car[i]);
});
// Escucha del servidor
server.listen(app.get('port'), function() {
  console.log(`server on port ${app.get('port')}`);
});


// var ref = db.ref("restricted_access/secret_document");
// ref.once("value", function(snapshot) {
//   console.log(snapshot.val());
// });