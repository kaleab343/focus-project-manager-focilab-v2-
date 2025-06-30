import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yqpojhmfdnqucutubxso.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcG9qaG1mZG5xdWN1dHVieHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NzExNTEsImV4cCI6MjA2NjI0NzE1MX0.M_z6eh07ufCYeXVuOq2iazsjhacRLzM0MgGpUPjPwhM"

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
