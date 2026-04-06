import { describe, it, expect } from 'vitest';
import { formatMoney, formatDate, formatTable } from '../../src/format.js';

describe('formatMoney', () => {
  it('formats USD correctly', () => {
    expect(formatMoney(5000000, 'USD')).toBe('$50,000.00');
  });

  it('formats JPY correctly (no decimals)', () => {
    expect(formatMoney(500000, 'JPY')).toBe('¥500,000');
  });

  it('formats PHP correctly', () => {
    expect(formatMoney(5000000, 'PHP')).toBe('₱50,000.00');
  });

  it('formats suffix currency (SEK)', () => {
    expect(formatMoney(5000000, 'SEK')).toBe('50,000.00 kr');
  });

  it('formats suffix currency (VND)', () => {
    expect(formatMoney(500000, 'VND')).toBe('500,000 ₫');
  });

  it('formats suffix currency (PLN)', () => {
    expect(formatMoney(5000000, 'PLN')).toBe('50,000.00 zł');
  });

  it('formats zero-decimal currency (KRW)', () => {
    expect(formatMoney(1000000, 'KRW')).toBe('₩1,000,000');
  });

  it('formats EUR correctly', () => {
    expect(formatMoney(2500000, 'EUR')).toBe('€25,000.00');
  });

  it('formats GBP correctly', () => {
    expect(formatMoney(3500000, 'GBP')).toBe('£35,000.00');
  });

  it('formats CNY correctly', () => {
    expect(formatMoney(10000000, 'CNY')).toBe('¥100,000.00');
  });

  it('formats SGD correctly', () => {
    expect(formatMoney(8000000, 'SGD')).toBe('S$80,000.00');
  });

  it('formats INR correctly', () => {
    expect(formatMoney(15000000, 'INR')).toBe('₹150,000.00');
  });

  it('formats CAD correctly', () => {
    expect(formatMoney(6000000, 'CAD')).toBe('C$60,000.00');
  });

  it('formats AUD correctly', () => {
    expect(formatMoney(9000000, 'AUD')).toBe('A$90,000.00');
  });

  it('formats AED correctly', () => {
    expect(formatMoney(4000000, 'AED')).toBe('د.إ40,000.00');
  });

  it('formats SAR correctly', () => {
    expect(formatMoney(7000000, 'SAR')).toBe('﷼70,000.00');
  });

  it('formats zero-decimal currency (IDR)', () => {
    expect(formatMoney(5000000, 'IDR')).toBe('Rp5,000,000');
  });

  it('formats BRL correctly', () => {
    expect(formatMoney(12000000, 'BRL')).toBe('R$120,000.00');
  });

  it('formats MXN correctly', () => {
    expect(formatMoney(11000000, 'MXN')).toBe('MX$110,000.00');
  });

  it('handles unknown currency', () => {
    expect(formatMoney(1000, 'XYZ')).toBe('1000 XYZ');
  });

  it('handles zero amount', () => {
    expect(formatMoney(0, 'USD')).toBe('$0.00');
  });

  it('handles large amounts', () => {
    expect(formatMoney(100000000000, 'USD')).toBe('$1,000,000,000.00');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2026-04-07T00:00:00.000Z');
    expect(result).toContain('2026');
    expect(result).toContain('Apr');
    expect(result).toContain('7');
  });

  it('formats different month', () => {
    const result = formatDate('2025-12-25T00:00:00.000Z');
    expect(result).toContain('2025');
    expect(result).toContain('Dec');
    expect(result).toContain('25');
  });

  it('handles dates with time', () => {
    const result = formatDate('2026-01-15T14:30:45.123Z');
    expect(result).toContain('2026');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });
});

describe('formatTable', () => {
  it('creates aligned table with headers and separator', () => {
    const rows = [
      { name: 'Alice', role: 'Engineer' },
      { name: 'Bob', role: 'Designer' },
    ];
    const result = formatTable(rows, [
      { key: 'name', header: 'Name', width: 10 },
      { key: 'role', header: 'Role', width: 10 },
    ]);
    expect(result).toContain('Name');
    expect(result).toContain('Role');
    expect(result).toContain('Alice');
    expect(result).toContain('Bob');
    expect(result).toContain('---');
  });

  it('handles empty rows', () => {
    const result = formatTable([], [
      { key: 'name', header: 'Name', width: 10 },
    ]);
    expect(result).toContain('Name');
    expect(result).toContain('---');
  });

  it('truncates long values', () => {
    const rows = [
      { text: 'A'.repeat(100) },
    ];
    const result = formatTable(rows, [
      { key: 'text', header: 'Text', width: 20 },
    ]);
    const lines = result.split('\n');
    // Header line should be exactly 20 chars for the column
    expect(lines[0].length).toBeLessThanOrEqual(30); // accounting for padding
  });

  it('handles missing values', () => {
    const rows = [
      { name: 'Alice' },
      { name: 'Bob', role: 'Designer' },
    ];
    const result = formatTable(rows, [
      { key: 'name', header: 'Name', width: 10 },
      { key: 'role', header: 'Role', width: 10 },
    ]);
    expect(result).toContain('Alice');
    expect(result).toContain('Bob');
    expect(result).toContain('Designer');
  });

  it('auto-sizes columns when width not specified', () => {
    const rows = [
      { name: 'Alice', role: 'Engineer' },
      { name: 'Bob', role: 'Designer' },
    ];
    const result = formatTable(rows, [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ]);
    expect(result).toContain('Name');
    expect(result).toContain('Alice');
  });

  it('respects max width of 40', () => {
    const rows = [
      { text: 'A'.repeat(100) },
    ];
    const result = formatTable(rows, [
      { key: 'text', header: 'Text' },
    ]);
    const lines = result.split('\n');
    // Should be capped at 40
    expect(lines[2].length).toBeLessThanOrEqual(40);
  });

  it('handles multiple rows correctly', () => {
    const rows = [
      { id: '1', name: 'Alice', status: 'Active' },
      { id: '2', name: 'Bob', status: 'Inactive' },
      { id: '3', name: 'Charlie', status: 'Active' },
    ];
    const result = formatTable(rows, [
      { key: 'id', header: 'ID', width: 5 },
      { key: 'name', header: 'Name', width: 10 },
      { key: 'status', header: 'Status', width: 10 },
    ]);
    const lines = result.split('\n');
    expect(lines.length).toBe(5); // header + separator + 3 rows
    expect(lines[0]).toContain('ID');
    expect(lines[1]).toContain('---');
    expect(lines[2]).toContain('1');
    expect(lines[3]).toContain('2');
    expect(lines[4]).toContain('3');
  });
});
