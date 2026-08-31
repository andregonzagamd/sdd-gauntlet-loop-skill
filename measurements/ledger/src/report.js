import { centsToDisplay } from './money.js';

export function buildReport(rows) {
  const monthMap = new Map();
  let grandTotalCents = 0;

  for (const row of rows) {
    const month = row.date.slice(0, 7);
    grandTotalCents += row.amountCents;

    let categoryMap = monthMap.get(month);
    if (!categoryMap) {
      categoryMap = new Map();
      monthMap.set(month, categoryMap);
    }
    categoryMap.set(row.category, (categoryMap.get(row.category) || 0) + row.amountCents);
  }

  const months = [...monthMap.keys()].sort().map((month) => {
    const categoryMap = monthMap.get(month);
    const categories = [...categoryMap.keys()].sort().map((category) => ({
      category,
      totalCents: categoryMap.get(category),
    }));
    const totalCents = categories.reduce((sum, c) => sum + c.totalCents, 0);
    return { month, categories, totalCents };
  });

  return { months, grandTotalCents };
}

export function formatReport(report) {
  if (report.months.length === 0) {
    return 'No expenses.';
  }

  const blocks = report.months.map((m) => {
    const lines = [m.month];
    for (const c of m.categories) {
      lines.push(`  ${c.category}: $${centsToDisplay(c.totalCents)}`);
    }
    lines.push(`  Total: $${centsToDisplay(m.totalCents)}`);
    return lines.join('\n');
  });

  return `${blocks.join('\n\n')}\n\nGrand total: $${centsToDisplay(report.grandTotalCents)}`;
}
