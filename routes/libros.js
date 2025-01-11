// routes/libros.js
import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import auth from '../middleware/auth.js'; // Middleware de autenticación
import Joi from 'joi'; // Librería para validación

dotenv.config();

const router = express.Router();

// Crear una conexión pool para un mejor manejo de conexiones
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000,
});

// Middleware para proteger todas las rutas
router.use(auth);

// Esquema de validación para los datos del libro
const libroSchema = Joi.object({
    titulo: Joi.string().required(),
    autor: Joi.string().required(),
    descripcion: Joi.string().optional(),
    categoria: Joi.string().required(),
    año_publicacion: Joi.number().integer().min(1900).max(new Date().getFullYear()).required()
});

// Ruta para obtener todos los libros
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM libros');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los libros', error: err.message });
    }
});

// Ruta para agregar un nuevo libro
router.post('/', async (req, res) => {
    const { error } = libroSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { titulo, autor, descripcion, categoria, año_publicacion } = req.body;

    try {
        const [result] = await db.query('INSERT INTO libros (titulo, autor, descripcion, categoria, año_publicacion) VALUES (?, ?, ?, ?, ?)', 
            [titulo, autor, descripcion, categoria, año_publicacion]);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ message: 'Error al agregar el libro', error: err.message });
    }
});

// Ruta para actualizar un libro
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = libroSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { titulo, autor, descripcion, categoria, año_publicacion } = req.body;

    try {
        const [result] = await db.query('UPDATE libros SET titulo = ?, autor = ?, descripcion = ?, categoria = ?, año_publicacion = ? WHERE id = ?', 
            [titulo, autor, descripcion, categoria, año_publicacion, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        res.json({ message: 'Libro actualizado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar el libro', error: err.message });
    }
});

// Ruta para eliminar un libro
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM libros WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        res.json({ message: 'Libro eliminado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el libro', error: err.message });
    }
});

export default router;
