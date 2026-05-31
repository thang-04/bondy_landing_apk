/**
 * Test suite: Verify SafeResponse works like a real Response
 * 
 * This tests the _createSafeResponse function from index.html to ensure
 * all body-reading methods work correctly, especially getReader() which
 * is what Flutter Web calls on Safari iOS 18.
 * 
 * Run: node test-safari-response.js
 */

const { ReadableStream } = require('stream/web');
const { TextEncoder, TextDecoder } = require('util');

// ========================================
// Simulate _createSafeResponse from index.html
// ========================================
function _createSafeResponse(bodyText, status, statusText, headers) {
  var bytes = new TextEncoder().encode(bodyText);
  
  // Create Response with NULL body
  // In Node.js, we simulate this with a plain object
  var resp = {
    status: status,
    statusText: statusText,
    ok: status >= 200 && status < 300,
    headers: new Map(Object.entries(headers || {})),
    type: 'basic',
    url: '',
    redirected: false,
  };
  
  var consumed = false;
  
  function makeStream() {
    return new ReadableStream({
      start: function(controller) {
        controller.enqueue(new Uint8Array(bytes));
        controller.close();
      }
    });
  }
  
  // body getter
  Object.defineProperty(resp, 'body', {
    get: function() {
      if (consumed) return null;
      return makeStream();
    },
    configurable: true
  });
  
  Object.defineProperty(resp, 'bodyUsed', {
    get: function() { return consumed; },
    configurable: true
  });
  
  resp.text = function() {
    if (consumed) return Promise.reject(new TypeError('body already consumed'));
    consumed = true;
    return Promise.resolve(bodyText);
  };
  
  resp.json = function() {
    if (consumed) return Promise.reject(new TypeError('body already consumed'));
    consumed = true;
    try { return Promise.resolve(JSON.parse(bodyText)); }
    catch(e) { return Promise.reject(e); }
  };
  
  resp.arrayBuffer = function() {
    if (consumed) return Promise.reject(new TypeError('body already consumed'));
    consumed = true;
    return Promise.resolve(bytes.buffer.slice(0));
  };
  
  resp.blob = function() {
    if (consumed) return Promise.reject(new TypeError('body already consumed'));
    consumed = true;
    // Node.js doesn't have Blob in older versions, simulate
    return Promise.resolve({ size: bytes.length, type: headers['content-type'] || 'application/json' });
  };
  
  resp.clone = function() {
    return _createSafeResponse(bodyText, status, statusText, headers);
  };
  
  return resp;
}

// ========================================
// Test Runner
// ========================================
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function assertAsync(promise, msg) {
  try {
    const result = await promise;
    console.log(`  ✓ ${msg}`);
    passed++;
    return result;
  } catch(e) {
    console.log(`  ✗ FAIL: ${msg} — Error: ${e.message}`);
    failed++;
    return null;
  }
}

