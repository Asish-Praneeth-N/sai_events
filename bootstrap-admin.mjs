import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jnjqdfafirceefswizlp.supabase.co";
const supabaseKey = "sb_publishable_QpuVOYGc8Q-loIt5sWa8_w__SEHzRJX";

const supabase = createClient(supabaseUrl, supabaseKey);

const email = "admin.test.sai@gmail.com";
const password = "Password123!";
const fullName = "Test Admin";
const phoneNumber = "9876543210";

async function bootstrap() {
  console.log("1. Registering user:", email);
  
  // Try to sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        role: "customer" // Start as customer to satisfy trigger
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      console.log("User already registered in Auth. Proceeding to sign in...");
    } else {
      console.error("Sign up error:", signUpError.message);
      return;
    }
  } else {
    console.log("Registration request sent. User ID:", signUpData.user?.id);
  }

  console.log("2. Signing in as:", email);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in error:", signInError.message);
    return;
  }

  const userId = signInData.user.id;
  console.log("Signed in successfully. User ID:", userId);

  console.log("3. Upgrading profile role to 'admin'...");
  const { data: updateData, error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId)
    .select();

  if (updateError) {
    console.error("Failed to upgrade role:", updateError.message);
  } else {
    console.log("Upgrade successful! Updated profile:", updateData);
  }
}

bootstrap();
