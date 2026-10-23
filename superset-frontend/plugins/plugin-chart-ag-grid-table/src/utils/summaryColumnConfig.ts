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
import { t } from '@apache-superset/core/translation';
import { GenericDataType } from '@apache-superset/core/common';
import { ControlFormItemSpec } from '@superset-ui/chart-controls';

const summaryAggregate: ControlFormItemSpec<'Select'> = {
  controlType: 'Select',
  label: t('Summary aggregation'),
  description: t(
    'How this column is aggregated in the summary rows. Chart default ' +
      'uses the chart-wide summary aggregation; None leaves the column ' +
      'out, e.g. for rates or other non-additive values.',
  ),
  options: [
    { value: 'DEFAULT', label: t('Chart default') },
    { value: 'NONE', label: t('None') },
    { value: 'SUM', label: t('Sum') },
    { value: 'AVG', label: t('Average') },
    { value: 'MIN', label: t('Min') },
    { value: 'MAX', label: t('Max') },
    { value: 'COUNT', label: t('Count') },
  ],
  defaultValue: 'DEFAULT',
  minWidth: '10em',
  debounceDelay: 200,
};

const alignedLeft = () => [
  'columnWidth',
  { name: 'horizontalAlign', override: { defaultValue: 'left' } },
];

/**
 * Column config layout for raw records with a summary: the default layout
 * plus a Summary tab on numeric columns. A chart-provided layout replaces the
 * default one entirely, so the other types repeat the default layout.
 */
export function getSummaryColumnConfigLayout() {
  return {
    [GenericDataType.String]: [alignedLeft(), ['truncateLongCells']],
    [GenericDataType.Numeric]: [
      {
        tab: t('Column Settings'),
        children: [
          [
            'columnWidth',
            { name: 'horizontalAlign', override: { defaultValue: 'right' } },
          ],
          ['showCellBars'],
          ['alignPositiveNegative'],
          ['colorPositiveNegative'],
        ],
      },
      {
        tab: t('Number formatting'),
        children: [
          ['d3NumberFormat'],
          ['d3SmallNumberFormat'],
          ['currencyFormat'],
        ],
      },
      {
        tab: t('Summary'),
        children: [[{ name: 'summaryAggregate', config: summaryAggregate }]],
      },
    ],
    [GenericDataType.Temporal]: [alignedLeft(), ['d3TimeFormat']],
    [GenericDataType.Boolean]: [alignedLeft()],
    [GenericDataType.MultiValue]: [alignedLeft(), ['truncateLongCells']],
  };
}
