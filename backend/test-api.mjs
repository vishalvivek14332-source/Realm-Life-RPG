const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting REALM Backend API Acceptance Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const testUser = {
    username: `valkyrie_${Date.now()}`,
    email: `valkyrie_${Date.now()}@realm.rpg`,
    password: 'valkyrieSecretPass123'
  };

  let token = '';
  let userId = '';
  let createdQuestId = '';

  // 1. REGISTER
  console.log('1. Testing User Registration...');
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, 'Register returns 201 Created');
  assert(Boolean(regData.data?.token), 'Register returns JWT token');
  assert(regData.data?.character?.level === 1, 'Character starts at Level 1');
  assert(regData.data?.character?.gold === 50, 'Character starts with 50 gold');
  token = regData.data?.token;
  userId = regData.data?.user?.id;

  // 2. LOGIN
  console.log('\n2. Testing User Login...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Login returns 200 OK');
  assert(loginData.data?.user?.email === testUser.email, 'Login returns authenticated user');

  // 3. GET /auth/me
  console.log('\n3. Testing GET /auth/me...');
  const meRes = await fetch(`${BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, 'GET /auth/me returns 200 OK');
  assert(meData.data?.user?.username === testUser.username, 'Auth Me returns user info');

  // 4. GET CHARACTER
  console.log('\n4. Testing GET /character...');
  const charRes = await fetch(`${BASE}/character`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const charData = await charRes.json();
  assert(charRes.status === 200, 'GET /character returns 200 OK');
  assert(charData.data?.health === 100, 'Character health is 100');
  assert(charData.data?.energy === 100, 'Character energy is 100');

  // 5. CREATE QUEST
  console.log('\n5. Testing Create Quest...');
  const createQuestRes = await fetch(`${BASE}/quests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Conquer the Coding Labyrinth',
      description: 'Solve 3 complex algorithmic challenges with clean architecture.',
      category: 'STUDY',
      difficulty: 'Hard',
      attribute: 'intellect',
      xpReward: 350,
      goldReward: 60,
      energyCost: 20
    })
  });
  const createQuestData = await createQuestRes.json();
  assert(createQuestRes.status === 201, 'Create quest returns 201 Created');
  createdQuestId = createQuestData.data?.id;
  assert(Boolean(createdQuestId), 'Created quest has valid ID');

  // 6. GET QUESTS
  console.log('\n6. Testing GET /quests...');
  const questsRes = await fetch(`${BASE}/quests`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const questsData = await questsRes.json();
  assert(questsRes.status === 200, 'GET /quests returns 200 OK');
  assert(questsData.data?.length >= 1, 'Quests array populated');

  // 7. COMPLETE QUEST (AUTHORITATIVE ENGINE)
  console.log('\n7. Testing Quest Completion (Authoritative Engine)...');
  const initialXp = charData.data.xp;
  const initialGold = charData.data.gold;
  const initialEnergy = charData.data.energy;

  const compRes = await fetch(`${BASE}/quests/${createdQuestId}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const compData = await compRes.json();
  assert(compRes.status === 200, 'Complete quest returns 200 OK');
  assert(compData.data?.rewards?.xpEarned >= 350, 'Authoritative XP awarded');
  assert(compData.data?.rewards?.goldEarned >= 60, 'Authoritative Gold awarded');
  assert(compData.data?.character?.energy === initialEnergy - 20, 'Energy deducted correctly');
  assert(compData.data?.character?.gold > initialGold, 'Gold balance increased');

  // 8. TRY COMPLETING SAME QUEST AGAIN (DUPLICATE REJECTION)
  console.log('\n8. Testing Duplicate Quest Completion Rejection...');
  const dupCompRes = await fetch(`${BASE}/quests/${createdQuestId}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(dupCompRes.status === 409, 'Duplicate completion rejected with 409 Conflict');

  // 9. INVENTORY: GET, BUY, USE, SELL
  console.log('\n9. Testing Inventory System...');
  const invRes = await fetch(`${BASE}/inventory`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const invData = await invRes.json();
  assert(invRes.status === 200, 'GET /inventory returns 200 OK');
  assert(Array.isArray(invData.data?.items), 'User inventory items array returned');
  assert(Array.isArray(invData.data?.catalog), 'Shop catalog returned');

  // Buy Health Potion
  const buyRes = await fetch(`${BASE}/inventory/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ itemId: 'health_potion' })
  });
  const buyData = await buyRes.json();
  assert(buyRes.status === 200, 'Buy item returns 200 OK');

  // Use Health Potion
  const useRes = await fetch(`${BASE}/inventory/use`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ itemId: 'health_potion' })
  });
  const useData = await useRes.json();
  assert(useRes.status === 200, 'Use item returns 200 OK');

  // 10. ACHIEVEMENTS
  console.log('\n10. Testing Achievements System...');
  const achRes = await fetch(`${BASE}/achievements`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const achData = await achRes.json();
  assert(achRes.status === 200, 'GET /achievements returns 200 OK');
  const firstQuestAch = achData.data?.find(a => a.id === 'first_quest');
  assert(firstQuestAch?.unlocked === true, 'First Blood achievement automatically unlocked!');

  // 11. STREAK: GET & CHECK-IN
  console.log('\n11. Testing Daily Streak System...');
  const streakRes = await fetch(`${BASE}/streak`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const streakData = await streakRes.json();
  assert(streakRes.status === 200, 'GET /streak returns 200 OK');
  assert(streakData.data?.currentStreak >= 1, 'Current streak is tracked');

  // Duplicate Check-in rejection for same day
  const dupCheckRes = await fetch(`${BASE}/streak/check-in`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(dupCheckRes.status === 400, 'Same-day duplicate check-in rejected with 400');

  // 12. ACTIVITY LOG
  console.log('\n12. Testing Activity History...');
  const actRes = await fetch(`${BASE}/activity`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const actData = await actRes.json();
  assert(actRes.status === 200, 'GET /activity returns 200 OK');
  assert(actData.data?.length >= 3, 'Activity logs populated for quest, level, and items');

  // 13. UNAUTHORIZED ACCESS REJECTION
  console.log('\n13. Testing Security & Unauthorized Access...');
  const unauthRes = await fetch(`${BASE}/character`, {
    headers: { 'Authorization': 'Bearer invalid_or_forged_token' }
  });
  assert(unauthRes.status === 401, 'Forged token rejected with 401 Unauthorized');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
