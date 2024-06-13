/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export const addOverflowMenu = (menuItems, itemWidths, availableWidth) => {

    let visibleMenuItems = [];
    let overflowMenuItems = [];

    for(let i=0; i<menuItems.length;i++)
    {
        availableWidth -= itemWidths[i];
        if(availableWidth > -1)
        {
            visibleMenuItems.push(menuItems[i]);
        }
        else 
        {
            overflowMenuItems.push(menuItems[i]);
        }
    }

    return [
        visibleMenuItems,
        overflowMenuItems
    ];


};