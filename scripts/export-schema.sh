#!/bin/bash

# Script to export Supabase database schema
# 
# IMPORTANT: Supabase requires IP allowlisting for direct connections
# 1. Go to Supabase Dashboard > Settings > Database > Network Restrictions
# 2. Add your current IP address to the allowlist
# 3. Use the Session mode connection string (not Transaction mode)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Exporting Supabase database schema...${NC}"

# Check if connection string is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Database connection string required${NC}"
    echo ""
    echo "Usage: $0 'postgresql://user:password@host:port/database' [output_file]"
    echo ""
    echo -e "${BLUE}For Supabase:${NC}"
    echo "1. Get your connection string from Supabase Dashboard:"
    echo "   Settings > Database > Connection String"
    echo "   Use 'Session mode' (not Transaction mode)"
    echo ""
    echo "2. Ensure your IP is allowlisted:"
    echo "   Settings > Database > Network Restrictions"
    echo "   Add your current IP address"
    echo ""
    echo "3. Alternative: Use Supabase CLI"
    echo "   brew install supabase/tap/supabase"
    echo "   supabase db dump --schema-only"
    exit 1
fi

CONNECTION_STRING="$1"
OUTPUT_FILE="${2:-schema.sql}"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump is not installed${NC}"
    echo ""
    echo "Install PostgreSQL client tools:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    exit 1
fi

echo -e "${GREEN}Exporting schema to ${OUTPUT_FILE}...${NC}"

# Export schema only
if pg_dump \
  --dbname "$CONNECTION_STRING" \
  --schema-only \
  --no-owner \
  --no-privileges \
  > "$OUTPUT_FILE" 2>&1; then
    echo -e "${GREEN}✓ Schema exported successfully to ${OUTPUT_FILE}${NC}"
    echo ""
    echo "File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
else
    EXIT_CODE=$?
    echo -e "${RED}✗ Export failed (exit code: $EXIT_CODE)${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo ""
    echo "1. ${BLUE}Check IP Allowlisting:${NC}"
    echo "   - Go to Supabase Dashboard > Settings > Database > Network Restrictions"
    echo "   - Add your current IP: $(curl -s ifconfig.me 2>/dev/null || echo 'Unable to detect')"
    echo "   - Wait a few minutes for changes to propagate"
    echo ""
    echo "2. ${BLUE}Verify Connection String:${NC}"
    echo "   - Use 'Session mode' connection string (not Transaction mode)"
    echo "   - Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
    echo "   - Get it from: Settings > Database > Connection String"
    echo ""
    echo "3. ${BLUE}Try Connection Pooler (port 6543):${NC}"
    echo "   - Replace :5432 with :6543 in your connection string"
    echo "   - This uses Supavisor connection pooler"
    echo ""
    echo "4. ${BLUE}Use Supabase CLI (Recommended):${NC}"
    echo "   brew install supabase/tap/supabase"
    echo "   supabase login"
    echo "   supabase link --project-ref [YOUR_PROJECT_REF] --password [PASSWORD]"
    echo "   supabase db dump -f schema.sql"
    echo "   Note: Supabase CLI dumps schema by default (no --schema-only flag needed)"
    echo ""
    echo "5. ${BLUE}Export via Supabase Dashboard:${NC}"
    echo "   - Go to SQL Editor in Supabase Dashboard"
    echo "   - Run: SELECT pg_get_viewdef('view_name', true); for views"
    echo "   - Or use the Table Editor to view schema structure"
    exit $EXIT_CODE
fi