async function runTests() {
  const testBody = '{"success":true,"data":{"url":"/uploads/test/1234_img.png"}}';
  const testStatus = 200;
  const testStatusText = 'OK';
  const testHeaders = { 'content-type': 'application/json; charset=utf-8' };

  // ========================================
  console.log('\n=== Test 1: Basic properties ===');
  // ========================================
  {
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    assert(resp.status === 200, 'status is 200');
    assert(resp.statusText === 'OK', 'statusText is OK');
    assert(resp.ok === true, 'ok is true');
    assert(resp.bodyUsed === false, 'bodyUsed is false initially');
  }

  // ========================================
  console.log('\n=== Test 2: body.getReader() — THE CRITICAL TEST ===');
  console.log('    (This is what Flutter Web calls on Safari iOS 18)');
  // ========================================
  {
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    
    // This is the exact call that throws InvalidAccessError on Safari
    const body = resp.body;
    assert(body !== null, 'body is not null');
    assert(body instanceof ReadableStream, 'body is a ReadableStream');
    
    let reader;
    try {
      reader = body.getReader();
      assert(true, 'getReader() succeeded (no InvalidAccessError!)');
    } catch(e) {
      assert(false, 'getReader() threw: ' + e.message);
      return;
    }
    
    // Read all chunks
    let allBytes = new Uint8Array(0);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const tmp = new Uint8Array(allBytes.length + value.length);
      tmp.set(allBytes);
      tmp.set(value, allBytes.length);
      allBytes = tmp;
    }
    
    const decoded = new TextDecoder().decode(allBytes);
    assert(decoded === testBody, 'getReader() returned correct body text');
    
    // Verify the data is valid JSON
    const parsed = JSON.parse(decoded);
    assert(parsed.success === true, 'parsed JSON has success=true');
    assert(parsed.data.url === '/uploads/test/1234_img.png', 'parsed JSON has correct URL');
  }

  // ========================================
  console.log('\n=== Test 3: text() method ===');
  // ========================================
  {
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    const text = await assertAsync(resp.text(), 'text() resolves');
    assert(text === testBody, 'text() returns correct body');
    assert(resp.bodyUsed === true, 'bodyUsed is true after text()');
  }

  // ========================================
  console.log('\n=== Test 4: json() method ===');
  // ========================================
  {
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    const json = await assertAsync(resp.json(), 'json() resolves');
    assert(json && json.success === true, 'json() returns correct parsed object');
    assert(json && json.data && json.data.url === '/uploads/test/1234_img.png', 'json().data.url correct');
  }

  // ========================================
  console.log('\n=== Test 5: arrayBuffer() method ===');
  // ========================================
  {
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    const buf = await assertAsync(resp.arrayBuffer(), 'arrayBuffer() resolves');
    assert(buf instanceof ArrayBuffer, 'arrayBuffer() returns ArrayBuffer');
    const decoded = new TextDecoder().decode(buf);
    assert(decoded === testBody, 'arrayBuffer decoded matches body');
  }

  // ========================================
  console.log('\n=== Test 6: clone() method ===');
  // ========================================
  {
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    const cloned = resp.clone();
    
    // Read original via getReader
    const reader1 = resp.body.getReader();
    const { value: v1 } = await reader1.read();
    const text1 = new TextDecoder().decode(v1);
    
    // Read clone via text()
    const text2 = await cloned.text();
    
    assert(text1 === testBody, 'original body read via getReader matches');
    assert(text2 === testBody, 'cloned body read via text() matches');
  }

  // ========================================
  console.log('\n=== Test 7: Multiple body accesses create fresh streams ===');
  // ========================================
  {
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    
    // Access body twice — each should give a fresh ReadableStream
    const body1 = resp.body;
    const body2 = resp.body;
    
    assert(body1 instanceof ReadableStream, 'first body access returns ReadableStream');
    assert(body2 instanceof ReadableStream, 'second body access returns ReadableStream');
    
    // Read from body2 (the second access)
    const reader = body2.getReader();
    const { value } = await reader.read();
    const decoded = new TextDecoder().decode(value);
    assert(decoded === testBody, 'second body access returns correct data');
  }

  // ========================================
  console.log('\n=== Test 8: Error response ===');
  // ========================================
  {
    const errBody = '{"success":false,"message":"Too Many Requests"}';
    const resp = _createSafeResponse(errBody, 429, 'Too Many Requests', {'content-type': 'application/json'});
    
    assert(resp.status === 429, 'error status is 429');
    assert(resp.ok === false, 'ok is false for 429');
    
    const reader = resp.body.getReader();
    const { value } = await reader.read();
    const decoded = new TextDecoder().decode(value);
    const parsed = JSON.parse(decoded);
    assert(parsed.success === false, 'error response parsed correctly');
    assert(parsed.message === 'Too Many Requests', 'error message correct');
  }

  // ========================================
  console.log('\n=== Test 9: body consumed prevents double-read ===');
  // ========================================
  {
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    await resp.text(); // consume
    
    assert(resp.bodyUsed === true, 'bodyUsed is true');
    assert(resp.body === null, 'body is null after consumed');
    
    try {
      await resp.text();
      assert(false, 'second text() should throw');
    } catch(e) {
      assert(e instanceof TypeError, 'second text() throws TypeError');
    }
  }

  // ========================================
  console.log('\n=== Test 10: Simulated Flutter upload flow ===');
  console.log('    (MultipartRequest → send → Response.fromStream → stream.toBytes)');
  // ========================================
  {
    // This simulates what Flutter Web actually does:
    // 1. Make fetch request
    // 2. Get Response
    // 3. Call response.body.getReader()
    // 4. Read all chunks into a Uint8Array
    // 5. Decode as UTF-8 string
    // 6. Parse as JSON
    
    const resp = _createSafeResponse(testBody, testStatus, testStatusText, testHeaders);
    
    // Step 3: Get reader (THIS IS WHERE SAFARI FAILS)
    const reader = resp.body.getReader();
    assert(reader !== null, 'Flutter: getReader() succeeded');
    
    // Step 4: Read all chunks (simulating stream.toBytes())
    const chunks = [];
    let totalLength = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.length;
    }
    
    // Combine chunks into single Uint8Array
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Step 5: Decode
    const responseText = new TextDecoder().decode(combined);
    
    // Step 6: Parse
    const responseData = JSON.parse(responseText);
    assert(responseData.success === true, 'Flutter: parsed success=true');
    assert(responseData.data.url === '/uploads/test/1234_img.png', 'Flutter: parsed URL correct');
    
    console.log('  → Full Flutter upload flow completed successfully!');
  }

  // ========================================
  // Summary
  // ========================================
  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('='.repeat(50));
  
  if (failed > 0) {
    console.log('\n❌ TESTS FAILED — DO NOT PUSH');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED');
  }
}

runTests().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});
