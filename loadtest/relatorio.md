# Relatório de Teste de Carga — k6

## Configuração do Teste

| Parâmetro | Valor |
|-----------|-------|
| Ferramenta | k6 |
| Duração total | 2 minutos |
| Máximo de usuários simultâneos | 50 VUs |
| Endpoint testado | POST /telemetry |

### Stages
| Estágio | Duração | Usuários |
|---------|---------|----------|
| Ramp up | 30s | 0 → 10 |
| Pico | 1min | 10 → 50 |
| Ramp down | 30s | 50 → 0 |

---
## Arquitetura do Sistema

O sistema foi projetado seguindo uma arquitetura assíncrona baseada em mensageria:

`Dispositivos → Backend → RabbitMQ → Middleware → PostgreSQL`

- O backend recebe as requisições HTTP e publica os dados na fila
- O RabbitMQ atua como intermediário, absorvendo picos de carga
- O middleware consome as mensagens e realiza a persistência no banco
- O PostgreSQL armazena os dados de telemetria

Essa abordagem permite desacoplamento entre ingestão e processamento, aumentando a escalabilidade e resiliência do sistema.

---

## Resultados

| Métrica | Valor |
|---------|-------|
| Total de requisições | 2697 |
| Throughput | 22.35 req/s |
| Taxa de erro | 0.00% |
| Latência média | 3.7ms |
| Latência mínima | 0.5ms |
| Latência máxima | 72.3ms |
| Latência p(90) | 6.81ms |
| Latência p(95) | 7.96ms |
| Checks aprovados | 100% (2697/2697) |

---

## Análise dos Resultados

### Throughput
O sistema processou **2697 requisições** em aproximadamente 2 minutos, atingindo um throughput médio de **22.35 requisições por segundo**. O desempenho se manteve estável mesmo com até 50 usuários simultâneos.

### Latência
A latência média foi de aproximadamente **3.7ms**, com p(95) de **7.96ms**, muito abaixo do threshold definido de 500ms.

Essa baixa latência é resultado direto da arquitetura assíncrona. O backend não realiza processamento pesado nem aguarda operações de banco de dados, limitando-se a enfileirar as mensagens no RabbitMQ e responder imediatamente.

Além disso, a reutilização da conexão com o RabbitMQ eliminou o overhead de criação de conexões a cada requisição, reduzindo significativamente o tempo de resposta.

### Taxa de Erro
O sistema apresentou **0% de erros** durante toda a execução do teste, com todas as requisições retornando status 201 com sucesso.

Isso indica alta confiabilidade na comunicação entre os serviços e no processamento das mensagens.

### Capacidade de Enfileiramento
O RabbitMQ se comportou como esperado, absorvendo os picos de carga e permitindo que o middleware processasse as mensagens de forma assíncrona sem sobrecarregar o banco de dados.

---

## Possíveis Gargalos e Melhorias

### Gargalos identificados
- O middleware processa mensagens de forma sequencial (prefetch = 1), o que pode limitar o throughput em cenários de alta carga
- O banco de dados pode se tornar um gargalo com aumento significativo na taxa de ingestão de dados

### Melhorias sugeridas
- **Escalonamento horizontal do middleware** — múltiplos consumidores para aumentar o throughput
- **Ajuste do prefetch** — permitir maior paralelismo no consumo
