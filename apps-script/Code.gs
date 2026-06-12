/**
 * HealthAI Enterprise Backend — Google Apps Script REST API
 * Database: Google Sheets (free, zero hosting cost)
 *
 * SETUP:
 * 1. Create a Google Sheet, copy its ID
 * 2. script.google.com → New project → paste this file
 * 3. Set Script Properties: SHEET_ID, API_SECRET (random string), ADMIN_PASSWORD
 * 4. Run setupSheets() once (authorize when asked)
 * 5. Deploy → Web app → Execute as: Me, Access: Anyone → copy the /exec URL
 * 6. Put URL + API_SECRET into Next.js .env.local
 */

const PROPS = PropertiesService.getScriptProperties();
const SHEET_ID = PROPS.getProperty("SHEET_ID");
const API_SECRET = PROPS.getProperty("API_SECRET");
const ADMIN_PASSWORD = PROPS.getProperty("ADMIN_PASSWORD");

const SHEETS = {
  Customers: ["id", "createdAt", "name", "email", "phone", "language", "plan", "planExpiry", "aiCredits", "accessCode", "profile", "status", "notes"],
  Members: ["id", "customerId", "name", "relation", "age", "gender", "height", "weight", "avatar", "conditions", "createdAt"],
  Records: ["id", "customerId", "memberId", "date", "category", "name", "value", "unit", "normalMin", "normalMax", "createdAt"],
  FoodLogs: ["id", "customerId", "memberId", "date", "meal", "foods", "totalCalories", "totalProtein", "totalCarbs", "totalFat", "nutritionScore", "assessment", "createdAt"],
  Analyses: ["id", "customerId", "createdAt", "overallScore", "riskLevel", "payload"],
  Payments: ["id", "customerId", "createdAt", "provider", "amount", "currency", "plan", "status", "externalRef"],
  Usage: ["timestamp", "customerId", "action", "detail"],
};

// ===== Setup (run once manually) =====
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Object.entries(SHEETS).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  });
  Logger.log("Sheets ready");
}

// ===== HTTP entry points =====
function doGet(e) { return handle(e); }
function doPost(e) { return handle(e); }

