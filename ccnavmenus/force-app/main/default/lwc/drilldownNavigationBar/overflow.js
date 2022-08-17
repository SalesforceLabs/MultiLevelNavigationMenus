/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export const addOverflowMenu = (menuItems, itemWidths, availableWidth) => {
    const numOverflowItems = itemWidths.reduce(
        (acc, width) => ((availableWidth -= width) < 0 ? acc + 1 : acc),
        0
    );

    if (numOverflowItems > 0) {
        return [
            menuItems.slice(0, menuItems.length - numOverflowItems),
            menuItems.slice(-numOverflowItems)
        ];
    }

    return [menuItems, []];
};