# Stratova Supabase foundation

This directory contains versioned PostgreSQL migrations for Stratova.

## Migration order

1. `0001_stratova_foundation.sql` — core schema, indexes, extensions, and RLS enablement.
2. `0002_stratova_rls.sql` — organization-scoped authorization policies for Supabase Auth.

The application runtime is intentionally not switched from the in-memory assessment adapter until the Supabase project has been configured and the migrations have been applied successfully.

## Security model

All application tables use Row Level Security. Access is scoped through `organization_members` and `auth.uid()`.

`OWNER` and `ADMIN` roles manage organization-level resources. Assessment data, findings, opportunities, and evidence inherit access from the assessment's organization.

Service-side operations that intentionally bypass RLS must use a protected server-only Supabase service-role client and must never expose its key to the browser.
