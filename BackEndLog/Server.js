const express = require('express');
const sql = require('mssql');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

// Middleware para analisar o corpo da requisição como JSON
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

const { Connection, Request } = require('tedious');

const config = {
    server: '127.0.0.1',
    authentication: {
        type: 'default',
        options: {
            Name: '', // Deixe vazio para autenticação do Windows
            password: '', // Deixe vazio para autenticação do Windows
            // se você estiver usando o Windows Authentication, remova estas linhas
        }
    },
    options: {
        database: 'LogDTBase',
        encrypt: false,
        trustedConnection: true // Usar autenticação do Windows
    }
};

const connection = new Connection(config);
connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar:', err);
    } else {
        console.log('Conexão bem-sucedida com o SQL Server!');
    }
});

app.post('/api/register', (req, res) => {
    const { Name, Password } = req.body;
    const sqlQuery = `INSERT INTO usuarios (nome, email, senha) VALUES ('${Name}', '${Password}')`; // Cuidado com SQL Injection!

    const request = new Request(sqlQuery, (err) => {
        if (err) {
            console.error('Erro ao registrar usuário:', err);
            res.status(500).send('Erro no servidor');
        } else {
            res.status(201).send('Usuário registrado com sucesso!');
        }
    });

    connection.execSql(request);
});

app.post('/api/login', (req, res) => {
    const { Name, Password } = req.body;
    const sqlQuery = `SELECT * FROM usuarios WHERE Name = '${Name}' AND senha = '${Password}'`;

    const request = new Request(sqlQuery, (err, rowCount, rows) => {
        if (err) {
            console.error('Erro ao realizar login:', err);
            res.status(500).send('Erro no servidor');
        } else if (rowCount === 0) {
            res.status(401).send('Credenciais inválidas');
        } else {
            res.status(200).send('Login bem-sucedido');
        }
    });

    connection.execSql(request);
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});