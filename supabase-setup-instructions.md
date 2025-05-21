# Setting up Supabase for obliq

This document provides instructions for setting up the Supabase backend for the obliq application.

## Prerequisites

1. A Supabase account and project
2. The Supabase CLI installed (optional, for local development)

## Environment Variables

Add these environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setting Up the Models Table

You can set up the models table in two ways:

### Option 1: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the `supabase-models-table.sql` script 
4. Run the script in the SQL Editor

### Option 2: Using the Supabase CLI

1. Copy the SQL script to your migrations folder
2. Run the migration using:
   ```bash
   supabase db push
   ```

## Verifying the Setup

To verify the setup:

1. Go to the "Table Editor" in your Supabase dashboard
2. You should see a `models` table with the columns:
   - id (UUID)
   - user_id (UUID)
   - name (text)
   - description (text)
   - data (JSONB)
   - created_at (timestamp)
   - updated_at (timestamp)

3. Check that Row Level Security (RLS) is enabled by going to "Authentication" > "Policies"
4. Verify that the following policies exist for the `models` table:
   - "Users can view their own models"
   - "Users can insert their own models"
   - "Users can update their own models"
   - "Users can delete their own models"

## Database Schema

The `models` table has the following structure:

- `id`: UUID primary key for the model
- `user_id`: UUID reference to the user who owns the model
- `name`: Text name of the model
- `description`: Optional text description of the model
- `data`: JSONB data containing the entire model structure
- `created_at`: Timestamp when the model was created
- `updated_at`: Timestamp when the model was last updated

## Row Level Security

The table uses Row Level Security (RLS) to ensure users can only access their own models:

- Users can only select, insert, update, and delete models where `user_id` equals the authenticated user's ID
- This ensures that users cannot access models created by other users