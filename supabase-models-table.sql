-- Create models table for storing user models
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL, -- The model JSON document
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS models_user_id_idx ON models(user_id);

-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting own models only
CREATE POLICY "Users can view their own models"
  ON models
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for inserting own models
CREATE POLICY "Users can insert their own models"
  ON models
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for updating own models
CREATE POLICY "Users can update their own models"
  ON models
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for deleting own models
CREATE POLICY "Users can delete their own models"
  ON models
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set updated_at on update
CREATE TRIGGER update_models_updated_at
BEFORE UPDATE ON models
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();