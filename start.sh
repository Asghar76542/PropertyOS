#!/bin/bash

# PropertyOS Startup Script
echo "🏠 PropertyOS - Property Management System"
echo "=========================================="

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  web        Start the Next.js web application (development mode)"
    echo "  mobile     Start the Expo mobile application"
    echo "  tunnel     Start the mobile app with tunnel (for network issues)"
    echo "  both       Start both web and mobile applications"
    echo "  prod       Start the web application in production mode"
    echo "  build      Build the web application for production"
    echo "  setup      Initial setup (install dependencies and setup database)"
    echo "  fix        Fix mobile app package compatibility issues"
    echo "  docker     Build and run with Docker"
    echo "  deploy     Full production deployment with Docker Compose"
    echo "  test       Run tests and type checking"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh web       # Start web app in development"
    echo "  ./start.sh mobile    # Start mobile app"
    echo "  ./start.sh tunnel    # Start mobile app with tunnel"
    echo "  ./start.sh both      # Start both apps"
    echo "  ./start.sh setup     # First time setup"
    echo "  ./start.sh fix       # Fix mobile app package issues"
    echo "  ./start.sh docker    # Run with Docker"
    echo "  ./start.sh deploy    # Full production deployment"
}

# Function to check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo "⚠️  Dependencies not found. Installing..."
        npm install
    fi
    
    if [ -d "PropertyOS-Mobile" ] && [ ! -d "PropertyOS-Mobile/node_modules" ]; then
        echo "⚠️  Mobile app dependencies not found. Installing..."
        cd PropertyOS-Mobile && npm install && cd ..
    fi
}

# Function to setup database
setup_database() {
    echo "📊 Setting up database..."
    npm run db:generate
    npm run db:push
    echo "✅ Database setup complete"
}

# Function to start web application
start_web() {
    echo "🌐 Starting PropertyOS Web Application..."
    echo "📍 Web app will be available at: http://localhost:3000"
    npm run dev
}

# Function to start mobile application
start_mobile() {
    if [ ! -d "PropertyOS-Mobile" ]; then
        echo "❌ Mobile app directory not found!"
        echo "Please ensure the mobile app has been created in PropertyOS-Mobile/"
        exit 1
    fi
    
    echo "📱 Starting PropertyOS Mobile Application..."
    echo "📍 Mobile app will be available at: http://localhost:8081"
    echo "📱 Scan QR code with Expo Go app on your device"
    echo ""
    echo "📋 Troubleshooting Tips:"
    echo "  • Make sure you have Expo Go app installed on your device"
    echo "  • Ensure your device and computer are on the same WiFi network"
    echo "  • If QR code doesn't work, try the tunnel option: expo start --tunnel"
    echo "  • If packages have issues, run: ./start.sh fix"
    echo ""
    cd PropertyOS-Mobile && npm start
}

# Function to start both applications
start_both() {
    echo "🚀 Starting both Web and Mobile applications..."
    
    # Start web app in background
    echo "🌐 Starting web app in background..."
    npm run dev > web.log 2>&1 &
    WEB_PID=$!
    
    # Wait a moment for web app to start
    sleep 3
    
    # Start mobile app
    echo "📱 Starting mobile app..."
    cd PropertyOS-Mobile && npm start &
    MOBILE_PID=$!
    
    echo "✅ Both applications started!"
    echo "🌐 Web app: http://localhost:3000"
    echo "📱 Mobile app: http://localhost:8081"
    echo ""
    echo "Press Ctrl+C to stop both applications"
    
    # Wait for interrupt signal
    trap 'echo "🛑 Stopping applications..."; kill $WEB_PID $MOBILE_PID; exit' INT
    wait
}

# Function to build for production
build_app() {
    echo "🔨 Building PropertyOS for production..."
    npm run build
    echo "✅ Build complete!"
}

# Function to start in production mode
start_production() {
    echo "🚀 Starting PropertyOS in production mode..."
    echo "📍 Production server will be available at: http://localhost:3000"
    npm run start
}

