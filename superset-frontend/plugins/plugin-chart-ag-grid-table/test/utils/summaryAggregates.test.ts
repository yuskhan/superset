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
import {
  aggregateRows,
  getRawSummaryAggregates,
} from '../../src/utils/summaryAggregates';

test('each column uses its own aggregation, else the chart default', () => {
  expect(
    getRawSummaryAggregates(
      ['amount', 'tax', 'rate', 'qty'],
      {
        tax: { summaryAggregate: 'MAX' },
        rate: { summaryAggregate: 'NONE' },
        qty: { summaryAggregate: 'DEFAULT' },
      },
      'AVG',
    ),
  ).toEqual({ amount: 'AVG', tax: 'MAX', qty: 'AVG' });
});

test("ORIGINAL falls back to SUM, as raw columns have no metric's own", () => {
  expect(getRawSummaryAggregates(['amount'], undefined, 'ORIGINAL')).toEqual({
    amount: 'SUM',
  });
});

const rows = [
  { amount: 10, tax: '2', note: 'a' },
  { amount: 30, tax: null, note: 'b' },
  { amount: -5, tax: 'n/a', note: 'c' },
];

test('aggregates rows like SQL, skipping null and non-numeric values', () => {
  expect(
    aggregateRows(rows, { amount: 'SUM', tax: 'SUM', note: 'COUNT' }),
  ).toEqual({ amount: 35, tax: 2, note: 0 });
  expect(aggregateRows(rows, { amount: 'AVG' })).toEqual({ amount: 35 / 3 });
  expect(aggregateRows(rows, { amount: 'MIN' })).toEqual({ amount: -5 });
  expect(aggregateRows(rows, { amount: 'MAX' })).toEqual({ amount: 30 });
  expect(aggregateRows(rows, { tax: 'COUNT' })).toEqual({ tax: 1 });
});

test('a column with no numeric values aggregates to null, COUNT to 0', () => {
  expect(aggregateRows([], { amount: 'SUM', tax: 'COUNT' })).toEqual({
    amount: null,
    tax: 0,
  });
});

test('handles a page larger than the engine argument limit', () => {
  const many = Array.from({ length: 200000 }, (_, index) => ({ v: index }));
  expect(aggregateRows(many, { v: 'MAX' })).toEqual({ v: 199999 });
});
