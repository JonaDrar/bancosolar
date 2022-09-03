import pg from 'pg';
import moment from 'moment';

const client = new pg.Pool({
    user: 'pruebasbootcamp',
    host: 'localhost',
    database: 'bancosolar',
    password: '123456',
    port: 5432,
});


export const newUsuario = async (usuario) => {
    const userArray = Object.values(usuario);
    const SQLQuery = {
        text: 'INSERT INTO usuarios(nombre, balance) VALUES($1, $2) RETURNING *',
        values: userArray
    }
    try {
        const result = await client.query(SQLQuery);
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const getUsuarios = async () => {
    const SQLQuery = {
        text: 'SELECT * FROM usuarios'
    }
    try {
        const result = await client.query(SQLQuery);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const updateUsuario = async (data) => {
    const SQLQuery = {
        text: 'UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *',
        values: data
    }
    try {
        const result = await client.query(SQLQuery);
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const deleteUsuario = async (id) => {
    const SQLQuery = {
        text: 'DELETE FROM usuarios WHERE id = $1 RETURNING *',
        values: [id]
    }
    const SQLQuery2 = {
        text: 'DELETE FROM transferencias WHERE emisor = $1',
        values: [id]
    }
    const SQLQuery3 = {
        text: 'DELETE FROM transferencias WHERE receptor = $1',
        values: [id]
    }
    try {
        client.connect();
        client.query('BEGIN');
        await client.query(SQLQuery2);
        await client.query(SQLQuery3);
        const result = await client.query(SQLQuery);
        client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        client.query('ROLLBACK');
        console.error(error);
        throw new Error(error);
    }
};

export const newTransferencia = async (transferencia) => {
    const nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const SQLQuery2 = {
        text: 'UPDATE usuarios SET balance = balance - $1 WHERE nombre = $2 RETURNING *',
        values: [transferencia.monto, transferencia.emisor]
    }
    const SQLQuery3 = {
        text: 'UPDATE usuarios SET balance = balance + $1 WHERE nombre = $2 RETURNING *',
        values: [transferencia.monto, transferencia.receptor]
    }

    try {
        await client.query('BEGIN');
        const emisor = await client.query(SQLQuery2);
        const emisorId = emisor.rows[0].id;
        const receptor = await client.query(SQLQuery3);
        const receptorId = receptor.rows[0].id;
        const SQLQuery = {
            text: 'INSERT INTO transferencias(emisor, receptor, monto, fecha) VALUES($1, $2, $3, $4) RETURNING *',
            values: [emisorId, receptorId, transferencia.monto, nowTime]
        }
        const result = await client.query(SQLQuery);
        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(error);
    }
};

export const getTransferencias = async () => {
    const SQLQuery = {
        text: 'SELECT trans.id, emisor.nombre as emisor_name, receptor.nombre as receptor_name, trans.monto, trans.fecha FROM transferencias trans JOIN usuarios emisor ON trans.emisor=emisor.id JOIN usuarios receptor on trans.receptor=receptor.id ORDER BY trans.id DESC',
        rowMode: 'array'
    }
    try {
        const result = await client.query(SQLQuery);
        return result.rows;
        console.log()
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};