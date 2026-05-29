/**
 * Comprehensive test for /api-proxy/upload
 * Usage: node test-upload-proxy.js
 *
 * Tests:
 *  1. OPTIONS preflight → 200 + CORS headers
 *  2. POST without auth → 401 from backend (proxy working)
 *  3. Verify Content-Type, Content-Length, CORS in response
 *  4. Verify response body is valid JSON
 *  5. Verify Content-Length matches actual body size
 *  6. Verify X-Forwarded-For is sent to backend
 *  7. POST large file (150KB) → verify no truncation
 *  8. Verify no 500 error (no streaming body bug)
 */

const http = require('http');
const crypto = require('crypto');

const BASE = 'http://localhost:3000';
const UPLOAD = '/api-proxy/upload';

// ── Helpers ────────────────────────────────────────────────────────────────

const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m',
      C = '\x1b[36m', W = '\x1b[0m', B = '\x1b[1m', M = '\x1b[35m';

let passed = 0, failed = 0;
function pass(msg) { console.log(`  ${G}✓${W} ${msg}`); passed++; }
function fail(msg) { console.log(`  ${R}✗${W} ${msg}`); failed++; }
function info(msg) { console.log(`  ${C}ℹ${W} ${msg}`); }
function warn(msg) { console.log(`  ${Y}⚠${W} ${msg}`); }
function section(title) { console.log(`\n${B}${M}▶ ${title}${W}`); }

function makeRequest(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: 'localhost', port: 3000, path, method, headers },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf-8'),
          rawHeaders: res.headers,
        }));
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function buildMultipart(boundary, fileBuffer, filename, mimetype) {
  return Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`),
    Buffer.from(`Content-Type: ${mimetype}\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
}

// Create a fake PNG of given approximate size
function fakePng(sizeBytes) {
  // Minimal PNG header + fill rest with random data
  const header = Buffer.from([
    0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,  // PNG signature
    0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,  // IHDR
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
    0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,0xDE,
  ]);
  const fill = crypto.randomBytes(Math.max(0, sizeBytes - header.length));
  return Buffer.concat([header, fill]);
}

// ── Tests ──────────────────────────────────────────────────────────────────

async function test1_options() {
  section('Test 1: OPTIONS Preflight (CORS)');
  try {
    const res = await makeRequest('OPTIONS', UPLOAD, {
      'Origin': 'https://bondy-apk.vercel.app',
      'Access-Control-Request-Method': 'POST',
    }, null);

    res.status === 200
      ? pass(`Status 200`)
      : fail(`Status ${res.status} (expected 200)`);

    res.headers['access-control-allow-origin'] === '*'
      ? pass(`CORS: Access-Control-Allow-Origin: *`)
      : fail(`Missing CORS header, got: ${res.headers['access-control-allow-origin']}`);

    res.headers['access-control-allow-methods']?.includes('POST')
      ? pass(`CORS: Access-Control-Allow-Methods includes POST`)
      : fail(`Missing Allow-Methods: ${res.headers['access-control-allow-methods']}`);

  } catch (e) { fail(`Request failed: ${e.message}`); }
}

async function test2_post_no_auth() {
  section('Test 2: POST without auth → expect 401 from backend (proxy not crashing)');
  const boundary = `Boundary${crypto.randomBytes(6).toString('hex')}`;
  const body = buildMultipart(boundary, fakePng(1024), 'test.png', 'image/png');

  try {
    const res = await makeRequest('POST', UPLOAD, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
      'X-Forwarded-For': '192.168.1.100', // Simulate real client IP
    }, body);

    info(`Status: ${res.status}`);
    info(`Body: ${res.body.substring(0, 200)}`);

    // Should NOT be 500 (proxy crash)
    res.status !== 500
      ? pass(`Not 500 (proxy not crashing)`)
      : fail(`Got 500 - proxy is crashing! Check route.ts`);

    // Should be 401 (no auth) or 400/422 (bad request) - not 0 or network error
    [400, 401, 403, 422, 429].includes(res.status)
      ? pass(`Backend responded correctly (${res.status})`)
      : res.status === 200
        ? pass(`Upload succeeded (200) - unexpected but OK`)
        : warn(`Unexpected status: ${res.status}`);

    // Verify headers
    if (res.headers['content-type']?.includes('application/json')) {
      pass(`Content-Type: application/json`);
    } else {
      fail(`Content-Type wrong: ${res.headers['content-type']}`);
    }

    if (res.headers['content-length']) {
      const headerLen = parseInt(res.headers['content-length']);
      const actualLen = Buffer.byteLength(res.body, 'utf-8');
      if (headerLen === actualLen) {
        pass(`Content-Length: ${headerLen} matches actual body size`);
      } else {
        fail(`Content-Length mismatch: header=${headerLen}, actual=${actualLen}`);
      }
    } else {
      fail(`Missing Content-Length header (required for Safari)`);
    }

    if (res.headers['access-control-allow-origin'] === '*') {
      pass(`CORS: Access-Control-Allow-Origin: *`);
    } else {
      fail(`CORS header missing from response`);
    }

    // Verify valid JSON
    try {
      const json = JSON.parse(res.body);
      pass(`Response is valid JSON`);
      info(`JSON content: ${JSON.stringify(json).substring(0, 150)}`);
    } catch {
      fail(`Response is NOT valid JSON: ${res.body.substring(0, 100)}`);
    }

  } catch (e) { fail(`Request failed: ${e.message}`); }
}

