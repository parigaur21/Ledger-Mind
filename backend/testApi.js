const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const API_URL = 'http://localhost:5000';

async function runTests() {
    console.log("🚀 Starting Backend Tests...\n");

    // 1. Authenticate / Create Test User
    const testEmail = 'ledgermind.test@gmail.com';
    const testPassword = 'Password123!';
    let token;
    let userId;

    console.log("1. Authenticating with Supabase...");
    let { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (error) {
        console.log("   User not found, signing up instead...");
        const signUpRes = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });
        if (signUpRes.error) {
            console.error("   ❌ Signup failed:", signUpRes.error.message);
            return;
        }
        data = signUpRes.data;
        console.log("   User created. Please ensure email confirmations are off in your Supabase Auth settings, or it won't be able to log in. Assuming sign-in worked for now...");
    }

    if (!data.session) {
       console.log("   ❌ No session obtained. Is email confirmation required in Supabase? Turn it off for local testing!");
       return;
    }

    token = data.session.access_token;
    userId = data.user.id;
    console.log(`   ✅ Authenticated! User ID: ${userId}\n`);

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Add an Expense
    console.log("2. Testing POST /transactions...");
    try {
        const res = await axios.post(`${API_URL}/transactions`, {
            amount: 75.50,
            category: "Groceries",
            description: "Whole Foods",
            date: new Date().toISOString()
        }, { headers });
        console.log("   ✅ Success! Created Transaction:", res.data);
    } catch (e) {
        console.error("   ❌ Failed POST /transactions:", e.response ? e.response.data : e.message);
    }

    // 3. Add another Expense
    try {
        await axios.post(`${API_URL}/transactions`, {
            amount: 120.00,
            category: "Transport",
            description: "Uber rides",
            date: new Date().toISOString()
        }, { headers });
    } catch(e) {}

    // 4. Test Analytics
    console.log("\n3. Testing GET /analytics...");
    try {
        const res = await axios.get(`${API_URL}/analytics`, { headers });
        console.log("   ✅ Success! Analytics Data:", res.data);
    } catch (e) {
        console.error("   ❌ Failed GET /analytics:", e.response ? e.response.data : e.message);
    }

    // 5. Test AI Chat
    console.log("\n4. Testing POST /ai/finance...");
    try {
        const res = await axios.post(`${API_URL}/ai/finance`, {
            query: "I've been spending a lot lately. Based on my transactions, where am I overspending and how can I cut back?"
        }, { headers });
        console.log("   ✅ Success! AI Response:\n", res.data.answer);
    } catch (e) {
        console.error("   ❌ Failed POST /ai/finance:", e.response ? e.response.data : e.message);
    }
}

runTests();
