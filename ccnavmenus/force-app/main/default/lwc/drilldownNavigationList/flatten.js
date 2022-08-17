/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * @param items
 * @returns {*}
 */
 export function flattenItems(items) {
    return items.reduce((list, item) => {
        list[item.id] = item;

        if (item?.items) {
            list = { ...list, ...flattenItems(item.items) };
        }
        return list;
    }, {});
}