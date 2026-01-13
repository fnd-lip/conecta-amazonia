## Como rodar o projeto

⚠️ **IMPORTANTE**: Se você já tinha containers rodando com MySQL, execute primeiro:

```shell
# Para containers antigos (MySQL)
docker-compose down -v --remove-orphans
```

---

**⚠️ ATENÇÃO: Para desenvolvimento local, primeiro suba o banco PostgreSQL:**

```shell
docker-compose up -d postgres
```

0. Rodar o pgadmin:

```shell
docker-compose up -d pgadmin
```

1. Entrar na pasta backend

```shell
cd backend
```

2. Setup inicial do backend (Apenas uma vez, para instalação dos pacotes e configuração do banco)

```shell
npm run setup
```

3. Rodar a API

```shell
npm run dev
```

4. Entrar na pasta frontend

```shell
cd frontend
```

5. Rodar o Front

```shell
npm run dev
```

---

## Como subir a aplicação

O docker-compose está configurado para subir o banco PostgreSQL 16, backend e frontend. Rode o seguinte comando para subir a aplicação:

```shell
docker-compose up -d --build
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:3001`

pgAdmin: `http://localhost:8080`
- Email: admin@admin.com
- Senha: admin
- **Servidor PostgreSQL já pré-configurado automaticamente!**
- Host do banco: postgres
- Porta: 5432
- Database: conecta_amazonia
- User: user
- Password: pass

**Novidade:** O servidor PostgreSQL já vem configurado no pgAdmin, não precisa adicionar manualmente!

---

## Endpoints da API

###  **Usuários Pré-cadastrados**

| Tipo | Email | Senha | Descrição |
|------|-------|--------|-----------|
| **Admin** | admin@teste.com | 123456 | Acesso total ao sistema |
| **Gestor** | gestor@teste.com | 123456 | Gerencia eventos próprios |
| **Gestor 2** | gestor2@teste.com | 123456 | Gerencia eventos próprios |

---

### Autenticação

#### Login
**POST** `/auth/login`
```json
{
  "email": "admin@teste.com",
  "password": "123456"
}
```
**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Eventos

#### Criar Evento (Requer autenticação)
**POST** `/events`
**Headers:** `Authorization: Bearer {token}`
```json
{
  "nome": "Festival de Inverno",
  "descricao": "Festival cultural da região",
  "data": "2025-07-15T10:00:00.000Z",
  "categoria": "Cultural",
  "parentId": null,
  "subeventos": [
    {
      "nome": "Show de Abertura",
      "descricao": "Apresentação musical",
      "data": "2025-07-15T19:00:00.000Z",
      "categoria": "Musical"
    }
  ]
}
```

#### Listar Meus Eventos (Requer autenticação)
**GET** `/events/mine`
**Headers:** `Authorization: Bearer {token}`

**Resposta:**
```json
{
  "message": "Eventos encontrados",
  "events": [
    {
      "id": "uuid",
      "nome": "Meu Evento",
      "descricao": "Descrição",
      "data": "2025-07-15T10:00:00.000Z",
      "categoria": "Cultural",
      "createdAt": "2025-01-01T12:00:00.000Z",
      "children": [...],
      "user": { "name": "Nome do Usuário" }
    }
  ]
}
```

#### Buscar Evento por ID
**GET** `/events/{id}`

#### Atualizar Evento (Requer autenticação + ser o dono)
**PUT** `/events/{id}`
**Headers:** `Authorization: Bearer {token}`
```json
{
  "nome": "Evento Atualizado",
  "descricao": "Nova descrição",
  "categoria": "Atualizada"
}
```

#### Excluir Evento (Requer autenticação + ser o dono)
**DELETE** `/events/{id}`
**Headers:** `Authorization: Bearer {token}`

### Administração (Requer token de admin)

#### Listar Todos os Eventos
**GET** `/admin/events`
**Headers:** `Authorization: Bearer {admin_token}`

**Resposta:**
```json
[
  {
    "id": "uuid",
    "nome": "Evento",
    "descricao": "Descrição",
    "data": "2025-07-15T10:00:00.000Z",
    "categoria": "Cultural",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "user": { "name": "Criador do Evento" },
    "children": [
      {
        "id": "uuid",
        "nome": "Subevento"
      }
    ]
  }
]
```

#### Listar Todos os Usuários
**GET** `/admin/users`
**Headers:** `Authorization: Bearer {admin_token}`

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "type": {
      "label": "Administrador"
    }
  }
]
```

---

###  Níveis de Acesso

- **Público:** `GET /events/{id}`
- **Autenticado:** `POST /events`, `GET /events/mine`, `PUT /events/{id}`, `DELETE /events/{id}`
- **Admin:** `GET /admin/events`, `GET /admin/users`

###  Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 500 | Erro interno |
