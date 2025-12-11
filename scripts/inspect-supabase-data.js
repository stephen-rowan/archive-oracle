#!/usr/bin/env node
/**
 * Script to inspect data in Supabase database
 * 
 * Usage:
 *   node scripts/inspect-supabase-data.js [table_name]
 * 
 * If no table name is provided, it will show counts for all tables.
 * If a table name is provided, it will show the first 10 rows from that table.
 * 
 * Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * set in your environment or .env.local file.
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Try to load .env.local if it exists
const envPath = path.join(__dirname, "..", ".env.local");
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
  console.error("❌ Missing Supabase environment variables!");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// List of all tables in your database (from schema.sql)
const TABLES = [
  "admin",
  "archives",
  "docs_page",
  "docs_page_section",
  "document_copies",
  "documents",
  "documents_test",
  "meetingsummaries",
  "meetingsummaries_test",
  "missingsummaries",
  "names",
  "nods_page",
  "nods_page_section",
  "tags",
  "users",
  "workgroups",
];

async function getTableCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });
    
    if (error) {
      return { error: error.message };
    }
    return { count };
  } catch (error) {
    return { error: error.message };
  }
}

async function getTableData(tableName, limit = 10) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select("*", { count: "exact" })
      .limit(limit);
    
    if (error) {
      return { error: error.message };
    }
    return { data, count };
  } catch (error) {
    return { error: error.message };
  }
}

async function showAllTableCounts() {
  console.log("\n📊 Supabase Database Overview\n");
  console.log("Table Name".padEnd(30) + "Row Count");
  console.log("-".repeat(50));
  
  for (const table of TABLES) {
    const result = await getTableCount(table);
    if (result.error) {
      console.log(`${table.padEnd(30)}❌ ${result.error}`);
    } else {
      console.log(`${table.padEnd(30)}${result.count || 0}`);
    }
  }
  console.log("\n💡 Tip: Run with a table name to see sample data:");
  console.log("   node scripts/inspect-supabase-data.js meetingsummaries\n");
}

async function showTableData(tableName) {
  console.log(`\n📋 Data from table: ${tableName}\n`);
  
  const result = await getTableData(tableName, 10);
  
  if (result.error) {
    console.error(`❌ Error: ${result.error}`);
    return;
  }
  
  if (!result.data || result.data.length === 0) {
    console.log("No data found in this table.");
    return;
  }
  
  console.log(`Total rows: ${result.count}`);
  console.log(`Showing first ${Math.min(10, result.data.length)} rows:\n`);
  console.log(JSON.stringify(result.data, null, 2));
  
  if (result.count > 10) {
    console.log(`\n... and ${result.count - 10} more rows`);
  }
}

async function main() {
  const tableName = process.argv[2];
  
  if (tableName) {
    if (!TABLES.includes(tableName)) {
      console.error(`❌ Unknown table: ${tableName}`);
      console.error(`Available tables: ${TABLES.join(", ")}`);
      process.exit(1);
    }
    await showTableData(tableName);
  } else {
    await showAllTableCounts();
  }
}

main().catch(console.error);
