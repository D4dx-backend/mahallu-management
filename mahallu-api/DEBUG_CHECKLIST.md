# 🔍 OTP Delivery Debug Checklist

## ⚡ Quick Start (5 Minutes)

### 1. Enable Diagnostics
```bash
echo "DXING_DIAG=1" >> .env
npm start
```

### 2. Run Test Script
```bash
npx ts-node scripts/test-dxing.ts 919999999999
```

### 3. Check Output
- ✅ All green checkmarks = Working
- ❌ Any red X = Problem identified

---

## 🎯 Most Common Issues (90% of Cases)

### ❌ Issue: "Dev mode: skipping DXING send"
**Cause**: `NODE_ENV` is not `production`  
**Fix**: Add `NODE_ENV=production` to `.env`, restart

### ❌ Issue: Dashboard empty, logs show Status: 200
**Cause**: Wrong Instance ID  
**Fix**: Copy exact ID from DXING dashboard → `.env`

### ❌ Issue: HTTP 401
**Cause**: Invalid API Key  
**Fix**: Generate new key in DXING → update `.env`

### ❌ Issue: "Response missing status field"
**Cause**: Wrong API endpoint  
**Fix**: Verify URL in DXING documentation

### ❌ Issue: Instance shows as "Paused"
**Cause**: Instance deactivated  
**Fix**: Click "Resume" in DXING dashboard

---

## 📋 Verification Steps

```bash
# 1. Check environment
node -e "require('dotenv').config(); console.log({
  NODE_ENV: process.env.NODE_ENV,
  hasApiKey: !!process.env.DXING_API_KEY,
  keyLength: process.env.DXING_API_KEY?.length,
  instanceId: process.env.DXING_INSTANCE_ID
});"

# 2. Test DNS
nslookup app.dxing.in

# 3. Test connectivity
curl -I https://app.dxing.in

# 4. Run diagnostic
npx ts-node scripts/test-dxing.ts 919999999999

# 5. Check logs
tail -f logs/server.log | grep DXING
```

---

## 🔑 Required Environment Variables

```env
NODE_ENV=production
DXING_API_KEY=your-actual-api-key-here
DXING_INSTANCE_ID=your-instance-id
DXING_DIAG=1
```

---

## ✅ Success Indicators

When working correctly, you'll see:
- `[DXING-INTERCEPTOR] 📤 HTTP Request initiated`
- `[DXING-INTERCEPTOR] 📥 HTTP Response received`
- `[DXING] ✅ DXING confirmed success`
- Message appears in DXING dashboard
- User receives WhatsApp message

---

## 📞 Quick Links

- **DXING Dashboard**: https://app.dxing.in
- **Full Diagnostic Guide**: `QUICK_DIAGNOSTIC_GUIDE.md`
- **Technical Details**: `docs/ROOT_CAUSE_ANALYSIS.md`
- **System Architecture**: `docs/OTP_SYSTEM_ARCHITECTURE.md`

---

**Last Updated**: 2025-12-15

