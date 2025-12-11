# Test Project Configuration

**⚠️ IMPORTANT: This repository is configured to connect ONLY to the test Supabase project.**

## Linked Test Project

- **Project Name:** `archive-oracle`
- **Project Reference ID:** `lhpdnxaqydoeyqmbffow`
- **Region:** West EU (Ireland)
- **Created:** 2025-12-05
- **Purpose:** Test/Development environment

## Verification

To verify which project this repository is linked to:

```bash
# Check linked project
supabase projects list

# View project reference
cat supabase/.temp/project-ref
```

The linked project should show with a ● symbol in the projects list.

## Changing the Linked Project

**⚠️ DO NOT change the linked project unless explicitly instructed.**

If you need to link to a different project:

```bash
supabase link --project-ref <project-ref-id>
```

## Project Reference File

The current project reference is stored in:
- `supabase/.temp/project-ref`

This file is automatically managed by the Supabase CLI and should not be manually edited.
