import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Conecta Amazônia API',
    version: '1.0.0',
    description: `
# API para gestão de eventos culturais da Amazônia

## Fluxo de Autenticação Automática:

### 1. Faça login em POST /auth/login:
   - Admin: admin@teste.com / 123456
   - Gestor: gestor@teste.com / 123456

### 2. Copie apenas o token da resposta (sem "Bearer")

### 3. Clique no botão "Authorize" no topo

### 4. Cole o token no campo "Value" e clique "Authorize"

### 5. Pronto! Todos os endpoints protegidos usam automaticamente o token

## Funcionalidades:
- Gestores: CRUD nos próprios eventos
- Admins: Visualização completa de eventos e usuários

## Dica: O token fica salvo no navegador automaticamente
    `,
    contact: {
      name: 'Conecta Amazônia',
      email: 'contato@conectaamazonia.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor de Desenvolvimento'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido através do endpoint de login'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único do usuário'
          },
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Nome completo do usuário'
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 100,
            description: 'Email do usuário (deve ser único)'
          },
          type: {
            type: 'object',
            properties: {
              label: {
                type: 'string',
                enum: ['Administrador', 'Gestor Local'],
                description: 'Papel do usuário no sistema'
              }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação do usuário'
          }
        }
      },
      Event: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único do evento'
          },
          nome: {
            type: 'string',
            maxLength: 100,
            description: 'Nome do evento (deve ser único)'
          },
          descricao: {
            type: 'string',
            description: 'Descrição detalhada do evento'
          },
          data: {
            type: 'string',
            format: 'date-time',
            description: 'Data e hora do evento'
          },
          categoria: {
            type: 'string',
            description: 'Categoria do evento (ex: Cultural, Festival, Oficina)'
          },
          parentId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'ID do evento pai (null para eventos principais)'
          },
          user: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Nome do criador do evento'
              }
            }
          },
          children: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Event'
            },
            description: 'Lista de subeventos'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação do evento'
          }
        }
      },
      CreateEventRequest: {
        type: 'object',
        required: ['nome', 'descricao', 'data', 'categoria'],
        properties: {
          nome: {
            type: 'string',
            maxLength: 100,
            description: 'Nome do evento'
          },
          descricao: {
            type: 'string',
            description: 'Descrição do evento'
          },
          data: {
            type: 'string',
            format: 'date-time',
            description: 'Data e hora do evento'
          },
          categoria: {
            type: 'string',
            description: 'Categoria do evento'
          },
          parentId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'ID do evento pai (opcional)'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email do usuário'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Senha do usuário'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Mensagem de sucesso'
          },
          token: {
            type: 'string',
            description: 'Token JWT para autenticação'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Mensagem de erro'
          },
          error: {
            type: 'string',
            description: 'Detalhes técnicos do erro'
          }
        }
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Fazer login no sistema',
        description: 'Autentica um usuário e retorna um token JWT',
        tags: ['Autenticação'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              },
              example: {
                email: 'admin@teste.com',
                password: '123456'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse'
                },
                example: {
                  message: "Login realizado com sucesso",
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZjODYyOGMzLWFjNmQtNDYwNi04NmQwLWFlNTIyOTY4ZmZlMCIsImVtYWlsIjoiYWRtaW5AdGVzdGUuY29tIiwicm9sZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE3NjUxMzMyMDYsImV4cCI6MTc2NTE0MDQwNn0.NcKVzOVfq3OUXKY_VRikCV515-bJxS7YcWcXQQZxivo"
                }
              }
            }
          },
          '400': {
            description: 'Dados de entrada inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/events': {
      get: {
        summary: 'Listar eventos públicos',
        description: 'Retorna todos os eventos para exibição na landing page',
        tags: ['Eventos'],
        security: [],
        responses: {
          '200': {
            description: 'Lista de eventos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    events: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Event'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Criar novo evento',
        description: 'Cria um novo evento (requer autenticação)',
        tags: ['Eventos'],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateEventRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Evento criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Event'
                }
              }
            }
          },
          '400': {
            description: 'Dados de entrada inválidos'
          },
          '401': {
            description: 'Token não fornecido ou inválido'
          }
        }
      }
    },
    '/events/mine': {
      get: {
        summary: 'Listar meus eventos',
        description: 'Retorna todos os eventos criados pelo usuário autenticado',
        tags: ['Eventos'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Lista de eventos do usuário',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    events: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Event'
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token não fornecido ou inválido'
          }
        }
      }
    },
    '/events/{id}': {
      get: {
        summary: 'Obter evento por ID',
        description: 'Retorna os detalhes de um evento específico',
        tags: ['Eventos'],
        security: [],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'ID único do evento'
          }
        ],
        responses: {
          '200': {
            description: 'Detalhes do evento',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Event'
                }
              }
            }
          },
          '404': {
            description: 'Evento não encontrado'
          }
        }
      },
      put: {
        summary: 'Atualizar evento',
        description: 'Atualiza um evento existente (apenas o criador pode editar)',
        tags: ['Eventos'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'ID único do evento'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateEventRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Evento atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Event'
                }
              }
            }
          },
          '401': {
            description: 'Token não fornecido ou inválido'
          },
          '403': {
            description: 'Sem permissão para editar este evento'
          },
          '404': {
            description: 'Evento não encontrado'
          }
        }
      },
      delete: {
        summary: 'Excluir evento',
        description: 'Exclui um evento (apenas o criador pode excluir)',
        tags: ['Eventos'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'ID único do evento'
          }
        ],
        responses: {
          '200': {
            description: 'Evento excluído com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Evento excluído com sucesso'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token não fornecido ou inválido'
          },
          '403': {
            description: 'Sem permissão para excluir este evento'
          },
          '404': {
            description: 'Evento não encontrado'
          }
        }
      }
    },
    '/admin/events': {
      get: {
        summary: 'Listar todos os eventos (Admin)',
        description: 'Retorna todos os eventos do sistema (apenas administradores)',
        tags: ['Administração'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Lista completa de eventos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Event'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token não fornecido ou inválido'
          },
          '403': {
            description: 'Acesso negado - apenas administradores'
          }
        }
      }
    },
    '/admin/users': {
      get: {
        summary: 'Listar todos os usuários (Admin)',
        description: 'Retorna todos os usuários do sistema (apenas administradores)',
        tags: ['Administração'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Lista completa de usuários',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token não fornecido ou inválido'
          },
          '403': {
            description: 'Acesso negado - apenas administradores'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Autenticação',
      description: 'Endpoints para autenticação de usuários'
    },
    {
      name: 'Eventos',
      description: 'Endpoints para gerenciamento de eventos'
    },
    {
      name: 'Administração',
      description: 'Endpoints exclusivos para administradores'
    }
  ]
};

export const setupSwagger = (app: Express): void => {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDefinition, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c5530; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
      .swagger-ui .auth-wrapper { background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      .swagger-ui .authorization__btn { background: #28a745 !important; }
    `,
    customSiteTitle: 'Conecta Amazônia API',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'list',
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      layout: 'StandaloneLayout'
    }
  }));
  
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDefinition);
  });
};