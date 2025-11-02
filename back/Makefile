.PHONY: help db-start db-stop db-status run run-jar build clean dev stop

# Default target
help:
	@echo "Available targets:"
	@echo "  help      - Show this help"
	@echo "  db-start  - Start PostgreSQL database (Docker)"
	@echo "  db-stop   - Stop PostgreSQL database"
	@echo "  db-status - Check database status"
	@echo "  build     - Build JAR (skip tests)"
	@echo "  run       - Start database and run app with dockerdb profile"
	@echo "  run-jar   - Build and run JAR with dockerdb profile"
	@echo "  dev       - Alias for 'run'"
	@echo "  clean     - Clean Maven target directory"
	@echo "  stop      - Stop database and any running app"

# Database management
db-start:
	@echo "Starting PostgreSQL database..."
	docker compose up -d
	@sleep 3
	@echo "Database started. Check status with 'make db-status'"

db-stop:
	@echo "Stopping PostgreSQL database..."
	docker compose down

db-status:
	@echo "Database container status:"
	@docker ps --filter name=ged-postgres --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || echo "No containers running"

# Application management
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH:=$(JAVA_HOME)/bin:$(PATH)

build:
	@echo "Building application JAR..."
	mvn -DskipTests clean package

run: db-start
	@echo "Starting application with dockerdb profile..."
	@sleep 2
	mvn -Dspring-boot.run.profiles=dockerdb -DskipTests spring-boot:run

run-jar: db-start build
	@echo "Running JAR with dockerdb profile..."
	@sleep 2
	java -jar target/ged-0.0.1-SNAPSHOT.jar --spring.profiles.active=dockerdb

dev: run

clean:
	@echo "Cleaning Maven target directory..."
	mvn clean

stop: db-stop
	@echo "Services stopped"
	@pkill -f "ged-0.0.1-SNAPSHOT.jar" || true
	@pkill -f "spring-boot:run" || true