#!/usr/bin/env node

/**
 * Simple Backend API Status Checker
 * Tests all endpoints for localhost:3000 backend
 */

const BASE_URL = 'http://localhost:3000';

// ANSI color codes for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP requests
async function makeRequest(method, url, body = null, expectedStatuses = [200, 201]) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`Making ${method} request to: ${url}`);
    const response = await fetch(url, options);
    const isSuccess = expectedStatuses.includes(response.status);

    let responseData = null;
    try {
      const text = await response.text();
      // Try to parse as JSON first
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        // If not JSON, use as plain text
        responseData = text;
      }
    } catch (e) {
      responseData = null;
    }

    return {
      success: isSuccess,
      status: response.status,
      statusText: response.statusText,
      data: responseData
    };
  } catch (error) {
    console.log(`Request failed with error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      status: 0
    };
  }
}

// Logging helpers
function logTest(testName, result, details = '') {
  totalTests++;
  if (result.success) {
    passedTests++;
    console.log(`${colors.green}✓${colors.reset} ${testName} ${colors.green}PASSED${colors.reset} (${result.status}) ${details}`);
  } else {
    failedTests++;
    const errorMsg = result.error || `Status: ${result.status} ${result.statusText}`;
    console.log(`${colors.red}✗${colors.reset} ${testName} ${colors.red}FAILED${colors.reset} - ${errorMsg} ${details}`);
  }
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`);
}

