#!/bin/bash

# Deployment script for PDF Processing with BioBERT and PostgreSQL
# This script sets up the database and Python service

set -e  # Exit on error

echo "========================================"
echo "Medical Device PDF Processing Deployment"
echo "========================================"
echo ""

# Check if running as root for PostgreSQL installation
if [ "$EUID" -eq 0 ]; then 
   echo "Please do not run as root. Run as regular user."
   exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed.${NC}"
    echo "Please install PostgreSQL 14+ first:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install postgresql-14 postgresql-contrib"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is installed${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed.${NC}"
    echo "Please install Python 3.8+ first:"
    echo "  sudo apt-get install python3 python3-pip"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 is installed${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed.${NC}"
    echo "Please install Node.js 20+ first"
    exit 1
fi
echo -e "${GREEN}✓ Node.js is installed${NC}"

echo ""

# Step 2: Install pgvector extension
echo -e "${YELLOW}Step 2: Installing pgvector extension...${NC}"
if [ ! -d "/tmp/pgvector" ]; then
    cd /tmp
    git clone https://github.com/pgvector/pgvector.git
    cd pgvector
    make
    sudo make install
    echo -e "${GREEN}✓ pgvector installed${NC}"
else
    echo -e "${GREEN}✓ pgvector already downloaded${NC}"
fi

echo ""

# Step 3: Create database
echo -e "${YELLOW}Step 3: Setting up PostgreSQL database...${NC}"

# Get database credentials
read -p "PostgreSQL username [postgres]: " PG_USER
PG_USER=${PG_USER:-postgres}

read -p "Database name [medicus]: " PG_DB
PG_DB=${PG_DB:-medicus}

echo "Creating database '$PG_DB'..."
sudo -u postgres psql -c "CREATE DATABASE $PG_DB;" 2>/dev/null || echo "Database may already exist"

echo "Applying schema..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sudo -u postgres psql -d $PG_DB -f "$SCRIPT_DIR/src/backend/src/db/schema.sql"

echo -e "${GREEN}✓ Database setup complete${NC}"
echo ""

# Step 4: Set up Python service
echo -e "${YELLOW}Step 4: Setting up Python PDF processing service...${NC}"

cd "$SCRIPT_DIR/python-service"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies (this may take several minutes)..."
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✓ Python service setup complete${NC}"
echo ""

# Step 5: Create environment file
echo -e "${YELLOW}Step 5: Configuring environment variables...${NC}"

cd "$SCRIPT_DIR"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file from template"
    
    # Update .env with database credentials
    sed -i "s/POSTGRES_USER=postgres/POSTGRES_USER=$PG_USER/" .env
    sed -i "s/POSTGRES_DB=medicus/POSTGRES_DB=$PG_DB/" .env
    
    read -s -p "Enter PostgreSQL password: " PG_PASSWORD
    echo ""
    sed -i "s/POSTGRES_PASSWORD=your_password_here/POSTGRES_PASSWORD=$PG_PASSWORD/" .env
    
    read -p "Enter OpenAI API key: " OPENAI_KEY
    sed -i "s/OPENAI_API_KEY=your_openai_api_key_here/OPENAI_API_KEY=$OPENAI_KEY/" .env
    
    echo -e "${GREEN}✓ Environment variables configured${NC}"
else
    echo -e "${YELLOW}! .env file already exists, skipping${NC}"
fi

echo ""

# Step 6: Install Node dependencies
echo -e "${YELLOW}Step 6: Installing Node.js dependencies...${NC}"

npm install
cd src/backend
npm install
cd ../..

echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
echo ""

# Step 7: Provide service start instructions
echo -e "${GREEN}========================================"
echo "Deployment Complete!"
echo "========================================${NC}"
echo ""
echo "To start the services:"
echo ""
echo -e "${YELLOW}1. Start Python PDF processing service:${NC}"
echo "   cd python-service"
echo "   source venv/bin/activate"
echo "   python app.py"
echo "   (Service will run on http://localhost:5000)"
echo ""
echo -e "${YELLOW}2. Start the application (in a new terminal):${NC}"
echo "   npm run dev"
echo "   (Frontend: http://localhost:3000)"
echo "   (Backend: http://localhost:4111)"
echo ""
echo -e "${GREEN}✓ All services configured and ready to start!${NC}"
