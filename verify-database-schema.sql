-- ========================================
-- OnPurpose Database Schema Verification
-- Execute this in Neon SQL Editor
-- ========================================

-- Step 1: Check if required tables exist
SELECT 
    'Table Existence Check' as check_type,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('HostApplications', 'Experiences', 'HostAvailability', 'Hosts', 'Bookings', 'Users')
ORDER BY table_name;

-- Step 2: Check HostApplications table structure
SELECT 
    'HostApplications Columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'HostApplications'
ORDER BY ordinal_position;

-- Step 3: Check Hosts table for new columns
SELECT 
    'Hosts Enhanced Columns' as check_type,
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('bio', 'profilePhoto', 'portfolioImages', 'availability', 'verificationStatus', 'hourlyRate', 'location', 'totalEarnings', 'responseRate') 
        THEN '✅ NEW COLUMN'
        ELSE 'Original'
    END as column_status
FROM information_schema.columns 
WHERE table_name = 'Hosts'
ORDER BY ordinal_position;

-- Step 4: Check Bookings table for new columns
SELECT 
    'Bookings Enhanced Columns' as check_type,
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('experienceId', 'guestCount', 'specialRequests', 'meetingLocation', 'hostNotes', 'guestNotes') 
        THEN '✅ NEW COLUMN'
        ELSE 'Original'
    END as column_status
FROM information_schema.columns 
WHERE table_name = 'Bookings'
ORDER BY ordinal_position;

-- Step 5: Check for sample data in HostApplications
SELECT 
    'Sample Data Check' as check_type,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
FROM "HostApplications";

-- Step 6: List all host applications
SELECT 
    'Host Applications List' as check_type,
    id,
    "firstName",
    "lastName",
    email,
    category,
    location,
    "hourlyRate",
    status,
    "createdAt"
FROM "HostApplications"
ORDER BY "createdAt" DESC;

-- Step 7: Check indexes
SELECT 
    'Index Check' as check_type,
    indexname,
    tablename,
    '✅ INDEX EXISTS' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_host_applications_status',
    'idx_host_applications_category',
    'idx_hosts_location',
    'idx_hosts_verification',
    'idx_experiences_host',
    'idx_experiences_category'
)
ORDER BY tablename, indexname;

-- Step 8: Summary Report
SELECT 
    'SUMMARY REPORT' as report_type,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'HostApplications') as hostapplications_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Experiences') as experiences_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'HostAvailability') as hostavailability_exists,
    (SELECT COUNT(*) FROM "HostApplications") as total_applications,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_host%') as total_indexes;
