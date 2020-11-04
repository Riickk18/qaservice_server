const express = require("express");
const app = express();
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

app.use(express.json())

//Login
app.post("/login",(req,res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let username = req.body.username;
        let password = req.body.password;
        let query = 'SELECT * from Persona WHERE username = ' + username + ' AND password = ' + password + ' LIMIT 1';
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            if (result.length > 0) {
                res.end(JSON.stringify({'loginResult': true}, null, 3));
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
        let username = req.body.username;
        let password = req.body.password;
        let moderador = req.body.moderador;
        let query = 'INSERT INTO Persona (username, password, moderador) VALUES (' + username + ', md5(' + password + '), ' + moderador + ')';
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            if (result.length > 0) {
                res.end(JSON.stringify({'loginResult': true}, null, 3));
            }else{
                res.end(JSON.stringify({'loginResult': false}, null, 3));
            }
        });
    });
});

//Crear evento
app.post("/evento/create",(req,res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let nombre = req.body.nombre;
        let fecha = req.body.fecha;
        let query = 'INSERT INTO Evento (nombre, fecha) VALUES (' + nombre + ', ' + fecha + ')';
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            if (result.length > 0) {
                res.end(JSON.stringify({'loginResult': true}, null, 3));
            }else{
                res.end(JSON.stringify({'loginResult': false}, null, 3));
            }
        });
    });
});

//Lista de eventos
app.get("/evento/list",(req,res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        connection.query('SELECT * from Evento', (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result, null, 3));
        });
    });
});

//Lista de preguntas por evento, sin importar su estatus
app.post("/evento/pregunta/list", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idEvento = req.body.idEvento;
        let query = 'SELECT * from Pregunta WHERE idEvento = ' + (idEvento).toString();
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
        let contenido = req.body.contenido;
        let fecha = req.body.fecha;
        let idPersona = req.body.idPersona;
        let idEvento = req.doby.idEvento;
        let query = 'INSERT INTO Pregunta (contenido, fecha, estatus, idPersona, idEvento) VALUES (' + contenido + ', ' + fecha + ', ' + idPersona.toString() + ', ' + idEvento.toString() + ')';
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result, null, 3));
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
        let idPersona = req.body.idPersona;
        let idEvento = req.doby.idEvento;
        let idPregunta = req.body.idPregunta;
        let query = 'INSERT INTO Respuesta (contenido, fecha, idPersona, idEvento, idPregunta) VALUES (' + contenido + ', ' + fecha + ', ' + idPersona.toString() + ', ' + idEvento.toString() + ', ' + idPregunta.toString() + ')';
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            let query = 'UPDATE Pregunta SET estatus = true WHERE id = ' + idPregunta.toString();
            connection.query(query, (err, result) => {
                connection.release(); //release connection
                if(err) throw err;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result, null, 3));
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
        let idEvento = req.body.idEvento;
        let query = 'SELECT * from Pregunta WHERE estatus = FALSE AND idEvento = ' + (idEvento).toString() 
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result, null, 3));
        });
    });
});

//Lista de respuestas por pregunta
app.post("/evento/pregunta/respuesta/list", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Solicitud con id ' + connection.threadId);
        let idPregunta = req.body.idPregunta;
        let query = 'SELECT * from Respuesta WHERE idPregunta = ' + (idPregunta).toString() 
        connection.query(query, (err, result) => {
            connection.release(); //release connection
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result, null, 3));
        });
    });
});


app.listen(8080, () => {
    console.log('Server is running at port 8080');
    // console.log("Ciphertext (crypto js):", encrypt_decrypt.encrypt_cryptojs(plaintext, password, iv64, salt));
});