function handle(e) {
  try {
    const params = e.parameter || {};
    let body = {};
    if (e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (_) {}
    }
    const req = Object.assign({}, params, body);

    if (req.secret !== API_SECRET) return json({ error: "unauthorized" }, 401);

    const action = req.action;
    const routes = {
      adminLogin: () => ({ ok: req.password === ADMIN_PASSWORD }),
      // Customers
      listCustomers: () => listRows("Customers"),
      getCustomer: () => findRow("Customers", "id", req.id),
      customerByCode: () => findRow("Customers", "accessCode", String(req.code).toUpperCase()),
      createCustomer: () => createCustomer(req.data),
      updateCustomer: () => updateRow("Customers", req.id, req.data),
      deleteCustomer: () => softDelete(req.id),
      // Family members
      listMembers: () => listRows("Members", "customerId", req.customerId),
      addMember: () => appendRow("Members", Object.assign({ id: uid(), createdAt: now() }, req.data)),
      updateMember: () => updateRow("Members", req.id, req.data),
      deleteMember: () => hardDeleteRow("Members", req.id),
      // Records & food
      listRecords: () => listRows("Records", "customerId", req.customerId),
      addRecord: () => appendRow("Records", Object.assign({ id: uid(), createdAt: now() }, req.data)),
      deleteRecord: () => hardDeleteRow("Records", req.id),
      listFoodLogs: () => listRows("FoodLogs", "customerId", req.customerId),
      addFoodLog: () => appendRow("FoodLogs", Object.assign({ id: uid(), createdAt: now() }, req.data)),
      deleteFoodLog: () => hardDeleteRow("FoodLogs", req.id),
      // Analyses
      listAnalyses: () => listRows("Analyses", "customerId", req.customerId),
      addAnalysis: () => appendRow("Analyses", Object.assign({ id: uid(), createdAt: now() }, req.data)),
      // Credits
      useCredit: () => useCredit(req.customerId, req.amount || 1, req.detail || ""),
      addCredits: () => addCredits(req.customerId, Number(req.amount)),
      // Payments
      recordPayment: () => recordPayment(req.data),
      listPayments: () => listRows("Payments", req.customerId ? "customerId" : null, req.customerId),
      // Stats
      stats: () => stats(),
    };

    if (!routes[action]) return json({ error: "unknown action: " + action }, 400);
    return json(routes[action]());
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

// ===== Business logic =====
function createCustomer(data) {
  const row = {
    id: uid(),
    createdAt: now(),
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    language: data.language || "vi",
    plan: data.plan || "free",
    planExpiry: data.planExpiry || "",
    aiCredits: data.aiCredits != null ? data.aiCredits : 5,
    accessCode: genAccessCode(),
    profile: JSON.stringify(data.profile || {}),
    status: "active",
    notes: data.notes || "",
  };
  appendRow("Customers", row);
  return row;
}

function useCredit(customerId, amount, detail) {
  const c = findRow("Customers", "id", customerId);
  if (!c) return { error: "customer not found" };
  // unlimited plans skip deduction
  const unlimited = (c.plan === "pro" || c.plan === "clinic") && (!c.planExpiry || new Date(c.planExpiry) > new Date());
  if (!unlimited) {
    const credits = Number(c.aiCredits) || 0;
    if (credits < amount) return { ok: false, error: "no_credits", aiCredits: credits };
    updateRow("Customers", customerId, { aiCredits: credits - amount });
  }
  appendRow("Usage", { timestamp: now(), customerId: customerId, action: "ai_call", detail: detail });
  return { ok: true, aiCredits: unlimited ? "unlimited" : Number(c.aiCredits) - amount };
}

function addCredits(customerId, amount) {
  const c = findRow("Customers", "id", customerId);
  if (!c) return { error: "customer not found" };
  const next = (Number(c.aiCredits) || 0) + amount;
  updateRow("Customers", customerId, { aiCredits: next });
  return { ok: true, aiCredits: next };
}

function recordPayment(data) {
  const row = Object.assign({ id: uid(), createdAt: now(), status: "completed" }, data);
  appendRow("Payments", row);
  // auto-activate plan
  if (data.plan && data.customerId && row.status === "completed") {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (data.months || 1));
    updateRow("Customers", data.customerId, { plan: data.plan, planExpiry: expiry.toISOString().split("T")[0] });
  }
  return row;
}

function stats() {
  const customers = listRows("Customers");
  const payments = listRows("Payments");
  const active = customers.filter(c => c.status === "active");
  const revenue = payments.filter(p => p.status === "completed")
    .reduce((acc, p) => { acc[p.currency] = (acc[p.currency] || 0) + Number(p.amount); return acc; }, {});
  return {
    totalCustomers: active.length,
    byPlan: active.reduce((acc, c) => { acc[c.plan] = (acc[c.plan] || 0) + 1; return acc; }, {}),
    revenue: revenue,
    paymentsCount: payments.length,
  };
}

function softDelete(id) {
  return updateRow("Customers", id, { status: "deleted" });
}

// ===== Sheet helpers =====
function sheet(name) { return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name); }

function listRows(name, filterCol, filterVal) {
  const sh = sheet(name);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1).map(r => {
    const o = {};
    headers.forEach((h, i) => o[h] = r[i]);
    return o;
  });
  if (filterCol && filterVal != null) return rows.filter(r => String(r[filterCol]) === String(filterVal));
  return rows;
}

function findRow(name, col, val) {
  return listRows(name).find(r => String(r[col]) === String(val)) || null;
}

function appendRow(name, obj) {
  const headers = SHEETS[name];
  sheet(name).appendRow(headers.map(h => obj[h] != null ? obj[h] : ""));
  return obj;
}

function updateRow(name, id, data) {
  const sh = sheet(name);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf("id");
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      Object.entries(data).forEach(([k, v]) => {
        const col = headers.indexOf(k);
        if (col >= 0) sh.getRange(i + 1, col + 1).setValue(typeof v === "object" ? JSON.stringify(v) : v);
      });
      return { ok: true };
    }
  }
  return { error: "not found" };
}

function hardDeleteRow(name, id) {
  const sh = sheet(name);
  const values = sh.getDataRange().getValues();
  const idCol = values[0].indexOf("id");
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) { sh.deleteRow(i + 1); return { ok: true }; }
  }
  return { error: "not found" };
}

// ===== Utils =====
function uid() { return Utilities.getUuid().slice(0, 8) + Date.now().toString(36); }
function now() { return new Date().toISOString(); }
function genAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
function json(obj, status) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
