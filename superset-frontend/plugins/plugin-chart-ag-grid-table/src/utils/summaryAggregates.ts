/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { DataRecord } from '@superset-ui/core';
import {
  TableColumnConfig,
  TotalsAggregate,
} from '@superset-ui/chart-controls';

/**
 * Aggregation for one numeric column in the raw-records summary rows.
 * NONE leaves the column out, e.g. for non-additive values such as rates.
 */
export type SummaryAggregate = 'NONE' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT';

export const SUMMARY_AGGREGATES: SummaryAggregate[] = [
  'NONE',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'COUNT',
];

/** Key on a pinned summary row naming the row, shown in the first column. */
export const SUMMARY_LABEL_KEY = '__summaryLabel';
/** Key marking the pinned current-page subtotal row. */
export const PAGE_SUBTOTAL_KEY = '__isPageSubtotal';

const isSummaryAggregate = (value: unknown): value is SummaryAggregate =>
  SUMMARY_AGGREGATES.includes(value as SummaryAggregate);

/**
 * Resolves the aggregation per raw-records summary column: the column's own
 * setting from column_config, else the chart-wide summary aggregation.
 * Columns set to NONE are left out of the result.
 */
export function getRawSummaryAggregates(
  columnNames: string[],
  columnConfig:
    | Record<string, TableColumnConfig & { summaryAggregate?: unknown }>
    | undefined,
  totalsAggregate: TotalsAggregate,
): Record<string, Exclude<SummaryAggregate, 'NONE'>> {
  // Raw columns have no metric of their own, so ORIGINAL falls back to SUM.
  const fallback = totalsAggregate === 'ORIGINAL' ? 'SUM' : totalsAggregate;
  const result: Record<string, Exclude<SummaryAggregate, 'NONE'>> = {};
  columnNames.forEach(columnName => {
    const configured = columnConfig?.[columnName]?.summaryAggregate;
    const aggregate = isSummaryAggregate(configured) ? configured : fallback;
    if (aggregate !== 'NONE') {
      result[columnName] = aggregate;
    }
  });
  return result;
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};

/**
 * Aggregates the given rows client-side, e.g. the rows on the current page.
 * Null and non-numeric values are skipped, matching SQL aggregate functions.
 * A column with no numeric values aggregates to null, except COUNT (0).
 */
export function aggregateRows(
  rows: DataRecord[],
  aggregates: Record<string, Exclude<SummaryAggregate, 'NONE'>>,
): DataRecord {
  const result: DataRecord = {};
  Object.entries(aggregates).forEach(([columnName, aggregate]) => {
    const values = rows
      .map(row => toNumber(row[columnName]))
      .filter((value): value is number => value !== null);
    if (aggregate === 'COUNT') {
      result[columnName] = values.length;
      return;
    }
    if (values.length === 0) {
      result[columnName] = null;
      return;
    }
    switch (aggregate) {
      case 'SUM':
        result[columnName] = values.reduce((sum, value) => sum + value, 0);
        break;
      case 'AVG':
        result[columnName] =
          values.reduce((sum, value) => sum + value, 0) / values.length;
        break;
      // reduce rather than Math.min(...values): a large client-side page
      // could exceed the engine's argument limit.
      case 'MIN':
        result[columnName] = values.reduce((min, value) =>
          Math.min(min, value),
        );
        break;
      case 'MAX':
        result[columnName] = values.reduce((max, value) =>
          Math.max(max, value),
        );
        break;
      default:
        break;
    }
  });
  return result;
}
