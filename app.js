const express = require("express");
const app = express();
var cors = require('cors');
const mysql = require('mysql');
// const encrypt_decrypt = require('./encrypt_decrypt');

// const plaintext = "If you prick us do we not bleed? If you tickle us do we not laugh";
// const salt = "some salt";
// const password = crypto.scryptSync("some password", salt, 16).toString("base64");
// const iv64 = "XxbSho8OZacvQwXC6S5RQw==";
const pool = mysql.createPool({
    host     : 'localhost',
    user     : 'riickk18',
    password : '12345678',
    database : 'richardPacheco_QAService'
  });

var whitelist = ['http://localhost:3000']
var corsOptions = {
origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
    callback(null, true)
    } else {
    callback(new Error('Not allowed by CORS'))
    }
}
}
  
  // Then pass them to cors:
app.use(cors(corsOptions));
app.use(express.json())

//Login
app.post("/login",(req,res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let username = req.body.persona.username;
        let password = req.body.persona.password;
        let query = "SELECT username, moderador from Persona WHERE username = '" + username + "' AND passwordUser = md5('" + password + "') LIMIT 1";
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            if (result.length > 0) {
                res.end(JSON.stringify({'loginResult': true, parameters: result[0]}, null, 3));
            }else{
                res.end(JSON.stringify({'loginResult': false}, null, 3));
            }
        });
    });
});

//Registro
app.post("/register",(req,res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let username = req.body.persona.username;
        let password = req.body.persona.password;
        let moderador = req.body.persona.moderador;
        //Verifying if user exist in database
        let queryUserExist = 'SELECT username FROM Persona WHERE username = "'+ username + '"'
        connection.query(queryUserExist, (err, result) => {
            if(err) throw err;
            if (result.length > 0){//If exist, return bad register
                connection.release(); //release connection
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({'loginResult': false, "message": "El nombre de usuario ya existe, ingrese uno diferente"}, null, 3));
            }else{//If username not exist yet, create user
                let query = 'INSERT INTO Persona (username, passwordUser, moderador) VALUES ("' + username + '", md5("' + password + '"), ' + moderador + ')';
                connection.query(query, (err, result) => {
                    connection.release(); //release connection
                    if(err) throw err;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({'loginResult': true, 'username': username, 'moderador': moderador}, null, 3));
                });
            }
        });
    });
});

//Lista de eventos
app.get("/evento/list",(req,res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let username = req.query.username
        let query = "SELECT id FROM Persona WHERE username = '" + username + "'"
        connection.query(query, (err, result) => {
            if(err) throw err;
            console.log(result)
            connection.query('SELECT A.id, A.nombre, DATE_FORMAT(A.fecha,"%d/%m/%Y") as fecha from (SELECT DISTINCT A.* FROM Persona_Evento B, Evento A WHERE B.idPersona = '+ result[0].id + ' AND B.idEvento = A.id) A', (err, result) => {
                connection.release(); //release connection
                if(err) throw err;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result, null, 3));
            });
        });
    });
});

//Crear evento
app.post("/evento/create",(req,res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let nombre = req.body.evento.nombre;
        let fecha = req.body.evento.fecha;
        let query = 'INSERT INTO Evento (nombre, fecha) VALUES ("' + nombre + '", "' + fecha + '")';
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({'loginResult': true}, null, 3));
        });
    });
});

//Lista de eventos en los que el usuario no se encuentra registrado
app.get("/evento/unregistered/list",(req,res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        let username = req.query.username
        console.log('Solicitud de eventos no registrados por ' + username);
        connection.query('SELECT id from Persona WHERE username = "' + username + '" LIMIT 1', (err, result) => {
            if(err) throw err;
            connection.query('SELECT * from Persona_Evento WHERE idPersona = "' + result[0].id + '"', (err, result) => {
                if(err) throw err;
                if (result.length === 0){
                    connection.query('SELECT id, nombre, DATE_FORMAT(fecha,"%d/%m/%Y") as fecha from Evento', (err, result) => {
                        connection.release(); //release connection
                        if(err) throw err;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(result, null, 3));
                    });
                }else{
                    connection.query('SELECT * FROM Evento E WHERE NOT EXISTS (SELECT * FROM Persona_Evento PE WHERE PE.idPersona = ' + result[0].idPersona + ' AND PE.idEvento = E.id)', (err, result) => {
                        connection.release(); //release connection
                        if(err) throw err;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(result, null, 3));
                    });
                }
            });
        });
    });
});

//Registrar asistencia a evento
app.post("/evento/register", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let username = req.body.personaEvento.username;
        let idEvento = req.body.personaEvento.idEvento;
        let query = 'SELECT id from Persona WHERE username = "' + username + '" LIMIT 1';
        connection.query(query, (err, result) => {
            if(err) throw err;
            connection.query('INSERT INTO Persona_Evento (idPersona, idEvento) VALUES (' + result[0].id + ', ' + idEvento + ')', (err, result) => {
                connection.release(); //release connection
                if(err) throw err;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({'result': true}, null, 3));
            });
        });
    });
});


