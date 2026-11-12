import * as SQLite from 'expo-sqlite';
import bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';

// Define o provedor de números aleatórios pro bcryptjs rodar no React Native / Expo
bcrypt.setRandomFallback((len) => {
  const getRandomValues = Crypto.getRandomBytes(len);
  return Array.from(getRandomValues);
});

const db = SQLite.openDatabaseAsync('estoque.db');

// Inicializar banco de dados
export async function inicializarBanco() {
  const database = await db;

  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT,
      cor TEXT,
      tamanho TEXT,
      quantidade REAL NOT NULL DEFAULT 0,
      unidade TEXT NOT NULL DEFAULT 'metros',
      preco REAL NOT NULL DEFAULT 0,
      qr_code TEXT UNIQUE,
      categoria_id INTEGER,
      data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    );

    CREATE TABLE IF NOT EXISTS movimentacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK (
        tipo IN ('ajuste do dia', 'entrada', 'saida', 'reservado')
      ),
      quantidade REAL NOT NULL CHECK(quantidade > 0),
      data TEXT DEFAULT CURRENT_TIMESTAMP,
      observacao TEXT,
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL
    );
  `);

  console.log('Banco de dados inicializado!');
}

// Cadastrar usuário
export async function cadastrarUsuario(nome, email, senha) {
  await inicializarBanco();

  const database = await db;

  const nomeFormatado = nome.trim();
  const emailFormatado = email.trim().toLowerCase();

  // Verificar se o e-mail já está cadastrado
  const usuarioExistente = await database.getFirstAsync(
    'SELECT id FROM usuarios WHERE email = ?',
    [emailFormatado]
  );

  if (usuarioExistente) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  // Gerar hash da senha com bcryptjs
  const salt = bcrypt.genSaltSync(10);
  const senhaHash = bcrypt.hashSync(senha, salt);

  // Salvar usuário no banco
  await database.runAsync(
    `INSERT INTO usuarios (nome, email, senha_hash)
     VALUES (?, ?, ?)`,
    [nomeFormatado, emailFormatado, senhaHash]
  );

  return true;
}

// Autenticar usuário
export async function autenticarUsuario(email, senha) {
  await inicializarBanco();

  const database = await db;

  const emailFormatado = email.trim().toLowerCase();

  const usuario = await database.getFirstAsync(
    `SELECT id, nome, email, senha_hash
     FROM usuarios
     WHERE email = ?`,
    [emailFormatado]
  );

  if (!usuario) {
    return null;
  }

  // Comparar senha digitada com o hash armazenado
  const senhaCorreta = bcrypt.compareSync(senha, usuario.senha_hash);

  if (!senhaCorreta) {
    return null;
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email
  };
}