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
  secret: 'com.michaell.alavedra.monitorupao'
}));
// Variable global de sesion
var ssn;
var semestre = (() => {
  var today = new Date();
  var month = today.getMonth() + 1;
  var year = today.getFullYear().toString();
  return year.concat((month <= 6) ? "01" : "02");
})();
// Formateo de datos enviados al servidor en JSON
app.use(bodyParser.urlencoded({
  extended: false
}));
// Controlar el manejo erroneo del navegador
app.use((req, res, next) => {
  if (!req.user)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});
// Enrutamiento al contenido principal de la aplicación (homepage)
var mensaje;

function loadLoginPage(res) {
  let ref = db.ref("carreras");
  ref.on("value", function(snapshot) {
    res.render('login', {
      "carreras": snapshot.val(),
      "mensaje": mensaje
    });
  });
}

app.get('/', (req, res) => {
  if (ssn) {
    if (ssn.logged) {
      mensaje = "Ingreso a pagina de login" + JSON.stringify(ssn);
      res.redirect('/home');
    } else {
      loadLoginPage(res);
    }
  } else {
    ssn = req.session; // Se crea una nueva sesion, no habia ninguna ventana abierta
    ssn.logged = false;
    mensaje = "Creación de nueva sesión" + JSON.stringify(ssn);
    loadLoginPage(res);
  }
});

app.get('/home', (req, res) => {
  if (ssn && ssn.logged) {
    res.render('home', {
      "mensaje": mensaje
    });
  } else {
    res.redirect('/')
  }
});
// Funcionalidad para el registro de usuarios
app.post('/register', function(req, res) {
  var newuser = req.body;
  var exists = false;
  var ref = db.ref("alumnos");
  ref.once('value').then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val().id_alumno == newuser.id_alumno) {
        exists = true;
        return;
      }
      return true;
    });
    if (exists) {
      mensaje = "El usuario que se quiere registrar ya esta registrado" + JSON.stringify(ssn);
      loadLoginPage(res);
    } else {
      ref.push(newuser);
      ssn.alumno = newuser;
      ssn.logged = true;
      mensaje = "Se registro un nuevo usuario" + JSON.stringify(ssn);
      res.redirect('/home');
    }
  });
});
// Funcionalidad para el ingreso de usuarios
app.post('/login', function(req, res) {
  var userdata = req.body;
  var ref = db.ref("alumnos");
  ref.once('value').then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val().id_alumno == userdata.id_alumno &&
        childSnapshot.val().password == userdata.password) {
        ssn.alumno = childSnapshot.val();
        ssn.logged = true;
        mensaje = "EL usuario ingreso a su cuenta" + JSON.stringify(ssn);
        res.redirect('/home');
      }
      return true;
    });
  });
  mensaje = "El usuario no pudo loguearse" + JSON.stringify(ssn);
  loadLoginPage(res);
});
// Registro del estado academico del alumno
app.post('/academic_status', function(req, res) {
  var academic_status = JSON.parse(req.body.data);
  var ref = db.ref("alumnos");
  ref.once('value').then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val().id_alumno == ssn.alumno.id_alumno) {
        childSnapshot.getRef().update(academic_status);
        mensaje = "Se registraron los datos de estado academico" + JSON.stringify(ssn);
        res.redirect('/home');
        // ssn.alumno = Object.assign(ssn.alumno, academic_status);
        return;
      }
      return true;
    });
  });
});
// Registro de los cursos del alumno
app.post('/course_data', function(req, res) {
  var course_data = JSON.parse(req.body.data);
  var ref = db.ref("cursos");
  ref.once('value').then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val().id_curso == course_data.id_curso) {
        mensaje = "El curso ya existe en la base de datos, seleccionalo" + JSON.stringify(ssn);
      } else {
        ref.push(course_data);
        mensaje = "El curso se acaba de registrar" + JSON.stringify(ssn);
      }
      res.redirect('/home');
      return true;
    });
  });
});
// Registro de las notas del alumno
app.post('/nota_data', function(req, res) {
  var nota_data = JSON.parse(req.body.data);
  var id_curso = Object.keys(nota_data)[0];
  var ref = db.ref("notas");
  ref.once('value').then(snapshot => {
    snapshot.forEach(childSnapshot => {
      if (childSnapshot.val().id_alumno == ssn.alumno.id_alumno) {
        childSnapshot.child(semestre).getRef().update(nota_data);
        res.redirect('/home');
      }
    });
  });
});
// Funcionalidad para destrucción de sesión
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      ssn = null;
      res.redirect('/');
    }
  });
});
// Escucha del servidor
server.listen(app.get('port'), function() {
  console.log(`server on port ${app.get('port')}`);
});