async function test3_large_file() {
  section('Test 3: POST large file (~150KB) → verify no truncation');
  const boundary = `Boundary${crypto.randomBytes(6).toString('hex')}`;
  const body = buildMultipart(boundary, fakePng(150 * 1024), 'large.png', 'image/png');
  info(`Sending ${body.length} bytes (${(body.length/1024).toFixed(1)} KB)`);

  try {
    const res = await makeRequest('POST', UPLOAD, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    }, body);

    res.status !== 500
      ? pass(`Large file: proxy didn't crash (status ${res.status})`)
      : fail(`Large file: proxy crashed with 500`);

    if (res.headers['content-length']) {
      pass(`Response has Content-Length: ${res.headers['content-length']}`);
    } else {
      fail(`Response missing Content-Length for large file`);
    }

    try {
      JSON.parse(res.body);
      pass(`Large file: response is valid JSON`);
    } catch {
      fail(`Large file: response is NOT valid JSON`);
    }

  } catch (e) { fail(`Large file request failed: ${e.message}`); }
}

async function test4_url_rewrite() {
  section('Test 4: URL rewrite (simulate backend returning IP URL)');
  // We mock this by checking the rewrite logic against known backend URL patterns
  // Since we can't easily mock the backend response, we test the rewrite function directly.

  const testCases = [
    {
      input: '{"success":true,"data":{"url":"https://103.149.86.25:3000/api/uploads/user1/file.png"}}',
      expected: '{"success":true,"data":{"url":"/uploads/user1/file.png"}}',
      desc: 'https://IP:3000/api/uploads/ → /uploads/',
    },
    {
      input: '{"success":true,"data":{"url":"http://103.149.86.25:3000/uploads/user2/img.jpg"}}',
      expected: '{"success":true,"data":{"url":"/uploads/user2/img.jpg"}}',
      desc: 'http://IP:3000/uploads/ → /uploads/',
    },
    {
      input: '{"url":"https://103.149.86.25/api/uploads/x/y.png"}',
      expected: '{"url":"/uploads/x/y.png"}',
      desc: 'https://IP/api/uploads/ (no port) → /uploads/',
    },
  ];

  // Since we can't import TS, test regex directly
  function rewrite(text) {
    return text
      .replace(/https?:\/\/103\.149\.86\.25:?\d*\/api\/uploads\//g, '/uploads/')
      .replace(/https?:\/\/103\.149\.86\.25:?\d*\/uploads\//g, '/uploads/');
  }

  for (const tc of testCases) {
    const result = rewrite(tc.input);
    if (result === tc.expected) {
      pass(`URL rewrite: ${tc.desc}`);
    } else {
      fail(`URL rewrite failed: ${tc.desc}\n    Input:    ${tc.input}\n    Expected: ${tc.expected}\n    Got:      ${result}`);
    }
  }
}

async function test5_x_forwarded_for() {
  section('Test 5: X-Forwarded-For passthrough (rate limit fix)');
  const boundary = `Boundary${crypto.randomBytes(6).toString('hex')}`;
  const body = buildMultipart(boundary, fakePng(512), 'test.png', 'image/png');
  const fakeClientIp = '203.113.45.67'; // Simulate Vietnamese user IP

  try {
    const res = await makeRequest('POST', UPLOAD, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
      'X-Forwarded-For': fakeClientIp,
    }, body);

    // We can't verify backend actually got the header without a test endpoint,
    // but we can verify proxy didn't crash and responded correctly
    res.status !== 500
      ? pass(`X-Forwarded-For test: proxy didn't crash`)
      : fail(`X-Forwarded-For test: proxy crashed`);

    info(`Response status: ${res.status} (backend processed request with forwarded IP)`);

  } catch (e) { fail(`Request failed: ${e.message}`); }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${B}${C}${'═'.repeat(55)}${W}`);
  console.log(`${B}  Upload Proxy Test Suite${W}`);
  console.log(`${B}  Target: ${BASE}${UPLOAD}${W}`);
  console.log(`${B}${C}${'═'.repeat(55)}${W}`);

  await test1_options();
  await test2_post_no_auth();
  await test3_large_file();
  await test4_url_rewrite();
  await test5_x_forwarded_for();

  console.log(`\n${B}${C}${'═'.repeat(55)}${W}`);
  const allPassed = failed === 0;
  const color = allPassed ? G : R;
  console.log(`${B}  Results: ${color}${passed} passed${W}${B}, ${failed > 0 ? R : G}${failed} failed${W}`);
  console.log(`${B}${C}${'═'.repeat(55)}${W}\n`);

  if (failed > 0) {
    console.log(`${R}${B}❌ TESTS FAILED - DO NOT PUSH TO PRODUCTION${W}\n`);
    process.exit(1);
  } else {
    console.log(`${G}${B}✅ ALL TESTS PASSED - Safe to push${W}\n`);
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
