# GED APAE - Backend

Sistema de Gerenciamento Eletrônico de Documentos da APAE.

## Desenvolvimento no Codespaces

### Pré-requisitos
- Java 21 (já instalado no devcontainer)
- Docker (disponível no Codespaces)
- Maven (já configurado)

### Comandos Rápidos

#### Usando Make (recomendado)
```bash
# Ver todos os comandos disponíveis
make help

# Iniciar desenvolvimento (sobe DB + aplicação)
make dev

# Apenas subir o banco
make db-start

# Status do banco
make db-status

# Parar tudo
make stop
```

#### Usando VS Code Tasks
1. Abra a paleta de comandos: `Ctrl+Shift+P`
2. Digite "Tasks: Run Task"
3. Escolha uma das opções:
   - **"Run App (dockerdb)"** - Inicia DB e aplicação
   - **"Start Database (Docker)"** - Apenas o banco
   - **"Build JAR"** - Gera o JAR da aplicação
   - **"Run JAR (dockerdb)"** - Roda via JAR

#### Comandos Manuais
```bash
# 1. Subir o banco Postgres
docker compose up -d

# 2. Rodar a aplicação
mvn -Dspring-boot.run.profiles=dockerdb -DskipTests spring-boot:run

# Ou via JAR
mvn -DskipTests package
java -jar target/ged-0.0.1-SNAPSHOT.jar --spring.profiles.active=dockerdb
```

### URLs da Aplicação
- **Base URL**: http://localhost:8080/api
- **API Docs (JSON)**: http://localhost:8080/api/api-docs
- **Swagger UI**: http://localhost:8080/api/swagger-ui/index.html

### Banco de Dados
- **Host**: localhost:5432
- **Database**: ged-app
- **Usuário**: postgres
- **Senha**: Sen@c2023

### Perfis Spring
- **Padrão**: Conecta em localhost:5432 (mesmo que dockerdb)
- **dockerdb**: Explicitamente configurado para Docker Compose local

### Estrutura do Projeto
```
src/
├── main/java/br/apae/ged/
│   ├── application/
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── services/     # Serviços de negócio
│   │   └── exceptions/   # Exceções customizadas
│   ├── domain/
│   │   ├── models/       # Entidades JPA
│   │   └── repositories/ # Repositórios Spring Data
│   └── presentation/
│       └── controllers/  # Controllers REST
└── main/resources/
    ├── application.properties
    └── data.sql         # Dados iniciais
```

### Desenvolvimento
- DDL automático: `hibernate.ddl-auto=update`
- SQL de inicialização: `spring.sql.init.mode=always`
- Logs SQL habilitados para desenvolvimento
