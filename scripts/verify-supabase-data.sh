#!/bin/bash
# Verify basic SQL data structure in Supabase test project

echo "🔍 Verifying Supabase database structure..."
echo ""

# Check if Node.js is available (required for Supabase client)
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js not found. Please install it first."
    echo "   Install: brew install node"
    exit 1
fi

# Check if .env.local exists
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  WARNING: .env.local file not found"
    echo "   Some verification steps may be skipped"
    echo ""
fi

# Required tables
REQUIRED_TABLES=("workgroups" "meetingsummaries" "names" "tags")

echo "Checking for required tables..."
echo ""

# Use Node.js script to check tables (more reliable than CLI)
# Create a temporary Node.js script in the project directory so it can access node_modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_SCRIPT="$PROJECT_ROOT/.verify-tables-temp.js"

cat > "$TEMP_SCRIPT" << 'EOFSCRIPT'
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local if it exists
// __dirname will be the project root since we run from there
const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERROR: Missing Supabase environment variables");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const REQUIRED_TABLES = process.argv.slice(2);

async function checkTables() {
  const results = {};
  const missing = [];
  
  for (const table of REQUIRED_TABLES) {
    try {
      // Try to query the table (will fail if table doesn't exist)
      const { data, error } = await supabase.from(table).select("*").limit(0);
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          results[table] = { exists: false };
          missing.push(table);
        } else {
          // Other error - table might exist but have permission issues
          results[table] = { exists: true, error: error.message };
        }
      } else {
        results[table] = { exists: true };
      }
    } catch (err) {
      results[table] = { exists: false };
      missing.push(table);
    }
  }
  
  // Output results
  for (const table of REQUIRED_TABLES) {
    if (results[table].exists) {
      console.log(`EXISTS:${table}`);
    } else {
      console.log(`MISSING:${table}`);
    }
  }
  
  // Get counts for existing tables
  console.log("---COUNTS---");
  for (const table of REQUIRED_TABLES) {
    if (results[table].exists && !results[table].error) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: 'exact', head: true });
        if (!error && count !== null) {
          console.log(`COUNT:${table}:${count}`);
        }
      } catch (err) {
        // Ignore count errors
      }
    }
  }
  
  process.exit(missing.length > 0 ? 1 : 0);
}

checkTables();
EOFSCRIPT

# Run the Node.js script from project root so it can access node_modules
cd "$PROJECT_ROOT" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  WARNING: node_modules not found. Installing dependencies..."
    npm install --silent
fi

# Run node with NODE_PATH set to project root so it can find node_modules
export NODE_PATH="$PROJECT_ROOT/node_modules"
TABLE_CHECK=$(node "$TEMP_SCRIPT" "${REQUIRED_TABLES[@]}" 2>&1)
EXIT_CODE=$?

# Clean up temp script
rm -f "$TEMP_SCRIPT"

if [ $EXIT_CODE -ne 0 ] && ! echo "$TABLE_CHECK" | grep -q "EXISTS:"; then
    echo "❌ ERROR: Failed to connect to database"
    echo ""
    echo "Make sure you have:"
    echo "  1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    echo "  2. Linked to the correct project: npm run verify:project"
    echo ""
    echo "Error details:"
    echo "$TABLE_CHECK"
    exit 1
fi

# Parse results
MISSING_TABLES=()
while IFS= read -r line; do
    if [[ $line == MISSING:* ]]; then
        table="${line#MISSING:}"
        echo "❌ Table '$table' is missing"
        MISSING_TABLES+=("$table")
    elif [[ $line == EXISTS:* ]]; then
        table="${line#EXISTS:}"
        echo "✅ Table '$table' exists"
    fi
done <<< "$TABLE_CHECK"

echo ""

# Parse and display counts
if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    echo "Checking table row counts..."
    echo ""
    
    COUNTS_FOUND=false
    while IFS= read -r line; do
        if [[ $line == COUNT:* ]]; then
            COUNTS_FOUND=true
            table="${line#COUNT:}"
            count="${table#*:}"
            table="${table%%:*}"
            if [ "$count" = "0" ]; then
                echo "  $table: $count row(s) ✅ (empty)"
            else
                echo "  $table: $count row(s) ⚠️  (has data)"
            fi
        fi
    done <<< "$TABLE_CHECK"
    
    if [ "$COUNTS_FOUND" = false ]; then
        echo "  ⚠️  Could not retrieve row counts (checking via alternative method...)"
        # Fallback: use the inspect script
        if command -v node &> /dev/null && [ -f "scripts/inspect-supabase-data.js" ]; then
            echo ""
            node scripts/inspect-supabase-data.js 2>/dev/null | grep -E "(workgroups|meetingsummaries|names|tags)" || echo "  Run: node scripts/inspect-supabase-data.js"
        fi
    fi
    
    echo ""
    echo "✅ Database structure verification complete!"
    exit 0
else
    echo "❌ ERROR: Missing required tables: ${MISSING_TABLES[*]}"
    echo ""
    echo "To fix, run migrations:"
    echo "  supabase db push"
    echo ""
    echo "Or reset the database (⚠️  This will delete all data):"
    echo "  supabase db reset"
    exit 1
fi
