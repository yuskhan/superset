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

/**
 * When a column filter change is applied (and, with server pagination,
 * queried): on every change, after typing pauses, or only on Apply/Enter.
 */
export type ColumnFilterApplyMode = 'instant' | 'debounced' | 'manual';

/** AG Grid's own default debounce for text and number filters. */
export const DEFAULT_FILTER_DEBOUNCE_MS = 500;

export type FilterApplyParams =
  | { debounceMs: number }
  | { buttons: ('apply' | 'reset')[]; closeOnApply: boolean };

/**
 * AG Grid filterParams for the configured apply mode. In manual mode the
 * filter only changes on Apply, which AG Grid also triggers on Enter.
 */
export function getFilterApplyParams(
  mode: ColumnFilterApplyMode | undefined,
  debounceMs: number | undefined,
): FilterApplyParams {
  if (mode === 'manual') {
    return { buttons: ['apply', 'reset'], closeOnApply: true };
  }
  if (mode === 'instant') {
    return { debounceMs: 0 };
  }
  const delay = Number(debounceMs);
  return {
    debounceMs:
      Number.isFinite(delay) && delay >= 0 ? delay : DEFAULT_FILTER_DEBOUNCE_MS,
  };
}
