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

  const usuarioExistente = await database.getFirstAsync(
    'SELECT id FROM usuarios WHERE email = ?',
    [emailFormatado]
  );

  if (usuarioExistente) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  const salt = bcrypt.genSaltSync(10);
  const senhaHash = bcrypt.hashSync(senha, salt);

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

// Cadastrar novo tecido/produto e registrar a movimentação inicial
export async function cadastrarProduto({
  nome,
  tipo,
  cor,
  tamanho,
  quantidade,
  unidade,
  preco,
  qr_code
}) {
  await inicializarBanco();
  const database = await db;

  const nomeFormatado = nome.trim();
  const tipoFormatado = tipo ? tipo.trim() : null;
  const corFormatada = cor ? cor.trim() : null;
  const tamanhoFormatado = tamanho ? tamanho.trim() : null;
  const qtdNumerica = parseFloat(String(quantidade).replace(',', '.')) || 0;
  const precoNumerico = parseFloat(String(preco).replace(',', '.')) || 0;
  const qrFormatado = qr_code && qr_code.trim() !== '' ? qr_code.trim() : null;
  const unidadeFinal = unidade || 'metros';

  if (qrFormatado) {
    const qrExistente = await database.getFirstAsync(
      'SELECT id FROM produtos WHERE qr_code = ?',
      [qrFormatado]
    );
    if (qrExistente) {
      throw new Error('Este código QR já está vinculado a outro tecido.');
    }
  }

  const resultado = await database.runAsync(
    `INSERT INTO produtos (nome, tipo, cor, tamanho, quantidade, unidade, preco, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nomeFormatado,
      tipoFormatado,
      corFormatada,
      tamanhoFormatado,
      qtdNumerica,
      unidadeFinal,
      precoNumerico,
      qrFormatado
    ]
  );

  const novoProdutoId = resultado.lastInsertRowId;

  // Registra automaticamente nas movimentações recentes
  if (qtdNumerica > 0) {
    await database.runAsync(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, observacao)
       VALUES (?, 'entrada', ?, 'Cadastro inicial no estoque')`,
      [novoProdutoId, qtdNumerica]
    );
  }

  return novoProdutoId;
}

// Listar todos os tecidos/produtos cadastrados
export async function listarProdutos() {
  await inicializarBanco();
  const database = await db;

  const produtos = await database.getAllAsync(
    'SELECT * FROM produtos ORDER BY id DESC'
  );

  return produtos;
}

// Excluir um tecido pelo ID
export async function excluirProduto(id) {
  await inicializarBanco();
  const database = await db;

  await database.runAsync('DELETE FROM movimentacoes WHERE produto_id = ?', [id]);
  await database.runAsync('DELETE FROM produtos WHERE id = ?', [id]);
  return true;
}

// Buscar apenas as últimas atualizações/movimentações (limite padrão: 5)
export async function listarMovimentacoesRecentes(limite = 5) {
  await inicializarBanco();
  const database = await db;

  const movimentacoes = await database.getAllAsync(
    `SELECT 
       m.id,
       m.tipo,
       m.quantidade,
       m.data,
       p.nome AS produto_nome,
       p.unidade AS produto_unidade
     FROM movimentacoes m
     INNER JOIN produtos p ON m.produto_id = p.id
     ORDER BY m.id DESC
     LIMIT ?`,
    [limite]
  );

  return movimentacoes;
}

// Registrar movimentação (entrada, saída, ajuste do dia ou reservado)
export async function registrarMovimentacao({
  produtoId,
  tipo,
  quantidade,
  observacao
}) {
  await inicializarBanco();
  const database = await db;

  const qtdMovimento = parseFloat(String(quantidade).replace(',', '.'));
  if (isNaN(qtdMovimento) || qtdMovimento <= 0) {
    throw new Error('Informe uma quantidade válida maior que zero.');
  }

  // Busca o saldo atual do tecido
  const produto = await database.getFirstAsync(
    'SELECT id, nome, quantidade, unidade FROM produtos WHERE id = ?',
    [produtoId]
  );

  if (!produto) {
    throw new Error('Tecido não encontrado no banco de dados.');
  }

  let novaQuantidade = Number(produto.quantidade);

  if (tipo === 'entrada') {
    novaQuantidade += qtdMovimento;
  } else if (tipo === 'saida' || tipo === 'reservado') {
    if (qtdMovimento > novaQuantidade) {
      throw new Error(
        `Saldo insuficiente! Estoque atual: ${String(novaQuantidade).replace('.', ',')} ${produto.unidade}.`
      );
    }
    novaQuantidade -= qtdMovimento;
  } else if (tipo === 'ajuste do dia') {
    // No ajuste de inventário, a quantidade informada passa a ser o novo saldo real do rolo
    novaQuantidade = qtdMovimento;
  }

  // Arredonda para evitar imprecisões decimais (ex: 10.200000000000001)
  novaQuantidade = Math.round(novaQuantidade * 100) / 100;

  // 1. Atualiza o saldo na tabela produtos
  await database.runAsync(
    'UPDATE produtos SET quantidade = ? WHERE id = ?',
    [novaQuantidade, produtoId]
  );

  // 2. Insere o registro na tabela movimentacoes
  const obsFormatada = observacao && observacao.trim() !== '' ? observacao.trim() : null;
  await database.runAsync(
    `INSERT INTO movimentacoes (produto_id, tipo, quantidade, observacao)
     VALUES (?, ?, ?, ?)`,
    [produtoId, tipo, qtdMovimento, obsFormatada]
  );

  return novaQuantidade;
}

