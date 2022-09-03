import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { deleteUsuario, getTransferencias, getUsuarios, newTransferencia, newUsuario, updateUsuario } from './DB.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));


//Middleware
app.use(express.json());


//Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/usuario', async (req, res) => {
    const usuario = req.body;
    try {
        const result = await newUsuario(usuario);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('No se pudo crear el usuario');
    }
});

app.get('/usuarios', async (req, res) => {
    try {
        const result = await getUsuarios();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('No se pudo obtener los usuarios');
    }
});

app.put('/usuario', async (req, res) => {
    const { id } = req.query;
    const usuario = req.body;
    const data = [usuario.name, usuario.balance, id];
    try {
        const result = await updateUsuario(data);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('No se pudo actualizar el usuario');
    }
});

app.delete('/usuario', async (req, res) => {
    const { id } = req.query;
    try {
        const result = await deleteUsuario(id);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('No se pudo eliminar el usuario');
    }
});

app.post('/transferencia', async (req, res) => {
    const transferencia = req.body;
    try {
        const result = await newTransferencia(transferencia);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('No se pudo realizar la transferencia');
    }
});

app.get('/transferencias', async (req, res) => {
    try {
        const result = await getTransferencias();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('No se pudo obtener las transferencias');
    }
});


//Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})