import { parseSessionToken, createSessionToken } from "@/lib/adminAuth";
import { normalizeAdminRole } from "@/lib/adminRoles";
import { findMongoAdminUser, getMongoDb } from "@/lib/adminMongo";

async function runTests() {
  console.log("=== STARTING ROLE-BASED ACCESS & PERSISTENCE VERIFICATION ===");

  // 1. Verify normalization of typo variations
  console.log("\n--- TEST 1: Role Normalization ---");
  const testInputs = [
    { input: "analatic", expected: "analytics_viewer" },
    { input: "analytics", expected: "analytics_viewer" },
    { input: "Analytics Viewer", expected: "analytics_viewer" },
    { input: "analytics_viewer", expected: "analytics_viewer" },
    { input: "content creator", expected: "content_editor" },
    { input: "content_editor", expected: "content_editor" },
    { input: "Content Editor", expected: "content_editor" },
    { input: "machine manager", expected: "machine_manager" },
    { input: "super_admin", expected: "super_admin" },
  ];

  for (const { input, expected } of testInputs) {
    const res = normalizeAdminRole(input);
    if (res !== expected) {
      throw new Error(`Normalization failed for '${input}': got '${res}', expected '${expected}'`);
    }
    console.log(`✓ Normalization: '${input}' -> '${res}'`);
  }

  // 2. Test direct authentication for amanhaider.pk@gmail.com
  console.log("\n--- TEST 2: Existing User Login for amanhaider.pk@gmail.com ---");
  const { POST: loginHandler } = await import("@/app/api/admin/login/route");
  
  const loginReq = new Request("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "amanhaider.pk@gmail.com",
      password: "Asdf1234@@",
    }),
  });

  const loginRes = await loginHandler(loginReq as any);
  const loginJson = await loginRes.json();
  console.log("Login response status:", loginRes.status);
  console.log("Login JSON:", loginJson);

  if (loginJson.user?.role !== "analytics_viewer") {
    throw new Error(`Expected role 'analytics_viewer', got '${loginJson.user?.role}'`);
  }
  console.log("✓ amanhaider.pk@gmail.com logged in successfully with role 'analytics_viewer'!");

  // Verify cookie session token
  const setCookie = loginRes.cookies.get("__cxs")?.value;
  if (!setCookie) throw new Error("No session cookie set on login!");
  const sessionUser = await parseSessionToken(setCookie);
  if (sessionUser?.role !== "analytics_viewer") {
    throw new Error(`Session cookie has role '${sessionUser?.role}', expected 'analytics_viewer'`);
  }
  console.log("✓ Session token correctly decodes role:", sessionUser.role);

  // 3. Test Full Invitation -> Verification -> Login Cycle for a new Analytics User
  console.log("\n--- TEST 3: New Invitation -> Verification -> Login Lifecycle ---");
  const testEmail = `analytics.test.${Date.now()}@gmail.com`;
  const testPass = "SecurePass123!@";

  const { POST: rolesHandler } = await import("@/app/api/admin/roles/route");

  // Create super admin session cookie
  const superToken = await createSessionToken({
    id: "usr-super-pvs",
    email: "pvs178380@gmail.com",
    name: "Super Admin",
    role: "super_admin",
  });

  const inviteReq = new Request("http://localhost:3000/api/admin/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `__cxs=${superToken}`,
    },
    body: JSON.stringify({
      action: "invite",
      email: testEmail,
      name: "Analytics Tester",
      role: "analatic", // Test typo handling!
    }),
  });

  const inviteRes = await rolesHandler(inviteReq as any);
  const inviteJson = await inviteRes.json();
  console.log("Invite Response:", inviteJson);

  if (inviteJson.invitation?.role !== "analytics_viewer") {
    throw new Error(`Invite role should be 'analytics_viewer', got '${inviteJson.invitation?.role}'`);
  }
  console.log("✓ Magic link invitation created with normalized role 'analytics_viewer'!");

  const inviteToken = inviteJson.invitation.token;
  const tempPassword = inviteJson.tempPassword;

  // 4. Test Verification GET route
  const { GET: verifyGetHandler, POST: verifyPostHandler } = await import("@/app/api/admin/invite/verify/route");
  const getUrl = `http://localhost:3000/api/admin/invite/verify?token=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(testEmail)}`;
  const verifyGetRes = await verifyGetHandler(new Request(getUrl) as any);
  const verifyGetJson = await verifyGetRes.json();
  console.log("Verify GET response:", verifyGetJson);

  if (verifyGetJson.role !== "analytics_viewer") {
    throw new Error(`Verify GET should return 'analytics_viewer', got '${verifyGetJson.role}'`);
  }
  console.log("✓ Verify GET returned role 'analytics_viewer'!");

  // 5. Test Verification POST route (Accepting Invitation)
  const verifyPostReq = new Request("http://localhost:3000/api/admin/invite/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: inviteToken,
      email: testEmail,
      tempPassword: tempPassword,
      newPassword: testPass,
    }),
  });

  const verifyPostRes = await verifyPostHandler(verifyPostReq as any);
  const verifyPostJson = await verifyPostRes.json();
  console.log("Verify POST response:", verifyPostJson);

  if (verifyPostJson.role !== "analytics_viewer") {
    throw new Error(`Verify POST should return 'analytics_viewer', got '${verifyPostJson.role}'`);
  }
  console.log("✓ Account activated with role 'analytics_viewer'!");

  // Verify in MongoDB Atlas
  const mongoUser = await findMongoAdminUser(testEmail);
  if (!mongoUser || mongoUser.role !== "analytics_viewer") {
    throw new Error(`MongoDB user record missing or has role '${mongoUser?.role}' instead of 'analytics_viewer'`);
  }
  console.log("✓ Verified in MongoDB Atlas: role is 'analytics_viewer'!");

  // 6. Test Login with New Credentials
  const newLoginReq = new Request("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPass,
    }),
  });

  const newLoginRes = await loginHandler(newLoginReq as any);
  const newLoginJson = await newLoginRes.json();
  console.log("New User Login JSON:", newLoginJson);

  if (newLoginJson.user?.role !== "analytics_viewer") {
    throw new Error(`Login after activation returned role '${newLoginJson.user?.role}', expected 'analytics_viewer'`);
  }
  console.log("✓ New user logged in successfully and received role 'analytics_viewer'!");

  // 7. Test Updating Role from Super Admin table
  console.log("\n--- TEST 4: Super Admin Role Update in Table ---");
  const updateReq = new Request("http://localhost:3000/api/admin/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `__cxs=${superToken}`,
    },
    body: JSON.stringify({
      action: "update_role",
      userId: mongoUser.id,
      email: testEmail,
      newRole: "machine_manager",
    }),
  });

  const updateRes = await rolesHandler(updateReq as any);
  const updateJson = await updateRes.json();
  console.log("Update Role response:", updateJson);

  if (updateJson.user?.role !== "machine_manager") {
    throw new Error(`Role update failed, got '${updateJson.user?.role}'`);
  }

  // Next login should reflect machine_manager
  const updatedLoginReq = new Request("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPass,
    }),
  });
  const updatedLoginRes = await loginHandler(updatedLoginReq as any);
  const updatedLoginJson = await updatedLoginRes.json();
  if (updatedLoginJson.user?.role !== "machine_manager") {
    throw new Error(`Expected role 'machine_manager' after update, got '${updatedLoginJson.user?.role}'`);
  }
  console.log("✓ Role update to 'machine_manager' verified in DB and login!");

  // Clean up test user
  const db = await getMongoDb();
  await db.collection("adminusers").deleteOne({ email: testEmail });
  await db.collection("admininvitations").deleteOne({ email: testEmail });
  console.log("✓ Cleaned up temporary test user.");

  console.log("\n=======================================================");
  console.log("ALL ROLE VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀");
  console.log("=======================================================");
  process.exit(0);
}

runTests().catch(err => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
