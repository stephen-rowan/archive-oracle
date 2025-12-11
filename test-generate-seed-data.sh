#!/bin/bash
# Quick test script for generate-seed-data.js

set -e

echo "🧪 Testing generate-seed-data.js"
echo "================================"
echo ""

# Create test directory
TEST_DIR="test-output"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Create minimal test JSON file
cat > test-meetings.json << 'EOF'
[
  {
    "workgroup": "Test Workgroup",
    "workgroup_id": "72ce0bc0-276e-4cde-bfb9-cdabc5ed953e",
    "meetingInfo": {
      "name": "Test Meeting",
      "date": "2025-01-27",
      "host": "Alice",
      "documenter": "Bob",
      "peoplePresent": "Alice, Bob, Carol"
    },
    "agendaItems": [],
    "tags": {
      "topicsCovered": "testing, development",
      "emotions": "focused, productive"
    },
    "type": "custom"
  },
  {
    "workgroup": "Another Workgroup",
    "meetingInfo": {
      "name": "Second Meeting",
      "date": "2025-01-28",
      "peoplePresent": "Dave, Eve"
    },
    "agendaItems": [],
    "tags": {
      "gamesPlayed": "Chess"
    },
    "type": "custom"
  }
]
EOF

echo "✓ Created test JSON file: test-meetings.json"
echo ""

# Run the script
echo "Running script..."
node ../scripts/generate-seed-data.js test-meetings.json schema.sql 2>&1
EXIT_CODE=$?

echo ""
echo "Exit code: $EXIT_CODE"
echo ""

# Check outputs
if [ -f "seed.sql" ]; then
  echo "✓ seed.sql created"
  echo "  Lines: $(wc -l < seed.sql)"
  echo "  INSERT statements: $(grep -c 'INSERT INTO' seed.sql)"
else
  echo "✗ seed.sql NOT created"
fi

if [ -f "mapping.json" ]; then
  echo "✓ mapping.json created"
  if command -v jq &> /dev/null; then
    echo "  Mappings: $(jq '.mappings | length' mapping.json)"
    echo "  Statistics:"
    jq '.statistics' mapping.json | sed 's/^/    /'
  fi
else
  echo "✗ mapping.json NOT created"
fi

if [ -f "TESTDATA.md" ]; then
  echo "✓ TESTDATA.md created"
  echo "  Lines: $(wc -l < TESTDATA.md)"
else
  echo "✗ TESTDATA.md NOT created"
fi

echo ""
echo "================================"
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Test completed successfully!"
elif [ $EXIT_CODE -eq 2 ]; then
  echo "⚠️  Test completed with warnings (check TESTDATA.md)"
else
  echo "❌ Test failed (exit code: $EXIT_CODE)"
fi

echo ""
echo "Generated files are in: $TEST_DIR/"
echo "View them with:"
echo "  cat $TEST_DIR/seed.sql"
echo "  cat $TEST_DIR/mapping.json | jq ."
echo "  cat $TEST_DIR/TESTDATA.md"
