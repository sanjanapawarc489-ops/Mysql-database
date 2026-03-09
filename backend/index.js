require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const PORT = 5000;
const JWT_SECRET = 'my_super_secret_key';

let pool;
const fallbackUsers = [];

async function initDb() {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: 'avnadmin',
            password: 'YOUR_DATABASE_PASSWORD',
            database: process.env.DB_NAME || 'defaultdb',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS User (
                uid INT AUTO_INCREMENT PRIMARY KEY,
                uname VARCHAR(255) NOT NULL UNIQUE,
                uemail VARCHAR(255) NOT NULL,
                phon VARCHAR(20),
                password VARCHAR(255) NOT NULL
            )
        `);
        connection.release();
        console.log('Database connected and User table verified.');
    } catch (error) {
        console.error('Database connection failed. Proceeding without db...', error);
        pool = null;
    }
}

initDb();

app.post('/register', async (req, res) => {
    try {
        const { uname, uemail, phon, password } = req.body;

        if (!uname || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (pool) {
            await pool.query(
                'INSERT INTO User (uname, uemail, phon, password) VALUES (?, ?, ?, ?)',
                [uname, uemail || '', phon || '', hashedPassword]
            );
        } else {
            fallbackUsers.push({ uid: Date.now(), uname, uemail, phon, password: hashedPassword });
        }

        res.status(201).json({ message: 'reister success' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { uname, password } = req.body;

        if (!uname || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        let user;
        if (pool) {
            const [rows] = await pool.query('SELECT * FROM User WHERE uname = ?', [uname]);
            user = rows[0];
        } else {
            user = fallbackUsers.find(u => u.uname === uname);
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ uid: user.uid, uname: user.uname }, 'secrettest', { expiresIn: '1h' });
            res.cookie('authToken', token, {
                httpOnly: true,
                maxAge: 3600000 // 1 hour
            });
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/users', async (req, res) => {
    try {
        if (pool) {
            const [rows] = await pool.query('SELECT * FROM User');
            res.status(200).json(rows);
        } else {
            res.status(200).json(fallbackUsers);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
