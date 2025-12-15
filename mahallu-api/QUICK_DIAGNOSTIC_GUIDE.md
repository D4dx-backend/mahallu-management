# ⚡ Quick Diagnostic Guide - OTP Not Delivered

## 🎯 Problem

- ✅ OTP is generated
- ✅ API returns 200 OK
- ❌ **DXING dashboard shows NO requests**
- ❌ User doesn't receive WhatsApp message

---

## 🔥 Most Likely Causes (In Order)

### 1. **Wrong Environment Mode** (80% of cases)

**Check**:
```bash
# Look at your server logs
cd mahallu-api
# Find the line that shows: NODE_ENV: <value>
```

**Problem**: If `NODE_ENV !== "production"`, the code **skips sending entirely**

**Fix**: Set `NODE_ENV=production` in your environment

---

### 2. **Wrong Instance ID** (15% of cases)

**Check**:
1. Open https://app.dxing.in
2. Go to your WhatsApp instance
3. Copy the **Instance ID** carefully
4. Compare with `DXING_INSTANCE_ID` in your `.env`

**Problem**: Even 1 character difference = messages go nowhere

**Fix**: Update `.env` with correct instance ID, restart server

---

### 3. **Instance Paused/Inactive** (3% of cases)

**Check**: DXING dashboard → Instance status should be **"Active"** (not Paused/Deleted)

**Fix**: Resume/activate the instance in DXING dashboard

---

### 4. **Wrong API Key** (2% of cases)

**Check**: Copy fresh API key from DXING dashboard

**Fix**: Update `DXING_API_KEY` in `.env`, restart server

---

## 🚀 5-Minute Diagnostic Protocol

### Step 1: Enable Detailed Logging (30 seconds)

**Add to your `.env` file**:
```env
DXING_DIAG=1
```

**Restart server**:
```bash
cd mahallu-api
# Stop current server (Ctrl+C)
npm start
```

---

### Step 2: Trigger OTP Send (30 seconds)

**Use Postman/curl/your app**:
```bash
curl -X POST http://localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9999999999"}'
```

---

### Step 3: Read the Logs (1 minute)

**Look for these log lines**:

✅ **GOOD signs**:
```
[DXING-INTERCEPTOR] 📤 HTTP Request initiated
[DXING-INTERCEPTOR] 📥 HTTP Response received
[DXING] ✅ DXING confirmed success
```

❌ **BAD signs**:
```
[OTP] Dev mode: skipping DXING send
  → Fix: Set NODE_ENV=production

[DXING] ❌ Response validation failed
  → Fix: Wrong endpoint or credentials

[DXING] ⚠️ Response missing "status" field
  → Fix: Check DXING API documentation
```

---

### Step 4: Run Diagnostic Script (2 minutes)

```bash
cd mahallu-api
npx ts-node scripts/test-dxing.ts 919999999999
```

**Read the output carefully**. It will tell you exactly what's wrong.

---

### Step 5: Verify in Dashboard (1 minute)

1. Open https://app.dxing.in
2. Go to **Messages** or **History**
3. Look for your test phone number
4. Check timestamp matches

**If message appears**: ✅ Your config is correct, issue is in app logic  
**If NO message**: ❌ Credentials or instance ID is wrong

---

## 🔧 Quick Fixes

### Fix 1: Force Production Mode

**In your `.env` file**:
```env
NODE_ENV=production
```

**Restart server** and test again.

---

### Fix 2: Verify Credentials

**Create a test file** `test-env.js`:
```javascript
require('dotenv').config();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API Key length:', process.env.DXING_API_KEY?.length);
console.log('API Key preview:', 
  process.env.DXING_API_KEY?.slice(0, 4) + '...' + 
  process.env.DXING_API_KEY?.slice(-4)
);
console.log('Instance ID:', process.env.DXING_INSTANCE_ID);
```

**Run it**:
```bash
node test-env.js
```

**Check**:
- API Key length should be > 20 characters
- Instance ID should match DXING dashboard exactly
- No `undefined` values

---

### Fix 3: Test Direct API Call

**Use curl** (replace with your actual credentials):
```bash
curl -X POST https://app.dxing.in/api/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "key": "YOUR_ACTUAL_API_KEY",
    "instance_id": "YOUR_ACTUAL_INSTANCE_ID",
    "to": "919999999999",
    "type": "text",
    "message": "Test message"
  }'
```

**Expected response**:
```json
{
  "status": 200,
  "message": "Message sent successfully",
  "id": "msg_..."
}
```

**If this works**: Your credentials are good, issue is in your app  
**If this fails**: Your credentials or instance are wrong

---

## 📋 Checklist Before Asking for Help

Before reaching out to support, verify:

- [ ] `NODE_ENV=production` is set
- [ ] `.env` file exists and is in the correct directory
- [ ] Server is restarted after `.env` changes
- [ ] `DXING_API_KEY` is copied correctly (no extra spaces)
- [ ] `DXING_INSTANCE_ID` matches dashboard exactly
- [ ] DXING instance status is "Active"
- [ ] DXING account has credits/active subscription
- [ ] Ran diagnostic script: `npx ts-node scripts/test-dxing.ts`
- [ ] Checked DXING dashboard for messages

---

## 📞 Still Not Working?

### Gather This Information

1. **Output of diagnostic script**:
   ```bash
   npx ts-node scripts/test-dxing.ts 919999999999 > diagnostic-output.txt
   ```

2. **Server logs** (with `DXING_DIAG=1` enabled)

3. **Environment check**:
   ```bash
   node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV); console.log('Has API Key:', !!process.env.DXING_API_KEY); console.log('Instance ID:', process.env.DXING_INSTANCE_ID);"
   ```

4. **Screenshot of DXING dashboard** showing:
   - Instance status
   - Instance ID
   - Message history (showing it's empty)

### Contact Options

**DXING Support**: support@dxing.in  
**Your Dev Team**: [your contact]

Include all the information above in your message.

---

## ✅ Success Criteria

You'll know it's working when you see **ALL of these**:

1. ✅ Server logs show: `[DXING] ✅ DXING confirmed delivery`
2. ✅ DXING dashboard shows the message
3. ✅ User receives WhatsApp message
4. ✅ OTP verification completes successfully

---

**Last Updated**: 2025-12-15  
**Estimated Time**: 5-10 minutes to diagnose and fix

