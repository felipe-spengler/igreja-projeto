# Sistema de Mapeamento de Ações da Igreja

## Documentação do Projeto

Este documento contém a explicação base do projeto, o que foi feito até o momento e quais os próximos passos para o desenvolvimento da aplicação.

### 1. Explicação do Projeto
O objetivo principal é desenvolver um sistema web para visualização de ações e atividades de clubes e ministérios da igreja, todas geolocalizadas em um mapa interativo e segmentadas por bairros. Agora com uma arquitetura flexível para suportar múltiplas igrejas, acompanhamento de métricas (dashboard) e gerenciamento de eventos futuros no calendário.

O sistema conta com duas frentes principais:
- **Backend (API RESTful)**: Construída em PHP com o framework Laravel. Responsável pela lógica de negócios conectada a um banco de dados relacional.
- **Frontend (SPA/React)**: Aplicação web em React + Vite e Tailwind CSS, consumindo a API e plotando o sistema de mapas com a biblioteca Leaflet.

### 2. O Que Foi Feito
- Planejamento da arquitetura do sistema com suporte a Multi-Igrejas.
- Estruturação do banco de dados relacional (via Migrations), englobando as entidades principais:
  - `igrejas`: Cadastro das igrejas para o conceito multi-tenant.
  - `bairros`: Suporte a dados espaciais/polígonos via GeoJSON.
  - `clubes`: Tipo de ministério associado a cada igreja.
  - `acoes`: O ponto focal do sistema. Inclui título, descrição, coordenadas espaciais, datas (para calendário e ações programadas/realizadas), número de pessoas atendidas (métricas do dashboard) e fotos do evento.
- Configuração do **Docker Compose** para orquestrar o ambiente inteiro: MySQL persistente, Backend (Apache/PHP 8.2) e Frontend (Vite/Node).
- Inicialização do mapa no React utilizando dados "mockados" para prova de conceito.

### 3. Próximos Passos
1. **Configuração e Subida do Docker:**
   - Construir as imagens através do comando `docker-compose up -d --build` para subir as 3 frentes unidas (mysql, backend e frontend).
   - Testar o comportamento do backend garantindo a geração de chave do sistema, migrações e seeders no banco limpo e acessível na porta 8000.

2. **Criação da Interface Refinada (Frontend):**
   - **Mapa Iterativo:** Interligar efetivamente o Laravel com o React utilizando a lib `axios` recebendo as localizações do backend.
   - **Dashboard de Impacto:** Implementar os gráficos contadores focados na soma de "pessoas\_atendidas" das tabelas.
   - **Calendário:** Integrar um calendário exibindo as `data_inicio` e `data_fim` das ações planejadas.
   - **Detalhamento de Ação:** Exibir fotos, descrição completa, e a situação (Programada/Realizada) com cores na interface baseada em Tailwind.
