# Gerenciador-de-estoque-com-QRcode

# 📦 Gerenciador de Estoque com QR Code

Aplicativo mobile desenvolvido em **React Native (Expo)** para controle prático e offline de estoque de tecidos, facilitando o registro de metragem, rolos, entradas, saídas e identificação por etiquetas QR Code.

---

## ✨ Funcionalidades

- **Autenticação de Usuários:** Cadastro e login com criptografia de senha (`bcryptjs`) e persistência local.
- **Dashboard Dinâmico:** Saudação personalizada por usuário, data atual e indicadores em tempo real de movimentos do dia, entradas, saídas e ajustes de inventário.
- **Cadastro de Tecidos:** Registro de nome, tipo/composição, cor, largura/gramatura, unidade de medida (`metros`, `kg` ou `rolos`), preço e geração automática de código QR.
- **Listagem e Busca Rápida:** Filtro em tempo real por nome, cor, composição ou código QR, com botões rápidos para lançar entradas e saídas diretamente no card.
- **Histórico de Movimentações:** Rastreamento completo das últimas atualizações com data, hora, observações e abas de filtro por tipo de operação.

---

## 🛠️ Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — Banco de dados relacional local
- [React Navigation](https://reactnavigation.org/) — Navegação entre telas
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) & [Expo Crypto](https://docs.expo.dev/versions/latest/sdk/crypto/) — Hash seguro de senhas
- [Expo Vector Icons](https://docs.expo.dev/guides/icons/) — Ícones da interface

---

## 📁 Estrutura do Projeto

```text
├── assets/                     # Ícones e imagens do aplicativo
├── src/
│   ├── database/
│   │   └── database.js         # Criação das tabelas SQLite e regras de negócio
│   └── screens/
│       ├── login.js            # Tela de autenticação
│       ├── cadastro.js         # Tela de registro de usuário
│       ├── home.js             # Dashboard principal e movimentações recentes
│       ├── cadastroTecido.js   # Formulário de cadastro de tecidos
│       ├── listaTecidos.js     # Estoque, busca e modal de entrada/saída
│       └── historicoMovimentacoes.js # Histórico filtrado por tipo de operação
├── App.js                      # Configuração das rotas
└── package.json                # Dependências do projeto