#!/bin/bash

###############################################################################
# E2E Type Check Script
#
# This script performs comprehensive type checking on E2E tests with strict
# TypeScript enforcement. It's designed to run in CI/CD pipelines and locally.
#
# Usage:
#   ./scripts/e2e-type-check.sh [--fix] [--verbose]
#
# Options:
#   --fix      Attempt to auto-fix issues
#   --verbose  Show detailed output
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
FIX_MODE=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --fix)
      FIX_MODE=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Function to print section header
print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

# Function to print success
print_success() {
  echo -e "${GREEN} $1${NC}"
}

# Function to print error
print_error() {
  echo -e "${RED}L $1${NC}"
}

# Function to print warning
print_warning() {
  echo -e "${YELLOW}   $1${NC}"
}

# Function to print info
print_info() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}9  $1${NC}"
  fi
}

# Track overall status
OVERALL_STATUS=0

###############################################################################
# 1. Check Dependencies
###############################################################################

print_header "Checking Dependencies"

if ! command -v npm &> /dev/null; then
  print_error "npm is not installed"
  exit 1
fi
print_success "npm is installed"

if ! command -v npx &> /dev/null; then
  print_error "npx is not installed"
  exit 1
fi
print_success "npx is installed"

if [ ! -f "node_modules/.bin/tsc" ]; then
  print_warning "TypeScript not found in node_modules, installing..."
  npm install
fi
print_success "TypeScript compiler is available"

###############################################################################
# 2. Type Check E2E Tests
###############################################################################

print_header "Type Checking E2E Tests"

print_info "Running: npx tsc --project e2e-tests/tsconfig.json --noEmit"

if npx tsc --project e2e-tests/tsconfig.json --noEmit; then
  print_success "E2E tests type check passed"
else
  print_error "E2E tests type check failed"
  OVERALL_STATUS=1

  if [ "$FIX_MODE" = true ]; then
    print_warning "Fix mode enabled, but TypeScript errors require manual fixing"
    print_info "Common fixes:"
    print_info "  1. Add explicit types to function parameters"
    print_info "  2. Add return types to functions"
    print_info "  3. Handle null/undefined cases explicitly"
    print_info "  4. Remove unused variables"
  fi
fi

###############################################################################
# 3. Check Test File Organization
###############################################################################

print_header "Checking Test File Organization"

# Check if page-objects directory exists
if [ ! -d "e2e-tests/page-objects" ]; then
  print_error "page-objects directory not found"
  OVERALL_STATUS=1
else
  print_success "page-objects directory exists"

  # Count page objects
  POM_COUNT=$(find e2e-tests/page-objects -name "*.ts" 2>/dev/null | wc -l)
  print_info "Found $POM_COUNT page object(s)"
fi

# Check if utils directory exists
if [ ! -d "e2e-tests/utils" ]; then
  print_error "utils directory not found"
  OVERALL_STATUS=1
else
  print_success "utils directory exists"
fi

# Check if test files exist
TEST_COUNT=$(find e2e-tests -name "*.spec.ts" 2>/dev/null | wc -l)
if [ "$TEST_COUNT" -eq 0 ]; then
  print_warning "No test files (*.spec.ts) found"
else
  print_success "Found $TEST_COUNT test file(s)"
fi

###############################################################################
# 4. Validate TypeScript Configuration
###############################################################################

print_header "Validating TypeScript Configuration"

if [ ! -f "e2e-tests/tsconfig.json" ]; then
  print_error "e2e-tests/tsconfig.json not found"
  OVERALL_STATUS=1
else
  print_success "e2e-tests/tsconfig.json exists"

  # Check for strict mode
  if grep -q '"strict": true' e2e-tests/tsconfig.json; then
    print_success "Strict mode is enabled"
  else
    print_error "Strict mode is not enabled"
    OVERALL_STATUS=1
  fi

  # Check for noImplicitAny
  if grep -q '"noImplicitAny": true' e2e-tests/tsconfig.json; then
    print_success "noImplicitAny is enabled"
  else
    print_warning "noImplicitAny is not explicitly enabled"
  fi

  # Check for strictNullChecks
  if grep -q '"strictNullChecks": true' e2e-tests/tsconfig.json; then
    print_success "strictNullChecks is enabled"
  else
    print_warning "strictNullChecks is not explicitly enabled"
  fi
