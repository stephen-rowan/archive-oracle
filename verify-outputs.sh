#!/bin/bash
# Verification script for generate-seed-data.js outputs

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default output directory (same as input JSON file location)
OUTPUT_DIR="${1:-test-output}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verifying generate-seed-data.js Outputs${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Checking directory: ${OUTPUT_DIR}"
echo ""

# Check if directory exists
if [ ! -d "$OUTPUT_DIR" ]; then
    echo -e "${RED}✗ Directory not found: $OUTPUT_DIR${NC}"
    echo "Usage: $0 [output-directory]"
    exit 1
fi

cd "$OUTPUT_DIR"

# Track verification results
PASSED=0
FAILED=0

# Function to check file existence
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description exists: $file"
        local size=$(du -h "$file" | cut -f1)
        local lines=$(wc -l < "$file" | tr -d ' ')
        echo "  Size: $size | Lines: $lines"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $description NOT found: $file"
        ((FAILED++))
        return 1
    fi
}

# Function to validate JSON
validate_json() {
    local file=$1
    if command -v jq &> /dev/null; then
        if jq empty "$file" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Valid JSON syntax"
            return 0
        else
            echo -e "  ${RED}✗${NC} Invalid JSON syntax"
            return 1
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} jq not installed - skipping JSON validation"
        return 0
    fi
}

# Function to validate SQL syntax (basic check)
validate_sql() {
    local file=$1
    local errors=0
    
    # Check for basic SQL syntax issues
    if grep -q "INSERT INTO" "$file"; then
        echo -e "  ${GREEN}✓${NC} Contains INSERT statements"
        
        # Count INSERT statements
        local insert_count=$(grep -c "INSERT INTO" "$file")
        echo "  INSERT statements: $insert_count"
        
        # Check for common SQL issues
        if grep -q "''" "$file" && ! grep -q "''''" "$file"; then
            echo -e "  ${GREEN}✓${NC} SQL string escaping appears correct"
        fi
        
        # Check INSERT order (workgroups should come before meetingsummaries)
        local workgroup_line=$(grep -n "INSERT INTO workgroups" "$file" | head -1 | cut -d: -f1)
        local meeting_line=$(grep -n "INSERT INTO meetingsummaries" "$file" | head -1 | cut -d: -f1)
        
        if [ -n "$workgroup_line" ] && [ -n "$meeting_line" ]; then
            if [ "$workgroup_line" -lt "$meeting_line" ]; then
                echo -e "  ${GREEN}✓${NC} INSERT order correct (workgroups before meetingsummaries)"
            else
                echo -e "  ${YELLOW}⚠${NC} INSERT order may be incorrect (meetingsummaries before workgroups)"
            fi
        fi
    else
        echo -e "  ${RED}✗${NC} No INSERT statements found"
        ((errors++))
    fi
    
    return $errors
}

echo -e "${BLUE}1. Checking Output Files${NC}"
echo "----------------------------------------"

# Check seed.sql
if check_file "seed.sql" "seed.sql"; then
    validate_sql "seed.sql"
fi
echo ""

# Check mapping.json
if check_file "mapping.json" "mapping.json"; then
    validate_json "mapping.json"
    
    if command -v jq &> /dev/null; then
        echo ""
        echo -e "${BLUE}  Mapping Statistics:${NC}"
        echo "  - Total mappings: $(jq '.mappings | length' mapping.json)"
        echo "  - Synthetic fields: $(jq '.syntheticFields | length' mapping.json)"
        echo ""
        echo -e "${BLUE}  Data Statistics:${NC}"
        jq -r '.statistics | to_entries | .[] | "  - \(.key): \(.value)"' mapping.json | sed 's/_/ /g' | sed 's/\b\(.\)/\u\1/g'
    fi
fi
echo ""

# Check TESTDATA.md
if check_file "TESTDATA.md" "TESTDATA.md"; then
    # Check for key sections
    if grep -q "Data Summary" "TESTDATA.md"; then
        echo -e "  ${GREEN}✓${NC} Contains Data Summary section"
    fi
    
    if grep -q "Error and Warning Summary" "TESTDATA.md"; then
        echo -e "  ${GREEN}✓${NC} Contains Error/Warning Summary section"
        
        # Extract error/warning counts
        error_count=$(grep -i "Total Errors" "TESTDATA.md" | grep -oE '[0-9]+' | head -1)
        warning_count=$(grep -i "Total Warnings" "TESTDATA.md" | grep -oE '[0-9]+' | head -1)
        
        if [ -n "$error_count" ]; then
            if [ "$error_count" -eq 0 ]; then
                echo -e "  ${GREEN}✓${NC} No errors reported"
            else
                echo -e "  ${YELLOW}⚠${NC} $error_count error(s) reported - check TESTDATA.md for details"
            fi
        fi
        
        if [ -n "$warning_count" ]; then
            if [ "$warning_count" -eq 0 ]; then
                echo -e "  ${GREEN}✓${NC} No warnings reported"
            else
                echo -e "  ${YELLOW}⚠${NC} $warning_count warning(s) reported - check TESTDATA.md for details"
            fi
        fi
    fi
    
    if grep -q "Usage Instructions" "TESTDATA.md"; then
        echo -e "  ${GREEN}✓${NC} Contains Usage Instructions section"
    fi
