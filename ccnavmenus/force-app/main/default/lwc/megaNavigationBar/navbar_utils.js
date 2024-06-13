/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export function squash(event) {
    event.preventDefault();
    event.stopPropagation();
}

export function hasModifierKey(event) {
    return event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
}

export function debounce(fn, wait) {
    return function _debounce() {
        if (!_debounce.pending) {
            _debounce.pending = true;

            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                fn();
                _debounce.pending = false;
            }, wait);
        }
    };
}

/**
 * Invokes <tt>fn</tt> at most once in the specified period of time.
 *
 * @param {callback} fn The function to
 * @param {Number} wait The throttle time period, in milliseconds
 */
export function throttle(fn, wait) {
    let cooldown = false;
    return function throttled(...args) {
        if (!cooldown) {
            cooldown = true;

            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => (cooldown = false), wait);
            fn.apply(this, args);
        }
    };
}

export function isUndefinedOrNull(obj) {
    if (obj === undefined || obj === null) {
        return true;
    }
    return false;
}

export async function fetchJson(url, body) {
    const header = 'application/json; charset=UTF-8';

    try {
        let resp = null;
        if (isUndefinedOrNull(body)) {
            resp = await fetch(url, { method: 'GET' });
        } else {
            resp = await fetch(url, {
                body: JSON.stringify(body),
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    Accept: header,
                    'Content-Type': header
                },
                method: 'POST'
            });
        }
        if (resp) {
            if (resp.ok) {
                return await resp.json();
            }
            throw new Error('Bad request');
        }
        return null;
    } catch (error) {
        return null;
    }
}

const defaultAppVersion = '44.0';

export function getAppVersion() {
    //const version = $A !== null ? $A.storageService.version : defaultAppVersion; // eslint-disable-line no-undef
    //return version;
    return defaultAppVersion;
}