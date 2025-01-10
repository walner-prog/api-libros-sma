// routes/libros.js
import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import auth from '../middleware/auth.js'; // Middleware de autenticación

dotenv.config();

const router = express.Router();
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Proteger todas las rutas con `auth`
router.use(auth);

// Definir rutas
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM libros';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/', (req, res) => {
    const { titulo, autor, descripcion, categoria, año_publicacion } = req.body;
    const sql = 'INSERT INTO libros (titulo, autor, descripcion, categoria, año_publicacion) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [titulo, autor, descripcion, categoria, año_publicacion], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, ...req.body });
    });
});

// Actualizar un libro
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, autor, descripcion, categoria, año_publicacion } = req.body;
    const sql = 'UPDATE libros SET titulo = ?, autor = ?, descripcion = ?, categoria = ?, año_publicacion = ? WHERE id = ?';
    db.query(sql, [titulo, autor, descripcion, categoria, año_publicacion, id], (err) => {
        if (err) throw err;
        res.json({ message: 'Libro actualizado' });
    });
});

// Eliminar un libro
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM libros WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) throw err;
        res.json({ message: 'Libro eliminado' });
    });
});

export default router;
