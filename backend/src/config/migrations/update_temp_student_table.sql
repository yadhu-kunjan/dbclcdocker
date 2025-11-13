-- Add new columns for the updated application form
ALTER TABLE temp_student
ADD COLUMN IF NOT EXISTS religion VARCHAR(50) DEFAULT 'Christian',
ADD COLUMN IF NOT EXISTS caste VARCHAR(50),
ADD COLUMN IF NOT EXISTS certificates_path VARCHAR(255),
MODIFY COLUMN course_name TEXT; -- Changed to TEXT to accommodate multiple courses

-- Update existing records
UPDATE temp_student 
SET religion = 'Christian' 
WHERE religion IS NULL;