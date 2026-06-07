import type { Question } from './httpClient';

export function parseQuestionsCSV(text: string): Partial<Question>[] {
  const lines = text.split(/\r?\n/);
  if (lines.length <= 1) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const parsedQuestions: Partial<Question>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = parseCSVLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = cells[index] || '';
    });

    // Extract values — support both API format (question, option1…) and template format (question_text, option_a…)
    const questionText = row['question'] || row['question_text'] || '';
    const option1 = row['option1'] || row['option_a'] || '';
    const option2 = row['option2'] || row['option_b'] || '';
    const option3 = row['option3'] || row['option_c'] || '';
    const option4 = row['option4'] || row['option_d'] || '';
    const correctOptionRaw = (row['correct_option'] || row['correct option'] || '').trim().toLowerCase();
    const explanation = row['explanation'] || '';
    const difficultyRaw = (row['difficulty'] || 'medium').trim().toLowerCase();
    const difficulty = difficultyRaw === 'difficult' ? 'hard' : difficultyRaw;
    const mediaUrl = row['media_url'] || row['media url'] || '';

    if (!questionText || !option1 || !option2 || !option3 || !option4) {
      continue; // Skip invalid row
    }

    // Map correct option aliases
    let correct_option = 'option1';
    if (
      correctOptionRaw === 'option1' ||
      correctOptionRaw === 'a' ||
      correctOptionRaw === '1' ||
      correctOptionRaw === option1.toLowerCase()
    ) {
      correct_option = 'option1';
    } else if (
      correctOptionRaw === 'option2' ||
      correctOptionRaw === 'b' ||
      correctOptionRaw === '2' ||
      correctOptionRaw === option2.toLowerCase()
    ) {
      correct_option = 'option2';
    } else if (
      correctOptionRaw === 'option3' ||
      correctOptionRaw === 'c' ||
      correctOptionRaw === '3' ||
      correctOptionRaw === option3.toLowerCase()
    ) {
      correct_option = 'option3';
    } else if (
      correctOptionRaw === 'option4' ||
      correctOptionRaw === 'd' ||
      correctOptionRaw === '4' ||
      correctOptionRaw === option4.toLowerCase()
    ) {
      correct_option = 'option4';
    }

    parsedQuestions.push({
      type: 'mcq',
      question: questionText,
      option1,
      option2,
      option3,
      option4,
      correct_option,
      explanation: explanation || undefined,
      difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
      media_url: mediaUrl || undefined,
    });
  }

  return parsedQuestions;
}

// Custom parser that handles double quotes and commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote: "" -> "
        current += '"';
        i++;
      } else {
        // Toggle quote block
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
