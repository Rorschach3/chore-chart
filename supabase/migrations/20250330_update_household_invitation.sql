
-- This SQL migration will update the households table to ensure invitation_code is set
-- It will modify the handle_new_household function to make sure invitation_code is set to the household_number as a string

-- First, ensure the invitation_code column exists (creates it if not)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'households' 
    AND column_name = 'invitation_code'
  ) THEN
    ALTER TABLE public.households ADD COLUMN invitation_code TEXT;
  END IF;
END $$;

-- Update existing households to set invitation_code equal to household_number as string if not already set
UPDATE public.households 
SET invitation_code = household_number::TEXT 
WHERE invitation_code IS NULL;

-- Make sure invitation_code is never null for new households
ALTER TABLE public.households 
ALTER COLUMN invitation_code SET NOT NULL;

-- Update the handle_new_household function to set invitation_code = household_number as string for new households
CREATE OR REPLACE FUNCTION public.handle_new_household()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Set invitation_code to household_number as string if not already set
    IF NEW.invitation_code IS NULL THEN
        NEW.invitation_code := NEW.household_number::TEXT;
    END IF;
    
    -- Get the user who created the household (from the profiles update)
    INSERT INTO user_roles (user_id, household_id, role)
    SELECT id, NEW.id, 'admin'::app_role
    FROM profiles
    WHERE household_id = NEW.id
    AND updated_at >= (now() - interval '5 seconds');
    
    RETURN NEW;
END;
$function$;
