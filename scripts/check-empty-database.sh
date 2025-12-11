#!/bin/bash
# Check if Supabase database tables are empty

echo "🔍 Checking if database tables are empty..."
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js not found. Please install it first."
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Check if inspect script exists
if [ ! -f "scripts/inspect-supabase-data.js" ]; then
    echo "❌ ERROR: inspect-supabase-data.js not found"
    exit 1
fi

# Get row counts for the main tables
echo "Row counts for main tables:"
echo ""

REQUIRED_TABLES=("workgroups" "meetingsummaries" "names" "tags")
HAS_DATA=false
ALL_EMPTY=true

for table in "${REQUIRED_TABLES[@]}"; do
    # Use the inspect script to get count
    COUNT=$(node scripts/inspect-supabase-data.js 2>/dev/null | grep -E "^\s*${table}\s+" | awk '{print $2}')
    
    if [ -n "$COUNT" ] && [ "$COUNT" != "0" ]; then
        echo "  ❌ $table: $COUNT row(s) - HAS DATA"
        HAS_DATA=true
        ALL_EMPTY=false
    elif [ -n "$COUNT" ]; then
        echo "  ✅ $table: $COUNT row(s) - empty"
    else
        echo "  ⚠️  $table: Unable to get count"
    fi
done

echo ""

# Summary
if [ "$ALL_EMPTY" = true ] && [ "$HAS_DATA" = false ]; then
    echo "✅ All tables are empty - database has no data"
    exit 0
elif [ "$HAS_DATA" = true ]; then
    echo "⚠️  WARNING: Some tables contain data"
    echo ""
    echo "To see all tables and their counts:"
    echo "  node scripts/inspect-supabase-data.js"
    exit 1
else
    echo "⚠️  Could not verify all tables"
    exit 1
fi
