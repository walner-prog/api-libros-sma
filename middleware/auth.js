// middleware/auth.js
export default (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // Leer el encabezado `x-api-key`

    if (!apiKey) {
        return res.status(401).json({ message: 'No se proporcionó una API Key' });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: 'API Key inválida' });
    }

    next(); // Continuar si la API Key es válida
};
