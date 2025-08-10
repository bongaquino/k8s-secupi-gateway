<<<<<<< HEAD
# Bong Aquino Chat Service

Bong Aquino Chat Service is a backend application designed to handle user authentication, chat functionalities, and profile management. It uses MongoDB for data storage, Redis for caching, and integrates with OpenAI for chat responses.
=======
# bongaquino MVP Server

bongaquino MVP Server is a backend application designed to handle user authentication, chat functionalities, and profile management. It uses MongoDB for data storage, Redis for caching, and integrates with OpenAI for chat responses.
>>>>>>> cf0aa0cf11519393076a3c3392daf57b45dae265

## Features
- User registration and authentication
- Profile management
- Chat functionality with OpenAI integration
- Token-based authentication

## Prerequisites
Ensure you have the following installed on your system:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Setting Up the Local Environment

### 1. Clone the Repository
```bash
git clone <repository-url>
<<<<<<< HEAD
cd bongaquino-chat-service
=======
cd bongaquino-mvp-server
>>>>>>> cf0aa0cf11519393076a3c3392daf57b45dae265
```

### 2. Configure Environment Variables
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the `.env` file with your desired configuration values.

### 3. Start the Services
Use Docker Compose to start all services:
```bash
docker compose up -d
```

This will start the following services:
- **MongoDB**: Database service on port `27017`
- **Mongo Express**: MongoDB web interface on port `8081`
- **Redis**: Caching service on port `6379`
- **Redis Commander**: Redis web interface on port `8082`
- **API Server**: FastAPI application on port `8080`

### 4. Access the Application
- **API Server**: [http://localhost:8080](http://localhost:8080)
- **Mongo Express**: [http://localhost:8081](http://localhost:8081)
- **Redis Commander**: [http://localhost:8082](http://localhost:8082)

## Stopping the Services
To stop all running services:
```bash
docker compose down
```

## Rebuilding the Services
If you make changes to the code or configuration, rebuild the services:
```bash
docker compose down -v
docker compose up -d --build
```

## Logs
To view logs for the API server:
```bash
docker logs api-server
```

## Additional Notes
- Ensure the `.env` file is properly configured before starting the services.
- Use the provided `scripts` folder for additional Docker management commands like `start.sh`, `stop.sh`, and `restart.sh`.

## Virtual Environment
```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment (Linux/macOS)
source venv/bin/activate

# Activate the virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Freeze dependencies
pip freeze > requirements.txt

# Deactivate the virtual environment
deactivate
```
