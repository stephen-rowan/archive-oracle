#!/bin/bash

# Script to export Supabase database schema using Supabase CLI
# This is the recommended method as it handles authentication automatically

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Exporting Supabase database schema using Supabase CLI...${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    exit 1
fi

OUTPUT_FILE="${1:-schema.sql}"
PROJECT_REF="${2}"
PASSWORD="${3}"

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}Project not linked. Linking now...${NC}"
    
    if [ -z "$PROJECT_REF" ]; then
        echo -e "${RED}Error: Project reference required${NC}"
        echo ""
        echo "Usage: $0 [output_file] [project_ref] [password]"
        echo ""
        echo "Example:"
        echo "  $0 schema.sql sgaaxfiuxtahachjgjrw your_password"
        echo ""
        echo "Or link manually first:"
        echo "  supabase login"
        echo "  supabase link --project-ref [PROJECT_REF] --password [PASSWORD]"
        echo "  supabase db dump -f schema.sql"
        exit 1
    fi
    
    if [ -z "$PASSWORD" ]; then
        echo -e "${RED}Error: Database password required${NC}"
        echo ""
        echo "Usage: $0 [output_file] [project_ref] [password]"
        exit 1
    fi
    
    # Check if logged in
    if ! supabase projects list &>/dev/null; then
        echo -e "${YELLOW}Not logged in. Please login to Supabase...${NC}"
        echo "This will open your browser for authentication."
        supabase login
    fi
    
    echo -e "${GREEN}Linking project ${PROJECT_REF}...${NC}"
    supabase link --project-ref "$PROJECT_REF" --password "$PASSWORD"
fi

echo -e "${GREEN}Exporting schema to ${OUTPUT_FILE}...${NC}"
echo -e "${BLUE}Note: Supabase CLI exports schema by default (no data)${NC}"

# Export schema (schema-only is the default behavior)
if supabase db dump -f "$OUTPUT_FILE"; then
    echo -e "${GREEN}✓ Schema exported successfully to ${OUTPUT_FILE}${NC}"
    echo ""
    echo "File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo "Lines: $(wc -l < "$OUTPUT_FILE")"
else
    EXIT_CODE=$?
    echo -e "${RED}✗ Export failed (exit code: $EXIT_CODE)${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Verify you're logged in: supabase login"
    echo "2. Verify project is linked: supabase link --project-ref [PROJECT_REF]"
    echo "3. Check project reference is correct"
    echo "4. Verify database password is correct"
    exit $EXIT_CODE
fi

