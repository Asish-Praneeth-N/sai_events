import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jnjqdfafirceefswizlp.supabase.co";
const supabaseKey = "sb_publishable_QpuVOYGc8Q-loIt5sWa8_w__SEHzRJX";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Connecting to Supabase URL:", supabaseUrl);
  
  // Sign in as OM
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: "meghanakishan986@gmail.com",
    password: "Test@123"
  });

  if (signInError) {
    console.error("Sign in failed:", signInError.message);
    return;
  }
  console.log("Logged in as OM! User ID:", signInData.user.id);
  console.log("User metadata:", signInData.user.user_metadata);

  // Try querying the categories table
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error querying categories table:", error.message);
  } else {
    console.log("Successfully connected! Categories query returned:", categories);
  }

  // Check profiles count
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, email, full_name");

  if (profileError) {
    console.error("Error querying profiles table:", profileError.message);
  } else {
    console.log("Profiles in DB:", profiles);
  }

  // Check operational_managers count
  const { data: oms, error: omError } = await supabase
    .from("operational_managers")
    .select("*");

  if (omError) {
    console.error("Error querying operational_managers table:", omError.message);
  } else {
    console.log("Operational managers in DB:", oms);
  }
}

testConnection();