fi
echo ""

echo -e "${BLUE}2. Cross-File Validation${NC}"
echo "----------------------------------------"

# Verify statistics match between mapping.json and TESTDATA.md
if [ -f "mapping.json" ] && [ -f "TESTDATA.md" ] && command -v jq &> /dev/null; then
    json_workgroups=$(jq -r '.statistics.workgroups' mapping.json)
    json_meetings=$(jq -r '.statistics.meetings' mapping.json)
    json_names=$(jq -r '.statistics.names' mapping.json)
    json_tags=$(jq -r '.statistics.tags' mapping.json)
    
    md_workgroups=$(grep -i "Workgroups" TESTDATA.md | grep -oE '[0-9]+' | head -1)
    md_meetings=$(grep -i "Meetings" TESTDATA.md | grep -oE '[0-9]+' | head -1)
    md_names=$(grep -i "Names" TESTDATA.md | grep -oE '[0-9]+' | head -1)
    md_tags=$(grep -i "Tags" TESTDATA.md | grep -oE '[0-9]+' | head -1)
    
    if [ "$json_workgroups" = "$md_workgroups" ] && \
       [ "$json_meetings" = "$md_meetings" ] && \
       [ "$json_names" = "$md_names" ] && \
       [ "$json_tags" = "$md_tags" ]; then
        echo -e "${GREEN}✓${NC} Statistics match between mapping.json and TESTDATA.md"
    else
        echo -e "${YELLOW}⚠${NC} Statistics mismatch between mapping.json and TESTDATA.md"
        echo "  mapping.json: workgroups=$json_workgroups, meetings=$json_meetings, names=$json_names, tags=$json_tags"
        echo "  TESTDATA.md: workgroups=$md_workgroups, meetings=$md_meetings, names=$md_names, tags=$md_tags"
    fi
fi

# Verify INSERT count matches statistics
if [ -f "seed.sql" ] && [ -f "mapping.json" ] && command -v jq &> /dev/null; then
    workgroup_inserts=$(grep -c "INSERT INTO workgroups" seed.sql || echo "0")
    meeting_inserts=$(grep -c "INSERT INTO meetingsummaries" seed.sql || echo "0")
    name_inserts=$(grep -c "INSERT INTO names" seed.sql || echo "0")
    tag_inserts=$(grep -c "INSERT INTO tags" seed.sql || echo "0")
    
    json_workgroups=$(jq -r '.statistics.workgroups' mapping.json)
    json_meetings=$(jq -r '.statistics.meetings' mapping.json)
    json_names=$(jq -r '.statistics.names' mapping.json)
    json_tags=$(jq -r '.statistics.tags' mapping.json)
    
    if [ "$workgroup_inserts" -eq "$json_workgroups" ] && \
       [ "$meeting_inserts" -eq "$json_meetings" ] && \
       [ "$name_inserts" -eq "$json_names" ] && \
       [ "$tag_inserts" -eq "$json_tags" ]; then
        echo -e "${GREEN}✓${NC} INSERT statement counts match statistics"
    else
        echo -e "${YELLOW}⚠${NC} INSERT statement counts don't match statistics"
        echo "  SQL: workgroups=$workgroup_inserts, meetings=$meeting_inserts, names=$name_inserts, tags=$tag_inserts"
        echo "  JSON: workgroups=$json_workgroups, meetings=$json_meetings, names=$json_names, tags=$json_tags"
    fi
fi
echo ""

echo -e "${BLUE}3. Quick Content Preview${NC}"
echo "----------------------------------------"

if [ -f "seed.sql" ]; then
    echo -e "${BLUE}First few INSERT statements from seed.sql:${NC}"
    grep "INSERT INTO" seed.sql | head -3 | sed 's/^/  /'
    echo ""
fi

if [ -f "mapping.json" ] && command -v jq &> /dev/null; then
    echo -e "${BLUE}Sample mappings from mapping.json:${NC}"
    jq -r '.mappings[0:3][] | "  - \(.jsonPath) → \(.table).\(.column) (\(.transformation))"' mapping.json
    echo ""
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review TESTDATA.md for usage instructions"
    echo "2. Check mapping.json for data transformation details"
    echo "3. Test seed.sql in your database:"
    echo "   psql -h localhost -U your_user -d your_database -f $OUTPUT_DIR/seed.sql"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review the output above.${NC}"
    exit 1
fi
