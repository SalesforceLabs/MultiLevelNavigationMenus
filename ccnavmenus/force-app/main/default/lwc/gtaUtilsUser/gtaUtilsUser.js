/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import userId from "@salesforce/user/Id";
import isGuest from "@salesforce/user/isGuest";



/**
 * returns the current user Id
 * @returns {string}
 * Example: let userId = getUserId();
 */
export function getUserId() 
{
    return userId;
}


/**
 * returns true if the user is unauthenticated
 * @returns {boolean}
 * Example: isUserUnauthenticated() === true ? 'user is unauthenticated' : 'user is authenticated ;
 */
export function isUserUnauthenticated() 
{
    return isGuest;
}