//Lista de preguntas por evento, sin importar su estatus
app.post("/evento/pregunta/list", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idEvento = req.body.idEvento;
        let moderador = req.body.moderador;
        var query = ""
        if (moderador === 0){
            query = 'SELECT id, contenido, DATE_FORMAT(fecha,"%d/%m/%Y") as fecha, estatus from Pregunta WHERE idEvento = ' + (idEvento) + ' AND estatus = true';
        }else{
            query = 'SELECT id, contenido, DATE_FORMAT(fecha,"%d/%m/%Y") as fecha, estatus from Pregunta WHERE idEvento = ' + (idEvento);
        }
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result, null, 3));
        });
    });
});

//Denegar pregunta
app.post("/evento/pregunta/denied", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idEvento = req.body.idPregunta;
        let query = 'UPDATE Pregunta SET estatus = false WHERE id = ' + idPregunta.toString();
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result, null, 3));
        });
    });
});

//Registro de pregunta
app.post("/evento/pregunta/create", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idEvento = req.body.idEvento;
        let contenido = req.body.contenido;
        let fecha = req.body.fecha;
        let username = req.body.username;
        let query = 'SELECT id FROM Persona WHERE username = "' + username + '"'
        connection.query(query, (err, result) => {
            if(err) throw err;
            let query = 'INSERT INTO Pregunta (contenido, fecha, idPersona, idEvento) VALUES ("' + contenido + '", "' + fecha + '", ' + result[0].id.toString() + ', ' + idEvento.toString() + ')';
            connection.query(query, (err, result) => {
                connection.release(); //release connection
                if(err) throw err;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({'result': true}, null, 3));
            });
        });
    });
});

//Registro de respuesta
app.post("/evento/pregunta/respuesta/create", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let contenido = req.body.contenido;
        let fecha = req.body.fecha;
        let username = req.body.username;
        let idEvento = req.body.idEvento;
        let idPregunta = req.body.idPregunta;
        let query = 'SELECT id FROM Persona WHERE username = "'+ username +'"'
        connection.query(query, (err, result) => {
            if(err) throw err;
            let query = 'INSERT INTO Respuesta (contenido, fecha, idPersona, idEvento, idPregunta) VALUES ("' + contenido + '", "' + fecha + '", ' + result[0].id + ', ' + idEvento + ', ' + idPregunta + ')';
            connection.query(query, (err, result) => {
                if(err) throw err;
                let query = 'UPDATE Pregunta SET estatus = true WHERE id = ' + idPregunta.toString();
                connection.query(query, (err, result) => {
                    connection.release(); //release connection
                    if(err) throw err;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({"result": true}, null, 3));
                });
            });
        });
    });
});

//Lista de preguntas aceptadas por evento
app.post("/evento/pregunta/list/accepted", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idEvento = req.body.idEvento;
        let query = 'SELECT * from Pregunta WHERE estatus = TRUE AND idEvento = ' + (idEvento).toString() 
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result, null, 3));
        });
    });
});

//Lista de preguntas rechazadas
app.post("/evento/pregunta/list/denied", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idPregunta = req.body.idPregunta;
        let query = 'UPDATE Pregunta SET estatus = 0 WHERE id = '+ idPregunta.toString()
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({"result": true}, null, 3));
        });
    });
});

//Lista de respuestas por pregunta
app.get("/evento/pregunta/respuesta/list", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idPregunta = req.query.idPregunta;
        let query = 'SELECT id, contenido, DATE_FORMAT(fecha,"%d/%m/%Y") as fecha from Respuesta WHERE idPregunta = ' + idPregunta 
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result, null, 3));
        });
    });
});

//Lista de respuestas por pregunta
app.get("/evento/report", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idEvento = req.query.idEvento;
        let query = 'SELECT id, contenido, DATE_FORMAT(fecha,"%d/%m/%Y") as fecha FROM Pregunta WHERE estatus = false AND idEvento = ' + idEvento 
        connection.query(query, (err, result) => {
            let preguntas = result
            if(err) throw err;
            let query = 'SELECT SUM(if(estatus = true, 1, 0)) AS aceptadas, SUM(if(estatus = false, 1, 0)) AS denegadas, SUM(if(estatus = null, 1, 0)) AS nulas FROM Pregunta WHERE idEvento = '+ idEvento 
            connection.query(query, (err, result) => {
                connection.release(); //release connection
                if(err) throw err;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({"preguntas": preguntas, "values": {"aceptadas": result[0].aceptadas, "denegadas": result[0].denegadas, "nulas": result[0].nulas}}, null, 3));
            });
        });
    });
});


app.listen(8080, () => {
    console.log('Server is running at port 8080');
});