// Check if backend is running
async function checkBackendStatus() {
  logSection('Backend Status Check');

  try {
    const result = await makeRequest('GET', BASE_URL, null, [200, 404, 301, 302]);
    if (result.status === 0) {
      console.log(`${colors.red}❌ Backend is not running on ${BASE_URL}${colors.reset}`);
      console.log(`${colors.yellow}Please start your backend server first.${colors.reset}`);
      return false;
    } else {
      console.log(`${colors.green}✓ Backend is responding on ${BASE_URL} (Status: ${result.status})${colors.reset}`);
      console.log(`Response: ${JSON.stringify(result.data).slice(0, 100)}...`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Cannot connect to backend: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test Doctors API endpoints
async function testDoctorsAPI() {
  logSection('Doctors API Tests');

  // GET /api/v1/doctors
  const getDoctors = await makeRequest('GET', `${BASE_URL}/api/v1/doctors`);
  logTest('GET /api/v1/doctors', getDoctors);

  let testDoctorId = null;

  // POST /api/v1/doctors (Create test doctor)
  const mockDoctor = {
    name: 'Dr. Test Physician',
    email: `test.doctor.${Date.now()}@example.com`,
    specialization: 'General Practice',
    phone: `555-${Math.floor(Math.random() * 9000) + 1000}`
  };

  const createDoctor = await makeRequest('POST', `${BASE_URL}/api/v1/doctors`, mockDoctor);
  logTest('POST /api/v1/doctors', createDoctor);

  if (createDoctor.success && createDoctor.data) {
    // Try different possible ID field names
    testDoctorId = createDoctor.data.id || createDoctor.data.idDoctor || createDoctor.data._id;
  } else if (getDoctors.success && getDoctors.data && Array.isArray(getDoctors.data) && getDoctors.data.length > 0) {
    testDoctorId = getDoctors.data[0].id || getDoctors.data[0].idDoctor || getDoctors.data[0]._id;
  }

  if (testDoctorId) {
    // GET /api/v1/doctors/:id
    const getDoctor = await makeRequest('GET', `${BASE_URL}/api/v1/doctors/${testDoctorId}`);
    logTest(`GET /api/v1/doctors/${testDoctorId}`, getDoctor);

    // PATCH /api/v1/doctors/:id
    const updateDoctor = await makeRequest('PATCH', `${BASE_URL}/api/v1/doctors/${testDoctorId}`, {
      specialization: 'Updated Specialization'
    });
    logTest(`PATCH /api/v1/doctors/${testDoctorId}`, updateDoctor);

    // DELETE /api/v1/doctors/:id (only if we created it)
    if (createDoctor.success) {
      const deleteDoctor = await makeRequest('DELETE', `${BASE_URL}/api/v1/doctors/${testDoctorId}`, null, [200, 204]);
      logTest(`DELETE /api/v1/doctors/${testDoctorId}`, deleteDoctor);
    }
  } else {
    console.log(`${colors.yellow}⚠ Skipping individual doctor tests - no doctor ID available${colors.reset}`);
  }
}

// Test Patients API endpoints
async function testPatientsAPI() {
  logSection('Patients API Tests');

  // GET /api/v1/patients
  const getPatients = await makeRequest('GET', `${BASE_URL}/api/v1/patients`);
  logTest('GET /api/v1/patients', getPatients);

  let testPatientId = null;

  // POST /api/v1/patients (Create test patient)
  const mockPatient = {
    name: 'Test Patient',
    phone: `555-${Math.floor(Math.random() * 9000) + 1000}`,
    email: `test.patient.${Date.now()}@example.com`,
    dateOfBirth: '1990-01-01',
    insurance: 'Test Insurance'
  };

  const createPatient = await makeRequest('POST', `${BASE_URL}/api/v1/patients`, mockPatient);
  logTest('POST /api/v1/patients', createPatient);

  if (createPatient.success && createPatient.data) {
    testPatientId = createPatient.data.id || createPatient.data.idPatient || createPatient.data._id;
  } else if (getPatients.success && getPatients.data && Array.isArray(getPatients.data) && getPatients.data.length > 0) {
    testPatientId = getPatients.data[0].id || getPatients.data[0].idPatient || getPatients.data[0]._id;
  }

  if (testPatientId) {
    // GET /api/v1/patients/:id
    const getPatient = await makeRequest('GET', `${BASE_URL}/api/v1/patients/${testPatientId}`);
    logTest(`GET /api/v1/patients/${testPatientId}`, getPatient);

    // PATCH /api/v1/patients/:id
    const updatePatient = await makeRequest('PATCH', `${BASE_URL}/api/v1/patients/${testPatientId}`, {
      insurance: 'Updated Insurance'
    });
    logTest(`PATCH /api/v1/patients/${testPatientId}`, updatePatient);

    // DELETE /api/v1/patients/:id (only if we created it)
    if (createPatient.success) {
      const deletePatient = await makeRequest('DELETE', `${BASE_URL}/api/v1/patients/${testPatientId}`, null, [200, 204]);
      logTest(`DELETE /api/v1/patients/${testPatientId}`, deletePatient);
    }
  } else {
    console.log(`${colors.yellow}⚠ Skipping individual patient tests - no patient ID available${colors.reset}`);
  }
}

// Print final results
function printSummary() {
  console.log(`\n${colors.bold}${colors.cyan}=== TEST SUMMARY ===${colors.reset}`);
  console.log(`${colors.bold}Total Tests:${colors.reset} ${totalTests}`);
  console.log(`${colors.green}Passed:${colors.reset} ${passedTests}`);
  console.log(`${colors.red}Failed:${colors.reset} ${failedTests}`);

  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  console.log(`${colors.bold}Success Rate:${colors.reset} ${successRate}%`);

  console.log(`\n${colors.bold}Backend URL:${colors.reset} ${BASE_URL}`);
}

// Main execution
async function runTests() {
  console.log(`${colors.bold}${colors.blue}Backend API Test Suite${colors.reset}`);
  console.log(`${colors.bold}Testing:${colors.reset} ${BASE_URL}\n`);

  // Check if backend is running
  const isRunning = await checkBackendStatus();
  if (!isRunning) {
    process.exit(1);
  }

  // Run API tests
  await testDoctorsAPI();
  await testPatientsAPI();

  // Print summary
  printSummary();

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});