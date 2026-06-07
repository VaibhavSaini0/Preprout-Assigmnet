/**
 * End-to-end API flow test against staging backend.
 * Run: node scripts/e2e-api-test.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = 'https://admin-moderator-backend-staging.up.railway.app/api';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let token = '';
const results = [];

function log(step, ok, detail = '') {
  const status = ok ? 'PASS' : 'FAIL';
  results.push({ step, ok, detail });
  console.log(`[${status}] ${step}${detail ? ` — ${detail}` : ''}`);
}

async function api(method, endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// Minimal CSV parser matching csvHelper logic
function parseQuestionsCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length <= 1) return [];

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current); current = '';
      } else current += char;
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = parseLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] || ''; });

    const questionText = row['question'] || row['question_text'] || '';
    const option1 = row['option1'] || row['option_a'] || '';
    const option2 = row['option2'] || row['option_b'] || '';
    const option3 = row['option3'] || row['option_c'] || '';
    const option4 = row['option4'] || row['option_d'] || '';
    const correctRaw = (row['correct_option'] || '').trim().toLowerCase();

    if (!questionText || !option1 || !option2 || !option3 || !option4) continue;

    let correct_option = 'option1';
    if (['option2', 'b', '2'].includes(correctRaw) || correctRaw === option2.toLowerCase()) correct_option = 'option2';
    else if (['option3', 'c', '3'].includes(correctRaw) || correctRaw === option3.toLowerCase()) correct_option = 'option3';
    else if (['option4', 'd', '4'].includes(correctRaw) || correctRaw === option4.toLowerCase()) correct_option = 'option4';

    questions.push({
      type: 'mcq',
      question: questionText,
      option1, option2, option3, option4,
      correct_option,
      explanation: row['explanation'] || undefined,
      difficulty: (row['difficulty'] || 'medium').toLowerCase(),
    });
  }
  return questions;
}

async function main() {
  console.log('=== Preproute E2E API Test ===\n');

  // 1. Login
  const login = await api('POST', '/auth/login', { userId: 'vedant-admin', password: 'vedant123' });
  token = login.data?.data?.token;
  log('Login', login.status === 200 && !!token, login.data?.message || `status ${login.status}`);

  // 2. Subjects
  const subjects = await api('GET', '/subjects');
  const subjectList = subjects.data?.data || [];
  log('Get Subjects', subjects.status === 200 && subjectList.length > 0, `${subjectList.length} subjects`);

  const mathSubject = subjectList.find((s) => s.name.toLowerCase().includes('math')) || subjectList[0];
  if (!mathSubject) { console.log('\nNo subjects — aborting.'); process.exit(1); }

  // 3. Topics
  const topics = await api('GET', `/topics/subject/${mathSubject.id}`);
  const topicList = topics.data?.data || [];
  log('Get Topics', topics.status === 200 && topicList.length > 0, `${topicList.length} topics for ${mathSubject.name}`);

  const selectedTopics = topicList.slice(0, 2).map((t) => t.id);

  // 4. Sub-topics multi
  const subTopics = await api('POST', '/sub-topics/multi-topics', { topicIds: selectedTopics });
  const subTopicList = subTopics.data?.data || [];
  log('Get Sub-topics (multi)', subTopics.status === 200, `${subTopicList.length} sub-topics`);

  const selectedSubTopics = subTopicList.slice(0, 1).map((st) => st.id);

  // 5. Parse CSV template
  const csvPath = path.join(__dirname, '../public/templates/questions_template.csv');
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const parsedQuestions = parseQuestionsCSV(csvText);
  log('Parse questions_template.csv', parsedQuestions.length === 5, `${parsedQuestions.length} questions parsed`);

  const totalQuestions = parsedQuestions.length;

  // 6. Create test
  const testPayload = {
    name: `E2E CSV Test ${new Date().toISOString().slice(0, 16)}`,
    type: 'chapterwise',
    subject: mathSubject.id,
    topics: selectedTopics,
    sub_topics: selectedSubTopics,
    correct_marks: 4,
    wrong_marks: -1,
    unattempt_marks: 0,
    difficulty: 'medium',
    total_time: 30,
    total_marks: totalQuestions * 4,
    total_questions: totalQuestions,
    status: 'draft',
  };

  const created = await api('POST', '/tests', testPayload);
  const test = created.data?.data;
  log('Create Test', created.status === 200 || created.status === 201, test?.id || created.data?.message);

  if (!test?.id) {
    console.log('\nFailed to create test. Full response:', JSON.stringify(created.data, null, 2));
    process.exit(1);
  }

  const testId = test.id;

  // 7. Bulk create questions from CSV
  const questionsPayload = parsedQuestions.map((q) => ({
    ...q,
    test_id: testId,
    subject: mathSubject.id,
  }));
  const bulk = await api('POST', '/questions/bulk', { questions: questionsPayload });
  const savedQuestions = bulk.data?.data || [];
  log('Bulk Create Questions', (bulk.status === 200 || bulk.status === 201) && savedQuestions.length === totalQuestions,
    `${savedQuestions.length}/${totalQuestions} created`);

  const questionIds = savedQuestions.map((q) => q.id).filter(Boolean);

  // 8. Update test with question IDs
  const updated = await api('PUT', `/tests/${testId}`, {
    questions: questionIds,
    total_questions: questionIds.length,
    total_marks: questionIds.length * 4,
  });
  log('Update Test with Questions', updated.status === 200, `${questionIds.length} question IDs linked`);

  // 9. Fetch test by ID
  const fetched = await api('GET', `/tests/${testId}`);
  const fetchedTest = fetched.data?.data;
  log('Get Test by ID', fetched.status === 200 && fetchedTest?.id === testId,
    `status=${fetchedTest?.status}, questions=${fetchedTest?.questions?.length || 0}`);

  // 10. Fetch questions bulk
  const fetchBulk = await api('POST', '/questions/fetchBulk', { question_ids: questionIds });
  const fetchedQuestions = fetchBulk.data?.data || [];
  log('Fetch Questions Bulk', fetchBulk.status === 200 && fetchedQuestions.length === totalQuestions,
    `${fetchedQuestions.length} questions fetched`);

  // 11. Publish test
  const published = await api('PUT', `/tests/${testId}`, { status: 'live' });
  const publishedTest = published.data?.data;
  log('Publish Test', published.status === 200 && publishedTest?.status === 'live',
    `status=${publishedTest?.status}`);

  // 12. Get all tests (verify appears)
  const allTests = await api('GET', '/tests');
  const allList = allTests.data?.data || [];
  const found = allList.some((t) => t.id === testId);
  log('Get All Tests', allTests.status === 200 && found, `test found in list of ${allList.length}`);

  // 13. Delete test (cleanup)
  const deleted = await api('DELETE', `/tests/${testId}`);
  log('Delete Test (cleanup)', deleted.status === 200 || deleted.status === 204, `status ${deleted.status}`);

  // Summary
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    console.log('\nFailed steps:');
    results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.step}: ${r.detail}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
