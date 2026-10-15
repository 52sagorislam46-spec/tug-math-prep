import { describe, expect, it } from 'vitest';
import { bcsQuestions, computeScore, makeDeck, grade, NEGATIVE_MARK } from '@/lib/bcs-questions';

describe('BCS scoring', () => {
  it('deducts 0.5 per wrong answer with negative marking', () => {
    expect(NEGATIVE_MARK).toBe(0.5);
    expect(computeScore(10, 4, true)).toBe(8);
  });
  it('does not deduct without negative marking', () => {
    expect(computeScore(10, 4, false)).toBe(10);
  });
  it('grades correct, wrong and skipped answers', () => {
    const q = bcsQuestions[0]!;
    expect(grade(q, q.answer).status).toBe('correct');
    expect(grade(q, (q.answer + 1) % 4).status).toBe('wrong');
    expect(grade(q, null).status).toBe('skipped');
  });
});

describe('BCS question deck', () => {
  it('mixed deck gives every subject an equal share and no repeats in a 40-question round', () => {
    const next = makeDeck(null);
    const drawn = Array.from({ length: 40 }, () => next());
    expect(new Set(drawn.map(q => q.q)).size).toBe(40);
    const counts = new Map<string, number>();
    drawn.forEach(q => counts.set(q.subject, (counts.get(q.subject) ?? 0) + 1));
    expect([...counts.values()].every(c => c === 5)).toBe(true);
  });
  it('keeps subject decks within the chosen subject without repeats', () => {
    const subject = bcsQuestions[0]!.subject;
    const pool = bcsQuestions.filter(q => q.subject === subject);
    const next = makeDeck(subject);
    const drawn = Array.from({ length: pool.length }, () => next());
    expect(drawn.every(q => q.subject === subject)).toBe(true);
    expect(new Set(drawn.map(q => q.q)).size).toBe(pool.length);
  });
  it('every question has an explanation', () => {
    expect(bcsQuestions.filter(q => !q.explain?.trim())).toEqual([]);
  });
});

describe('BCS question bank size', () => {
  it('has thousands of questions, each with 4 distinct options', () => {
    expect(bcsQuestions.length).toBeGreaterThan(2000);
    expect(bcsQuestions.filter(q => new Set(q.options).size !== 4)).toEqual([]);
  });
});
