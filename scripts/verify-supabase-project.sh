#!/bin/bash
# Verify that this repository is linked to the correct test Supabase project

EXPECTED_PROJECT_REF="lhpdnxaqydoeyqmbffow"
PROJECT_REF_FILE="supabase/.temp/project-ref"

echo "🔍 Verifying Supabase project connection..."
echo ""

# Check if project-ref file exists
if [ ! -f "$PROJECT_REF_FILE" ]; then
    echo "❌ ERROR: Project reference file not found at $PROJECT_REF_FILE"
    echo "   Run: supabase link --project-ref $EXPECTED_PROJECT_REF"
    exit 1
fi

# Read current project reference
CURRENT_PROJECT_REF=$(cat "$PROJECT_REF_FILE" | tr -d '\n')

echo "Expected Project Reference: $EXPECTED_PROJECT_REF"
echo "Current Project Reference:  $CURRENT_PROJECT_REF"
echo ""

# Verify match
if [ "$CURRENT_PROJECT_REF" = "$EXPECTED_PROJECT_REF" ]; then
    echo "✅ SUCCESS: Repository is correctly linked to test project"
    echo ""
    echo "Project Details:"
    supabase projects list | grep -E "(LINKED|●|$EXPECTED_PROJECT_REF)" || echo "   (Run 'supabase projects list' for full details)"
    exit 0
else
    echo "❌ ERROR: Repository is linked to wrong project!"
    echo ""
    echo "Expected: $EXPECTED_PROJECT_REF (test project)"
    echo "Current:  $CURRENT_PROJECT_REF"
    echo ""
    echo "To fix, run:"
    echo "  supabase link --project-ref $EXPECTED_PROJECT_REF"
    exit 1
fi
