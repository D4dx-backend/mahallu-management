/**
 * DXING API Diagnostic Test Script
 * 
 * Purpose: Verify DXING configuration and test actual delivery
 * Usage: ts-node scripts/test-dxing.ts [phone_number]
 * 
 * This script bypasses the application logic to test DXING directly
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const DXING_URL = 'https://app.dxing.in/api/send/otp';
const TEST_PHONE = process.argv[2] || '919567374733'; // Get from CLI or use default
const TEST_MESSAGE = '🧪 DXING Test Message\n\nYour OTP is {{otp}}. This is a diagnostic test.\nTimestamp: ' + new Date().toISOString();

async function testDXING() {
  console.log('\n' + '='.repeat(60));
  console.log('🔬 DXING API DIAGNOSTIC TEST');
  console.log('='.repeat(60) + '\n');

  // Step 1: Environment Check
  console.log('📋 Step 1: Environment Variables');
  console.log('-'.repeat(60));
  
  const secret = process.env.DXING_SECRET?.trim();
  const account = process.env.DXING_ACCOUNT?.trim();
  
  console.log('✓ DXING_SECRET exists:', !!secret);
  console.log('  - Length:', secret?.length || 0);
  console.log('  - Preview:', secret ? `${secret.slice(0, 4)}...${secret.slice(-4)}` : 'NOT SET');
  
  console.log('✓ DXING_ACCOUNT exists:', !!account);
  console.log('  - Length:', account?.length || 0);
  console.log('  - Preview:', account ? `${account.slice(0, 3)}...${account.slice(-2)}` : 'NOT SET');
  
  if (!secret || !account) {
    console.error('\n❌ FATAL: Missing credentials. Cannot proceed.\n');
    console.error('Please set DXING_SECRET and DXING_ACCOUNT in your .env file.\n');
    process.exit(1);
  }

  // Step 2: Payload Construction
  console.log('\n📦 Step 2: Payload Construction');
  console.log('-'.repeat(60));
  
  const payload = {
    secret: secret,
    account: account,
    phone: TEST_PHONE,
    type: 'whatsapp',
    message: TEST_MESSAGE,
    priority: 1,
  };

  console.log('Payload structure:');
  console.log(JSON.stringify({
    ...payload,
    secret: `***HIDDEN***`,
    message: payload.message.slice(0, 50) + '...',
  }, null, 2));

  // Step 3: Network Test
  console.log('\n🌐 Step 3: DNS & Network Test');
  console.log('-'.repeat(60));
  
  try {
    const dnsTest = await axios.get('https://app.dxing.in', { timeout: 5000 });
    console.log('✓ DNS resolution successful');
    console.log('✓ HTTPS connection successful');
    console.log('✓ Response status:', dnsTest.status);
  } catch (error: any) {
    console.error('❌ Network test failed:', error.message);
    console.error('  This suggests DNS, firewall, or connectivity issues');
  }

  // Step 4: API Request
  console.log('\n🚀 Step 4: Sending Test Request to DXING');
  console.log('-'.repeat(60));
  console.log('URL:', DXING_URL);
  console.log('Phone:', TEST_PHONE);
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(DXING_URL, payload, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true, // Accept all status codes
    });
    
    const duration = Date.now() - startTime;
    
    console.log('\n📥 Response Received:');
    console.log('-'.repeat(60));
    console.log('HTTP Status:', response.status, response.statusText);
    console.log('Response Time:', duration, 'ms');
    console.log('Content-Type:', response.headers['content-type']);
    console.log('\nResponse Headers:');
    console.log(JSON.stringify(response.headers, null, 2));
    console.log('\nResponse Body:');
    console.log(JSON.stringify(response.data, null, 2));

    // Step 5: Response Analysis
    console.log('\n🔍 Step 5: Response Analysis');
    console.log('-'.repeat(60));
    
    if (response.status === 200) {
      console.log('✓ HTTP 200 OK received');
      
      if (!response.data) {
        console.error('❌ PROBLEM: Empty response body');
        console.error('   Expected: JSON object with status field');
        console.error('   Received: null/undefined');
      } else if (typeof response.data !== 'object') {
        console.error('❌ PROBLEM: Response is not JSON object');
        console.error('   Expected: JSON object');
        console.error('   Received:', typeof response.data);
        console.error('   This suggests wrong endpoint or proxy interference');
      } else {
        console.log('✓ Response is JSON object');
        
        if ('status' in response.data) {
        if (response.data.status === 200 || response.data.status === true) {
          console.log('✅ SUCCESS: DXING confirmed OTP sent');
          console.log('\n🎉 TEST PASSED: Message should appear in DXING dashboard');
          
          if (response.data.data) {
            console.log('✓ Message ID:', response.data.data.messageId);
            console.log('✓ OTP Generated:', response.data.data.otp);
            console.log('✓ Phone:', response.data.data.phone);
          }
        } else {
          console.error('❌ DXING API Error:');
          console.error('   Status:', response.data.status);
          console.error('   Message:', response.data.message || 'No error message');
          console.error('   Full response:', response.data);
        }
      } else {
        console.warn('⚠️  WARNING: Response missing "status" field');
        console.warn('   This is unusual for DXING OTP API');
        console.warn('   Possible issues:');
        console.warn('   - Wrong API endpoint (should be /api/send/otp)');
        console.warn('   - Outdated API version');
        console.warn('   - Proxy returning different response');
      }
      }
    } else if (response.status === 401) {
      console.error('❌ AUTHENTICATION FAILED');
      console.error('   HTTP 401 Unauthorized');
      console.error('   Possible causes:');
      console.error('   - Invalid DXING_SECRET');
      console.error('   - Secret expired or revoked');
      console.error('   - Secret not activated');
    } else if (response.status === 404) {
      console.error('❌ ENDPOINT NOT FOUND');
      console.error('   HTTP 404 Not Found');
      console.error('   Possible causes:');
      console.error('   - Wrong API URL (should be /api/send/otp)');
      console.error('   - Invalid account ID');
    } else if (response.status >= 500) {
      console.error('❌ SERVER ERROR');
      console.error('   HTTP', response.status);
      console.error('   DXING server is experiencing issues');
    } else {
      console.error('❌ UNEXPECTED STATUS:', response.status);
      console.error('   Response:', response.data);
    }

  } catch (error: any) {
    console.error('\n❌ REQUEST FAILED');
    console.error('-'.repeat(60));
    
    if (error.code === 'ECONNABORTED') {
      console.error('Error: Request timeout');
      console.error('  The server did not respond within 15 seconds');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Error: DNS resolution failed');
      console.error('  Cannot find app.dxing.in');
      console.error('  Check your internet connection or DNS settings');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Error: Connection refused');
      console.error('  Server actively rejected the connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Error: Connection timeout');
      console.error('  Cannot establish connection to DXING');
    } else {
      console.error('Error:', error.message);
    }
    
    if (error.response) {
      console.error('\nServer responded with:');
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
    
    console.error('\nFull error details:');
    console.error(error);
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. Check the response body above');
  console.log('2. Log into DXING dashboard: https://app.dxing.in');
  console.log('3. Navigate to Message Logs / History');
  console.log('4. Look for message to:', TEST_PHONE);
  console.log('5. Compare timestamp:', new Date().toISOString());
  console.log('\nIf message does NOT appear in dashboard but got HTTP 200:');
  console.log('  → Wrong API endpoint (verify DXING docs)');
  console.log('  → Invalid instance ID (check dashboard settings)');
  console.log('  → Instance is paused/inactive');
  console.log('  → Account restrictions (sandbox mode, payment issues)');
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run the test
testDXING().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

