import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrencyINR,
  formatLakhsShort,
  calculateDaysLeft,
  calculateEventProgress,
  calculateBudgetSummary,
  filterVendors,
  validateEventInput,
  calculateRSVPSummary,
  checkCategoryBudgetWarning,
} from './eventCalculations.ts';

test('formatCurrencyINR formats Indian Lakhs accurately', () => {
  assert.equal(formatCurrencyINR(1250000), '₹12,50,000');
  assert.equal(formatCurrencyINR(200000), '₹2,00,000');
  assert.equal(formatCurrencyINR(350000), '₹3,50,000');
  assert.equal(formatCurrencyINR(75000), '₹75,000');
  assert.equal(formatCurrencyINR(0), '₹0');
});

test('formatLakhsShort formats condensed notation', () => {
  assert.equal(formatLakhsShort(1250000), '₹12.5L');
  assert.equal(formatLakhsShort(200000), '₹2.0L');
});

test('calculateEventProgress clamps between 0 and 100', () => {
  assert.equal(calculateEventProgress(32, 47), 68);
  assert.equal(calculateEventProgress(12, 28), 43);
  assert.equal(calculateEventProgress(0, 10), 0);
  assert.equal(calculateEventProgress(10, 10), 100);
});

test('calculateBudgetSummary computes spent, remaining, and percentage', () => {
  const expenses = [
    { actualSpent: 450000 },
    { actualSpent: 200000 },
    { actualSpent: 150000 },
    { actualSpent: 40000 },
  ];
  const summary = calculateBudgetSummary(1250000, expenses);
  assert.equal(summary.spent, 840000);
  assert.equal(summary.remaining, 410000);
  assert.equal(summary.percentSpent, 67);
  assert.equal(summary.isOverBudget, false);
});

test('filterVendors accurately filters by status and search text', () => {
  const vendors = [
    { name: 'The Grand Caterers', category: 'Catering', location: 'Bengaluru', status: 'confirmed' },
    { name: 'Blush & Bloom Events', category: 'Decor', location: 'Bengaluru', status: 'confirmed' },
    { name: 'Moments by Aarav', category: 'Photography', location: 'Bengaluru', status: 'discussion' },
    { name: 'Riya Makeup Studio', category: 'Makeup & Hair', location: 'Bengaluru', status: 'shortlisted' },
  ];

  const confirmed = filterVendors(vendors, 'confirmed', '');
  assert.equal(confirmed.length, 2);

  const searchMoments = filterVendors(vendors, 'all', 'Aarav');
  assert.equal(searchMoments.length, 1);
  assert.equal(searchMoments[0].name, 'Moments by Aarav');

  const searchCategory = filterVendors(vendors, 'all', 'Makeup');
  assert.equal(searchCategory.length, 1);
});

test('validateEventInput handles valid and invalid payload', () => {
  const valid = validateEventInput({
    title: 'Priya & Arjun Wedding',
    budget: 800000,
    date: '2026-02-14',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);

  const invalid = validateEventInput({
    title: '',
    budget: -100,
    date: 'invalid',
  });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.length, 3);
});

test('calculateRSVPSummary aggregates accepted, declined, pending, and seats', () => {
  const guests = [
    { rsvpStatus: 'attending', plusOnes: 1 },
    { rsvpStatus: 'attending', plusOnes: 0 },
    { rsvpStatus: 'attending', plusOnes: 2 },
    { rsvpStatus: 'declined', plusOnes: 0 },
    { rsvpStatus: 'pending', plusOnes: 1 },
  ];
  const summary = calculateRSVPSummary(guests);
  assert.equal(summary.accepted, 3);
  assert.equal(summary.declined, 1);
  assert.equal(summary.pending, 1);
  assert.equal(summary.total, 5);
  assert.equal(summary.totalAttendingSeats, 6);
  assert.equal(summary.responseRate, 80);
});

test('checkCategoryBudgetWarning detects categories exceeding 80% allocation', () => {
  // Category at 100% (exceeds 80%)
  const cat1 = checkCategoryBudgetWarning(450000, 450000, 80);
  assert.equal(cat1.isWarning, true);
  assert.equal(cat1.percentUsed, 100);

  // Category at 85% (exceeds 80%)
  const cat2 = checkCategoryBudgetWarning(100000, 85000, 80);
  assert.equal(cat2.isWarning, true);
  assert.equal(cat2.percentUsed, 85);

  // Category at 50% (does not exceed 80%)
  const cat3 = checkCategoryBudgetWarning(150000, 75000, 80);
  assert.equal(cat3.isWarning, false);
  assert.equal(cat3.percentUsed, 50);

  // Category at 0%
  const cat4 = checkCategoryBudgetWarning(100000, 0, 80);
  assert.equal(cat4.isWarning, false);
  assert.equal(cat4.percentUsed, 0);
});