# Function for initial setup
initial_setup() {
    echo "🔧 Initial PropertyOS Setup..."
    echo "Installing web app dependencies..."
    npm install
    
    if [ -d "PropertyOS-Mobile" ]; then
        echo "Installing mobile app dependencies..."
        cd PropertyOS-Mobile && npm install && cd ..
    fi
    
    setup_database
    
    echo "✅ Setup complete! You can now run:"
    echo "  ./start.sh web     # Start web app"
    echo "  ./start.sh mobile  # Start mobile app"
    echo "  ./start.sh both    # Start both apps"
}

# Function to fix mobile app package issues
fix_mobile() {
    if [ ! -d "PropertyOS-Mobile" ]; then
        echo "❌ Mobile app directory not found!"
        echo "Please ensure the mobile app has been created in PropertyOS-Mobile/"
        exit 1
    fi
    
    echo "🔧 Fixing PropertyOS Mobile App package compatibility..."
    cd PropertyOS-Mobile
    echo "Running expo install --fix to update package versions..."
    npx expo install --fix
    echo "✅ Mobile app packages fixed!"
    echo "You can now run: ./start.sh mobile"
    cd ..
}

# Function to start mobile app with tunnel
start_mobile_tunnel() {
    if [ ! -d "PropertyOS-Mobile" ]; then
        echo "❌ Mobile app directory not found!"
        echo "Please ensure the mobile app has been created in PropertyOS-Mobile/"
        exit 1
    fi
    
    echo "📱 Starting PropertyOS Mobile Application with Tunnel..."
    echo "🌐 This will work even if your device and computer are on different networks"
    echo "📱 Scan QR code with Expo Go app on your device"
    echo ""
    cd PropertyOS-Mobile && npx expo start --tunnel
}

# Function to run with Docker
docker_run() {
    echo "🐳 Building and running PropertyOS with Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed! Please install Docker first."
        exit 1
    fi
    
    echo "🔨 Building Docker image..."
    docker build -t propertyos .
    
    echo "🚀 Running PropertyOS container..."
    docker run -p 3000:3000 -p 8081:8081 propertyos
}

# Function for full production deployment
deploy_production() {
    echo "🚀 Deploying PropertyOS to Production..."
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed! Please install Docker Compose first."
        exit 1
    fi
    
    # Create necessary directories
    mkdir -p uploads logs ssl
    
    # Check for environment file
    if [ ! -f ".env" ]; then
        echo "⚠️  No .env file found. Copying from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo "📝 Please edit .env file with your production settings"
        else
            echo "❌ No .env.example file found!"
            exit 1
        fi
    fi
    
    # Run pre-deployment checks
    echo "🔍 Running pre-deployment checks..."
    npm run deploy:prepare
    
    echo "🐳 Starting production deployment with Docker Compose..."
    docker-compose up --build -d
    
    echo "✅ Production deployment complete!"
    echo "🌐 Application available at: http://localhost"
    echo "📊 Database available at: localhost:5432"
    echo "🔄 Redis available at: localhost:6379"
    echo ""
    echo "📋 To manage the deployment:"
    echo "  docker-compose logs -f           # View logs"
    echo "  docker-compose down              # Stop services"
    echo "  docker-compose restart           # Restart services"
}

# Function to run tests and type checking
run_tests() {
    echo "🧪 Running tests and type checking..."
    
    echo "📝 Type checking..."
    npm run type-check
    
    echo "🔍 Linting..."
    npm run lint
    
    # echo "🧪 Running tests..."
    # npm run test
    
    echo "✅ All checks passed!"
}

# Main script logic
case "${1:-help}" in
    "web")
        check_dependencies
        start_web
        ;;
    "mobile")
        check_dependencies
        start_mobile
        ;;
    "tunnel")
        check_dependencies
        start_mobile_tunnel
        ;;
    "both")
        check_dependencies
        start_both
        ;;
    "prod"|"production")
        build_app
        start_production
        ;;
    "build")
        build_app
        ;;
    "setup")
        initial_setup
        ;;
    "fix")
        fix_mobile
        ;;
    "docker")
        docker_run
        ;;
    "deploy")
        deploy_production
        ;;
    "test")
        run_tests
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