fi

###############################################################################
# 5. ESLint Check (if available)
###############################################################################

print_header "Running ESLint on E2E Tests"

if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
  print_info "Running: npx eslint e2e-tests/**/*.ts"

  if npx eslint "e2e-tests/**/*.ts" --max-warnings=0; then
    print_success "ESLint check passed"
  else
    print_error "ESLint check failed"
    OVERALL_STATUS=1

    if [ "$FIX_MODE" = true ]; then
      print_info "Attempting to auto-fix ESLint issues..."
      npx eslint "e2e-tests/**/*.ts" --fix
      print_success "Auto-fix completed"
    fi
  fi
else
  print_warning "ESLint configuration not found, skipping"
fi

###############################################################################
# 6. Prettier Check (if available)
###############################################################################

print_header "Checking Code Formatting"

if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ]; then
  print_info "Running: npx prettier --check e2e-tests/**/*.ts"

  if npx prettier --check "e2e-tests/**/*.ts"; then
    print_success "Formatting check passed"
  else
    print_error "Formatting check failed"
    OVERALL_STATUS=1

    if [ "$FIX_MODE" = true ]; then
      print_info "Attempting to auto-format files..."
      npx prettier --write "e2e-tests/**/*.ts"
      print_success "Auto-formatting completed"
    fi
  fi
else
  print_warning "Prettier configuration not found, skipping"
fi

###############################################################################
# 7. Check for Common Issues
###############################################################################

print_header "Checking for Common Issues"

# Check for 'any' type usage
ANY_COUNT=$(grep -r ": any" e2e-tests --include="*.ts" 2>/dev/null | wc -l)
if [ "$ANY_COUNT" -gt 0 ]; then
  print_warning "Found $ANY_COUNT usage(s) of 'any' type"
  if [ "$VERBOSE" = true ]; then
    grep -rn ": any" e2e-tests --include="*.ts" 2>/dev/null | head -5
  fi
else
  print_success "No 'any' type usage found"
fi

# Check for console.log (should use proper logging)
CONSOLE_COUNT=$(grep -r "console\.log" e2e-tests --include="*.ts" 2>/dev/null | wc -l)
if [ "$CONSOLE_COUNT" -gt 0 ]; then
  print_warning "Found $CONSOLE_COUNT console.log statement(s)"
  print_info "Consider using proper logging or removing debug statements"
else
  print_success "No console.log statements found"
fi

# Check for @ts-ignore or @ts-expect-error
TS_IGNORE_COUNT=$(grep -r "@ts-ignore\|@ts-expect-error" e2e-tests --include="*.ts" 2>/dev/null | wc -l)
if [ "$TS_IGNORE_COUNT" -gt 0 ]; then
  print_warning "Found $TS_IGNORE_COUNT TypeScript suppression comment(s)"
  if [ "$VERBOSE" = true ]; then
    grep -rn "@ts-ignore\|@ts-expect-error" e2e-tests --include="*.ts" 2>/dev/null
  fi
else
  print_success "No TypeScript suppression comments found"
fi

###############################################################################
# 8. Generate Report
###############################################################################

print_header "Summary"

if [ $OVERALL_STATUS -eq 0 ]; then
  print_success "All checks passed! ("
  echo ""
  echo -e "${GREEN}Your E2E tests are type-safe and ready for CI/CD${NC}"
else
  print_error "Some checks failed"
  echo ""
  echo -e "${RED}Please fix the issues above before committing${NC}"

  if [ "$FIX_MODE" = false ]; then
    echo ""
    echo -e "${YELLOW}Tip: Run with --fix to auto-fix some issues${NC}"
  fi
fi

echo ""
echo -e "${BLUE}Test Files:${NC} $TEST_COUNT"
echo -e "${BLUE}Page Objects:${NC} $POM_COUNT"
echo ""

exit $OVERALL_STATUS
