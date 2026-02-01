-- Fix RLS policies to allow collaborators to view shared architectures

-- First, ensure architecture_collaborators has simple RLS that won't cause recursion
DROP POLICY IF EXISTS "Users can view their collaborations" ON architecture_collaborators;
CREATE POLICY "Users can view their collaborations"
ON architecture_collaborators FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners can manage collaborators" ON architecture_collaborators;
CREATE POLICY "Owners can manage collaborators"
ON architecture_collaborators FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM architectures 
    WHERE id = architecture_id AND created_by = auth.uid()
  )
);

-- Drop existing policies on architectures
DROP POLICY IF EXISTS "Users can view their own architectures" ON architectures;
DROP POLICY IF EXISTS "Users can view shared architectures" ON architectures;
DROP POLICY IF EXISTS "Users can view public architectures" ON architectures;
DROP POLICY IF EXISTS "Users can view architectures they own or collaborate on" ON architectures;
DROP POLICY IF EXISTS "Users can update their own architectures" ON architectures;
DROP POLICY IF EXISTS "Users can delete their own architectures" ON architectures;
DROP POLICY IF EXISTS "Users can insert their own architectures" ON architectures;
DROP POLICY IF EXISTS "Users can update architectures they own" ON architectures;
DROP POLICY IF EXISTS "Users can delete architectures they own" ON architectures;

-- Create a function to check collaboration access (avoids recursion)
CREATE OR REPLACE FUNCTION has_architecture_access(arch_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM architecture_collaborators ac
    WHERE ac.architecture_id = arch_id AND ac.user_id = has_architecture_access.user_id
  );
END;
$$;

-- Create new comprehensive read policy using the function
CREATE POLICY "Users can view architectures they own or collaborate on"
ON architectures FOR SELECT
USING (
  auth.uid() = created_by OR
  has_architecture_access(id, auth.uid()) OR
  is_public = true
);

-- Ensure users can update architectures they own or collaborate on with edit access
CREATE POLICY "Users can update architectures they own or edit"
ON architectures FOR UPDATE
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM architecture_collaborators
    WHERE architecture_id = architectures.id 
    AND user_id = auth.uid()
    AND role IN ('Owner', 'Editor')
  )
);

-- Ensure users can delete architectures they own
CREATE POLICY "Users can delete architectures they own"
ON architectures FOR DELETE
USING (auth.uid() = created_by);

-- Ensure users can insert architectures
CREATE POLICY "Users can insert their own architectures"
ON architectures FOR INSERT
WITH CHECK (auth.uid() = created_by);
