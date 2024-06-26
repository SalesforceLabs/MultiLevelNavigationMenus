/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {isStringEmpty, isObjectEmpty, consoleLog} from 'c/gtaUtilsGeneral';


/**
 * Puts a value in the cache
 * @param {string} cacheName - the name of the cache
 * @param {string} cacheKey - the key of the cache
 * @param {object} value - the value to put in the cache
 * @param {boolean} debugMode - true, to log errors to console
 * @returns {void}
 * Example: putInCache('someCacheName', 'someCacheKey', someObject) === 'success' : 'success' : 'error';
 */
export function putInCache(cacheName, cacheKey, value, debugMode = false)
{
    try {
        if ('caches' in window && 
            isStringEmpty(cacheName) === false &&
            isStringEmpty(cacheKey) === false && 
            isObjectEmpty(value) === false) 
        {

            caches.open(cacheName).then(cache => {

                try {
                    cache.put(cacheKey, Response.json(JSON.stringify(value)));
                    consoleLog(debugMode, 'Successfully cached.', 'Success:', cacheName + '-' + cacheKey);
                    
                } catch(ex1) {
                    consoleLog(debugMode, ex1 + '', 'Exception caught:');
                }
                
            });
        }
        else 
        {
            consoleLog(debugMode, 'no caches in window, or empty cacheName / cacheKey / value', 'Warning:');
        }
    } catch (ex) {
        consoleLog(debugMode, ex + '', 'Exception caught:');
    }

}


/**
 * Gets a value from cache
 * @param {string} cacheName - the name of the cache
 * @param {string} cacheKey - the key of the cache
 * @param {boolean} debugMode - true, to log errors to console
 * @returns {string}
 * Example: let someObject = getFromCache('someCacheName', 'someCacheKey');
 */
export function getFromCache(cacheName, cacheKey, debugMode = false)
{
    let result;
    try {
        
        if ('caches' in window && 
            isStringEmpty(cacheName) === false &&
            isStringEmpty(cacheKey) === false) 
        {

            caches.open(cacheName).then(cache => {
                cache.match(cacheKey).then(response => {
                    if(response) {
                        response.json().then(jsonValue => {

                            try {
                                let tmpObj = JSON.parse(jsonValue);
                                consoleLog(debugMode, 'Successfully retrieved from cache.', 'Success:', cacheName + '-' + cacheKey);
                                return tmpObj;
                            } catch(ex1) {
                                consoleLog(debugMode, ex1 + '', 'Exception caught:');
                            }
                            return result;
                        });
                        
                    }

                }); 
            })
        }

    } catch (ex) {
        consoleLog(debugMode, ex + '', 'Exception caught:');
    }

    return result;
}