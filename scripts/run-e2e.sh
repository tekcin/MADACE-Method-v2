#!/bin/bash
# MADACE-Method v2.0 E2E Test Runner
# Script to run Playwright tests with proper setup and cleanup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=3000
BASE_URL="http://localhost:${PORT}"
PLAYWRIGHT_REPORT_DIR="playwright-report"
TEST_RESULTS_FILE="test-results.json"

echo -e "${BLUE}🚀 MADACE-Method v2.0 E2E Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if development server is running
check_dev_server() {
    if curl -s --max-time 5 "${BASE_URL}" | grep -q "Ready on"; then
        echo -e "${GREEN}✅ Development server is running on ${BASE_URL}${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Development server is not fully ready on ${BASE_URL}${NC}"
        return 1
    fi
}

# Function to start development server
start_dev_server() {
    echo -e "${BLUE}📦 Starting development server...${NC}"
    
    # Start server in background
    npm run dev > dev-server.log 2>&1 &
    DEV_PID=$!
    
    echo -e "${YELLOW}⏳ Waiting for development server to start (timeout: 60s)...${NC}"
    
    # Wait for server to be ready
    local timeout=60
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if check_dev_server; then
            echo -e "${GREEN}✅ Development server started successfully (PID: ${DEV_PID})${NC}"
            return 0
        fi
        
        sleep 2
        elapsed=$((elapsed + 2))
        echo -ne "\r${YELLOW}⏳ Waiting... ${elapsed}s${NC}"
    done
    
    echo -e "\n${RED}❌ Development server failed to start within ${timeout}s${NC}"
    echo -e "${YELLOW}📄 Check dev-server.log for details${NC}"
    return 1
}

# Function to stop development server
stop_dev_server() {
    if [ ! -z "$DEV_PID" ]; then
        echo -e "${BLUE}🛑 Stopping development server (PID: ${DEV_PID})${NC}"
        kill $DEV_PID 2>/dev/null || true
        wait $DEV_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Development server stopped${NC}"
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    if ! command_exists npm; then
        echo -e "${RED}❌ npm is not installed or not in PATH${NC}"
        exit 1
    fi
    
    npm install
    
    # Install Playwright browsers if not installed
    echo -e "${BLUE}🌐 Installing Playwright browsers...${NC}"
    npx playwright install chromium firefox webkit
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Function to run specific test suite
run_test_suite() {
    local suite_name="$1"
    echo -e "${BLUE}🧪 Running ${suite_name} tests...${NC}"
    
    case "$suite_name" in
        "setup")
            npx playwright test auth-setup.spec.ts --reporter=list
            ;;
        "api")
            npx playwright test api-endpoints.spec.ts --reporter=list
            ;;
        "kanban")
            npx playwright test kanban-board.spec.ts --reporter=list
            ;;
        "performance")
            npx playwright test performance.spec.ts --reporter=list
            ;;
        "accessibility")
            npx playwright test accessibility.spec.ts --reporter=list
            ;;
        "all")
            npx playwright test --reporter=list
            ;;
        *)
            echo -e "${RED}❌ Unknown test suite: ${suite_name}${NC}"
            echo -e "${YELLOW}Available suites: setup, api, kanban, performance, accessibility, all${NC}"
            return 1
            ;;
    esac
}

# Function to show CLI menu
show_menu() {
    echo -e "\n${BLUE}Available options:${NC}"
    echo "1) Run all E2E tests"
    echo "2) Setup flow tests"
    echo "3) API endpoint tests" 
    echo "4) Kanban board tests"
    echo "5) Performance tests"
    echo "6) Accessibility tests"
    echo "7) Interactive UI mode (debug)"
    echo "8) Install dependencies"
    echo "0) Exit"
    echo ""
}

# Function to run Playwright in debug mode
run_debug_mode() {
    echo -e "${BLUE}🔧 Starting Playwright in debug mode...${NC}"
    
    if ! check_dev_server; then
        echo -e "${YELLOW}⚠️  Starting development server first...${NC}"
        start_dev_server || exit 1
    fi
    
    npx playwright test --ui --debug
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}🧹 Cleaning up...${NC}"
    stop_dev_server
    
    # Kill any remaining Node processes that might be hanging
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set up cleanup traps
trap cleanup EXIT INT TERM

# Main execution
main() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Not in MADACE project directory (package.json not found)${NC}"
        echo -e "${YELLOW}Please run this script from the project root${NC}"
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-}" in
        "--install")
            install_dependencies
            exit 0
            ;;
        "--debug")
            run_debug_mode
            exit 0
            ;;
        "--help"|"-h")
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Options:"
            echo "  --install     Install dependencies and Playwright browsers"
            echo "  --debug       Run tests in interactive debug mode"
            echo "  --help        Show this help message"
            echo ""
            echo "If no option is provided, an interactive menu will be shown."
            exit 0
            ;;
    esac
    
    # Check if development server is running, start if needed
    if ! check_dev_server; then
        if start_dev_server; then
            echo -e "${GREEN}✅ Ready to run tests${NC}"
            trap cleanup EXIT
        else
            echo -e "${RED}❌ Cannot start tests without running development server${NC}"
            exit 1
        fi
    fi
    
    # Interactive menu
    while true; do
        show_menu
        read -p "Select an option (0-8): " choice
        
        case $choice in
            1)
                run_test_suite "all"
                ;;
            2)
                run_test_suite "setup"
                ;;
            3)
                run_test_suite "api"
                ;;
            4)
                run_test_suite "kanban"
                ;;
            5)
                run_test_suite "performance"
                ;;
            6)
                run_test_suite "accessibility"
                ;;
            7)
                run_debug_mode
                ;;
            8)
                install_dependencies
                ;;
            0)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                break
                ;;
            *)
                echo -e "${RED}❌ Invalid option. Please try again.${NC}"
                ;;
        esac
        
        # Show results summary if tests were run
        if [ -f "$TEST_RESULTS_FILE" ]; then
            echo -e "\n${BLUE}📊 Test Results Summary:${NC}"
            
            local passed=$(cat "$TEST_RESULTS_FILE" | grep '"status":"passed"' | wc -l || echo "0")
            local failed=$(cat "$TEST_RESULTS_FILE" | grep '"status":"failed"' | wc -l || echo "0")
            local skipped=$(cat "$TEST_RESULTS_FILE" | grep '"status":"skipped"' | wc -l || echo "0")
            local total=$((passed + failed + skipped))
            
            echo -e "  Total: ${total}"
            echo -e "  Passed: ${GREEN}${passed}${NC}"
            echo -e "  Failed: ${RED}${failed}${NC}"
            echo -e "  Skipped: ${YELLOW}${skipped}${NC}"
            
            if [ "$failed" -gt 0 ] && [ -d "$PLAYWRIGHT_REPORT_DIR" ]; then
                echo -e "\n${YELLOW}📄 Detailed report available in: ${PLAYWRIGHT_REPORT_DIR}${NC}"
            fi
        fi
        
        echo -e "\n${BLUE}────────────────────────────────────────${NC}"
    done
}

# Check for Node.js version
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install Node.js 18 or higher${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18 or higher is required (found: $(node -v))${NC}"
    exit 1
fi

# Run main function with all arguments
main "$@"
