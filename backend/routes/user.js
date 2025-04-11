const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { nome, email, cpf, senha, data_nascimento } = req.body;

  try {
    const [existingEmailUser] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existingEmailUser.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já esta cadastrado.' });
    }

    const [existingCPFUser] = await pool.query('SELECT cpf FROM users WHERE cpf = ?', [cpf]);
    if (existingCPFUser.length > 0) {
      return res.status(409).json({ error: 'Este CPF já esta cadastrado.' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (nome, email, cpf, senha, data_nascimento) VALUES (?, ?, ?, ?, ?)',
      [nome, email, cpf, senha, data_nascimento]
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Erro ao cadastrar user:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND senha = ?', [email, senha]);
    if (rows.length > 0) {
      res.json({ message: 'Login realizado com sucesso!', user: rows[0] });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, cpf, data_nascimento } = req.body;

  if (isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'ID de user invalido.' });
  }

  if (!nome || !email) {
    return res.status(400).json({ message: 'Nome e Email são campos obrigatorios.' });
  }

  try {
    const [existingEmail] = await pool.query('SELECT id_users FROM users WHERE email = ? AND id_users != ?', [email, id]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const [existingCPF] = await pool.query('SELECT id_users FROM users WHERE cpf = ? AND id_users != ?', [cpf, id]);
    if (existingCPF.length > 0) {
      return res.status(409).json({ message: 'Este CPF já esta cadastrado.' });
    }

    const [result] = await pool.query(
      'UPDATE users SET nome = ?, email = ?, cpf = ?, data_nascimento = ? WHERE id_users = ?',
      [nome, email, cpf, data_nascimento, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'user não encontrado para atualização.' });
    }

    const [updatedUser] = await pool.query('SELECT * FROM users WHERE id_users = ?', [id]);
    res.status(200).json(updatedUser[0]);

  } catch (error) {
    console.error('Erro ao atualizar user:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar user.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'ID de user invalido.' });
  }

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id_users = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'user não encontrado.' });
    }

    res.status(200).json({ message: 'user deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar user:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar user.' });
  }
});

module.exports = router;