// Obter os contadores reais para os 4 cards da Home
export async function obterResumoDashboard() {
  await inicializarBanco();
  const database = await db;

  const movDia = await database.getFirstAsync(
    `SELECT COUNT(*) AS total 
     FROM movimentacoes 
     WHERE date(data, 'localtime') = date('now', 'localtime')`
  );

  const entradas = await database.getFirstAsync(
    `SELECT COUNT(*) AS total FROM movimentacoes WHERE tipo = 'entrada'`
  );

  const saidas = await database.getFirstAsync(
    `SELECT COUNT(*) AS total FROM movimentacoes WHERE tipo = 'saida'`
  );

  const ajustes = await database.getFirstAsync(
    `SELECT COUNT(*) AS total FROM movimentacoes WHERE tipo = 'ajuste do dia'`
  );

  return {
    movimentoDia: movDia?.total || 0,
    entradas: entradas?.total || 0,
    saidas: saidas?.total || 0,
    ajustes: ajustes?.total || 0
  };
}

// Listar movimentações filtradas por tipo ('todos', 'hoje', 'entrada', 'saida', 'ajuste do dia')
export async function listarMovimentacoesPorFiltro(filtro = 'todos') {
  await inicializarBanco();
  const database = await db;

  let whereClause = '';
  const params = [];

  if (filtro === 'hoje') {
    whereClause = `WHERE date(m.data, 'localtime') = date('now', 'localtime')`;
  } else if (filtro === 'entrada' || filtro === 'saida' || filtro === 'ajuste do dia') {
    whereClause = `WHERE m.tipo = ?`;
    params.push(filtro);
  }

  const registros = await database.getAllAsync(
    `SELECT 
       m.id,
       m.tipo,
       m.quantidade,
       m.observacao,
       strftime('%d/%m/%Y %H:%M', m.data, 'localtime') AS data_formatada,
       p.nome AS produto_nome,
       p.cor AS produto_cor,
       p.unidade AS produto_unidade
     FROM movimentacoes m
     INNER JOIN produtos p ON m.produto_id = p.id
     ${whereClause}
     ORDER BY m.id DESC`,
    params
  );

  return registros;
}

// Atualizar o nome do usuário logado
export async function atualizarNomeUsuario(usuarioId, novoNome) {
  await inicializarBanco();
  const database = await db;

  const nomeFormatado = novoNome.trim();
  if (!nomeFormatado) {
    throw new Error('O nome não pode ficar em branco.');
  }

  await database.runAsync(
    'UPDATE usuarios SET nome = ? WHERE id = ?',
    [nomeFormatado, usuarioId]
  );

  return nomeFormatado;
}

// Alterar a senha validando a senha atual com bcryptjs
export async function alterarSenhaUsuario(usuarioId, senhaAtual, novaSenha) {
  await inicializarBanco();
  const database = await db;

  if (!novaSenha || novaSenha.length < 4) {
    throw new Error('A nova senha deve ter pelo menos 4 caracteres.');
  }

  const usuario = await database.getFirstAsync(
    'SELECT id, senha_hash FROM usuarios WHERE id = ?',
    [usuarioId]
  );

  if (!usuario) {
    throw new Error('Usuário não encontrado.');
  }

  const senhaAtualCorreta = bcrypt.compareSync(senhaAtual, usuario.senha_hash);
  if (!senhaAtualCorreta) {
    throw new Error('A senha atual está incorreta.');
  }

  const salt = bcrypt.genSaltSync(10);
  const novoHash = bcrypt.hashSync(novaSenha, salt);

  await database.runAsync(
    'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
    [novoHash, usuarioId]
  );

  return true;
}