# loginEregistro

Sistema de login e registro profissional para aplicações web.

## Funcionalidades

- Registro de usuário com nome de usuário, e-mail e senha
- Confirmação de cadastro por e-mail (código de 6 dígitos/letras)
- Login seguro (senha protegida com hash)
- Autenticação JWT para rotas protegidas
- Recuperação e redefinição de senha por e-mail
- Painel de usuário protegido
- Banco de dados MySQL
- Frontend estilizado (HTML + CSS)

## Tecnologias Utilizadas

- Node.js + Express
- MySQL
- Nodemailer (Ethereal para testes de e-mail)
- bcrypt (hash de senha)
- jsonwebtoken (JWT)
- HTML5, CSS3

## Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/antonioppx/loginEregistro.git
   cd loginEregistro
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o banco de dados MySQL:**
   - Crie um banco chamado `loginfuncional`:
     ```sql
     CREATE DATABASE loginfuncional;
     ```
   - Ajuste o arquivo `database.js` com seu usuário e senha do MySQL, se necessário.

4. **Configure o envio de e-mails:**
   - O sistema já está configurado para usar Ethereal (teste). Para produção, altere o arquivo `mailer.js`.

5. **Inicie o servidor:**
   ```bash
   npm start
   ```

6. **Acesse no navegador:**
   - [http://localhost:3000](http://localhost:3000)

## Como usar

- **Registrar:** Preencha nome de usuário, e-mail e senha. Confirme o cadastro com o código enviado por e-mail.
- **Login:** Após confirmação, faça login normalmente.
- **Recuperar senha:** Use "Esqueci minha senha" para receber um código e redefinir a senha.
- **Painel:** Após login, use o token JWT para acessar rotas protegidas.

## Observações

- O sistema usa Ethereal para envio de e-mails em ambiente de testes. Veja o link do e-mail no terminal do servidor.
- Para produção, configure um serviço real de e-mail no `mailer.js`.
- As senhas são protegidas com hash (bcrypt).

## Autor

Desenvolvido por [antonioppx](https://github.com/antonioppx)
