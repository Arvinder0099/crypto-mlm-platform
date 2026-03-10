const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ATLAS = 'mongodb+srv://arvindersaini2523_db_user:Arvinder2523@crypto-mlm-cluster.n5u0d7k.mongodb.net/crypto-mlm';
const PROD_URL = 'https://crypto-mlm-platform-efji5.ondigitalocean.app';

async function run() {
  // PHASE 1: Database setup
  console.log('=== PHASE 1: Database Setup on Atlas ===\n');
  await mongoose.connect(ATLAS);
  const db = mongoose.connection.db;

  // List users
  const users = await db.collection('users').find({}).project({email:1, userId:1, role:1, activeInvestments:1, fundWallet:1}).toArray();
  console.log('Users in Atlas DB:');
  users.forEach(u => console.log(`  ${u.email} | role:${u.role} | investments:${u.activeInvestments} | fund:${u.fundWallet}`));

  // Reset test user password
  const testUser = users.find(u => u.role === 'user');
  if (!testUser) {
    console.log('ERROR: No non-admin user found!');
    await mongoose.disconnect();
    return;
  }
  console.log(`\nResetting user: ${testUser.email}`);
  const hash = await bcrypt.hash('123456', 12);
  await db.collection('users').updateOne(
    { _id: testUser._id },
    { $set: { password: hash, loginAttempts: 0, lockedUntil: null, fundWallet: 5000, balance: 5000 } }
  );
  console.log('Password => 123456, fundWallet => 5000');

  // Check investments
  const invCount = await db.collection('investments').countDocuments();
  console.log(`\nInvestments in DB: ${invCount}`);
  const claimCount = await db.collection('roiclaims').countDocuments();
  console.log(`ROI claims in DB: ${claimCount}`);

  await mongoose.disconnect();

  // PHASE 2: API Testing
  console.log('\n=== PHASE 2: API Testing on Production ===\n');

  // Step 1: Admin login
  console.log('--- Step 1: Admin Login ---');
  let r = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email:'arvindersaini2523@gmail.com', password:'Arvinder2001@'})
  });
  let data = await r.json();
  console.log(`Status: ${r.status}`);
  const adminToken = data.token;
  if (!adminToken) { console.log('FAILED: No admin token'); return; }
  console.log('Admin token OK');

  // Step 2: User login
  console.log('\n--- Step 2: User Login ---');
  r = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email: testUser.email, password: '123456'})
  });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  const userToken = data.token;
  if (!userToken) { console.log('FAILED: No user token. Response:', JSON.stringify(data)); return; }
  console.log('User token OK');

  // Step 3: Check user's investments
  console.log('\n--- Step 3: Current Investments ---');
  r = await fetch(`${PROD_URL}/api/investments`, {
    headers: {Authorization: `Bearer ${userToken}`}
  });
  data = await r.json();
  const investments = data.investments || [];
  console.log(`Status: ${r.status}, Count: ${investments.length}`);
  investments.forEach(inv => console.log(`  - ${inv.planId?.name || 'unknown'} | status: ${inv.status} | daily: ${inv.planId?.dailyEarn}`));

  // Step 4: Get plans
  console.log('\n--- Step 4: Get Plans ---');
  r = await fetch(`${PROD_URL}/api/plans`);
  const plansData = await r.json();
  const plans = plansData.plans || plansData;
  const plan = plans[0];
  console.log(`Plan: ${plan.name}, Investment: ${plan.investment}, Daily: ${plan.dailyEarn}, ID: ${plan._id}`);

  // Step 5: Create investment (only if user has < 2 active investments)
  const activeInv = investments.filter(i => i.status === 'active');
  if (activeInv.length === 0) {
    console.log('\n--- Step 5: Create Investment ---');
    r = await fetch(`${PROD_URL}/api/investments/create`, {
      method: 'POST',
      headers: {'Content-Type':'application/json', Authorization: `Bearer ${userToken}`},
      body: JSON.stringify({planId: plan._id, amount: plan.investment, walletType: 'fundWallet'})
    });
    data = await r.json();
    console.log(`Status: ${r.status}`);
    console.log(`Result: ${data.message || JSON.stringify(data).substring(0,200)}`);
  } else {
    console.log(`\n--- Step 5: Skip (${activeInv.length} active investments exist) ---`);
  }

  // Step 6: Admin process daily returns (creates claimable ROI)
  console.log('\n--- Step 6: Admin Process Daily Returns ---');
  r = await fetch(`${PROD_URL}/api/admin/daily-returns/process`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${adminToken}`},
    body: JSON.stringify({})
  });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Result: ${JSON.stringify(data).substring(0,500)}`);

  // Step 7: Check claim status
  console.log('\n--- Step 7: Check ROI Claim Status ---');
  r = await fetch(`${PROD_URL}/api/roi/claim-status`, {
    headers: {Authorization: `Bearer ${userToken}`}
  });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`hasClaimable: ${data.hasClaimable}`);
  console.log(`claimable: ${JSON.stringify(data.claimable)}`);
  console.log(`history: ${data.history?.length} entries`);

  if (!data.hasClaimable || !data.claimable) {
    console.log('\n*** NO CLAIMABLE ROI - Investigating... ***');
    // Check ROI claims collection directly
    await mongoose.connect(ATLAS);
    const claims = await mongoose.connection.db.collection('roiclaims').find({}).toArray();
    console.log('ROI Claims in DB:', claims.length);
    claims.forEach(c => console.log(`  userId:${c.userId} date:${c.date} amount:${c.amount} status:${c.status}`));
    await mongoose.disconnect();
    return;
  }

  // Step 8: Claim the ROI
  console.log('\n--- Step 8: Claim ROI ---');
  r = await fetch(`${PROD_URL}/api/roi/claim`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${userToken}`},
    body: JSON.stringify({claimId: data.claimable.id})
  });
  const claimResult = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Result: ${JSON.stringify(claimResult).substring(0,300)}`);

  // Step 9: Verify after claim
  console.log('\n--- Step 9: Verify After Claim ---');
  r = await fetch(`${PROD_URL}/api/roi/claim-status`, {
    headers: {Authorization: `Bearer ${userToken}`}
  });
  data = await r.json();
  console.log(`hasClaimable: ${data.hasClaimable}`);
  console.log(`history: ${JSON.stringify(data.history).substring(0,300)}`);

  console.log('\n=== ALL TESTS COMPLETE ===');
}

run().catch(e => console.error('Fatal:', e.message));
