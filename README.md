# Ponderada Backend Infra

## Contexto

Este projeto implementa um backend de telemetria com arquitetura desacoplada. O sistema recebe dados de sensores distribuídos em diferentes ambientes e os processa de forma assíncrona, garantindo escalabilidade e resiliência.

## Por que TypeScript?

O enunciado pedia o backend em GoLang, porém optei por TypeScript pelos seguintes motivos:

- **Familiaridade**: maior domínio da linguagem, permitindo foco na arquitetura ao invés da sintaxe
- **Ecossistema**: npm possui bibliotecas maduras para RabbitMQ (`amqplib`) e PostgreSQL (`pg`)
- **Tipagem estática**: TypeScript adiciona segurança de tipos ao JavaScript, prevenindo erros em tempo de compilação
- **Produtividade**: ferramentas como `ts-node-dev` aceleram o ciclo de desenvolvimento

## Arquitetura
```
[Dispositivos] → POST /telemetry → [Backend] → [RabbitMQ] → [Middleware] → [PostgreSQL]
```

O processamento é **assíncrono e desacoplado**:
- O backend recebe a requisição e publica na fila imediatamente
- O middleware consome a fila e persiste no banco de forma independente
- Isso evita gargalos e garante que nenhum dado seja perdido em picos de carga

## Serviços

| Serviço | Tecnologia | Responsabilidade | Porta |
|---------|-----------|-----------------|-------|
| backend | Node.js + TypeScript | Recebe requisições POST e publica no RabbitMQ | 3000 |
| rabbitmq | RabbitMQ 3 | Broker de mensageria — fila `telemetry` | 5672 / 15672 |
| postgres | PostgreSQL 16 | Persistência dos dados de telemetria | 5432 |
| middleware | Node.js + TypeScript | Consome a fila e insere no banco | - |

## Estrutura do Projeto
```
ponderada_backinfra/
├── README.md
├── compose.yml              # Orquestração dos containers
├── backend/                 # API REST
│   ├── src/
│   │   ├── server.ts        # Endpoint POST /telemetry
│   │   ├── publisher.ts     # Publica mensagens no RabbitMQ
│   │   └── index.ts         # Ponto de entrada
│   ├── testes/
│   │   └── server.test.ts   # Testes unitários do backend
│   └── Dockerfile
├── middleware/              # Consumer da fila
│   ├── src/
│   │   ├── consumer.ts      # Consome mensagens do RabbitMQ
│   │   ├── db.ts            # Conexão e inserção no PostgreSQL
│   │   └── index.ts         # Ponto de entrada
│   ├── testes/
│   │   ├── consumer.test.ts # Testes unitários do consumer
│   │   └── db.test.ts       # Testes unitários do banco
│   └── Dockerfile
├── db/                      # Configuração do PostgreSQL
│   ├── Dockerfile
│   └── init.sql             # Script de criação da tabela
├── rabbitmq/                # Configuração do RabbitMQ
│   └── rabbitmq.conf
└── loadtest/                # Testes de carga
    ├── load-test.js         # Script k6
    └── resultado.txt        # Output do teste
    
```

## Decisões de Projeto

### Mensageria com RabbitMQ
O RabbitMQ foi escolhido como broker de mensageria por ser amplamente adotado, ter suporte nativo a filas duráveis e oferecer um painel de gerenciamento visual. A fila `telemetry` é configurada como `durable: true` e as mensagens como `persistent: true`, garantindo que nenhuma mensagem seja perdida mesmo em caso de reinicialização do broker.

### Banco de dados PostgreSQL
O PostgreSQL foi escolhido por ser um banco relacional robusto, com suporte a tipos de dados como `TIMESTAMPTZ` e `NUMERIC`, adequados para dados de telemetria. O modelo foi projetado para suportar diferentes tipos de sensores (`sensor_type`) e naturezas de leitura (`reading_type`: analógica ou discreta).

### Separação backend/middleware
O backend e o middleware são serviços independentes. O backend só conhece o RabbitMQ, o middleware só conhece o RabbitMQ e o PostgreSQL. Isso permite escalar cada serviço de forma independente.

### Inicialização do banco
A tabela `telemetry` é criada via `init.sql` na pasta `db/`, executado automaticamente pelo PostgreSQL na primeira inicialização. Isso garante que a tabela exista antes de qualquer serviço tentar usá-la.

### Limites de recursos
Todos os containers têm limites de CPU (0.5) e memória (256MB) definidos no `compose.yml`. Isso garante reprodutibilidade nos testes de carga, já que o ambiente sempre tem os mesmos recursos disponíveis.

### Healthcheck
O RabbitMQ possui um healthcheck configurado (`rabbitmq-diagnostics ping`). O backend e o middleware só sobem após o RabbitMQ estar saudável, evitando erros de conexão durante a inicialização.

## Modelo de Dados
```sql
CREATE TABLE telemetry (
    id          SERIAL PRIMARY KEY,
    device_id   VARCHAR(255) NOT NULL,
    timestamp   TIMESTAMPTZ NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    reading_type VARCHAR(50) NOT NULL,
    value       NUMERIC NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## Pré-requisitos

- Docker Desktop
- Node.js 20+
- k6 (para testes de carga)

## Como executar
```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd ponderada_backinfra

# 2. Subir os containers
docker compose up --build

# 3. Verificar os serviços
# Backend: http://localhost:3000
# RabbitMQ Management: http://localhost:15672 (admin/admin)
```

## Endpoint

### POST /telemetry

**Body:**
```json
{
  "device_id": "sensor-01",
  "timestamp": "2026-03-23T10:00:00Z",
  "sensor_type": "temperature",
  "reading_type": "analog",
  "value": 23.5
}
```

**Resposta:**
```json
{
  "message": "Dados recebidos com sucesso!"
}
```

## Testes Unitários
```bash
# Backend
cd backend
npm test

# Middleware
cd middleware
npm test
```

## Teste de Carga
```bash
k6 run loadtest/load-test.js
```

## Resultados do Teste de Carga

| Métrica | Valor |
|---------|-------|
| Total de requisições | 2399 |
| Throughput | 19.88 req/s |
| Taxa de erro | 0.00% |
| Latência média | 130.46ms |
| Latência p(95) | 244.8ms |
| Checks aprovados | 100% |

Consulte a análise completa em `loadtest/relatorio.md`.