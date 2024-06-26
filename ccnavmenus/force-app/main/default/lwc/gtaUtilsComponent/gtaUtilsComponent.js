/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {isObjectEmpty, isStringEmpty} from 'c/gtaUtilsGeneral';


/**
 * get an element from the component template by class identifier
 * @param {object} cmp - pass in the calling lwc (this)
 * @param {string} identifier - identifier to query via querySelector
 * @returns {object}
 * Example: let element = getElementByClass(this, '.className');
 */
export function getElement(cmp, identifier)
{
    return cmp.template.querySelector(identifier);
}


/**
 * get an element from the component template by data-key attribute identifier
 * @param {object} cmp - pass in the calling lwc (this)
 * @param {string} identifier - identifier to query via querySelector
 * @returns {object}
 * Example: let element = getElementByDataKey(this, 'key');
 */
export function getElementByDataKey(cmp, identifier)
{
    return getElement(cmp, '[data-key="'+identifier+'"]');
}


/**
 * get an element from the component template by class identifier
 * @param {object} cmp - pass in the calling lwc (this)
 * @param {string} identifier - identifier to query via querySelector
 * @returns {object}
 * Example: let element = getElementByClass(this, '.className');
 */
export function getElementByClass(cmp, identifier)
{
    return getElement(cmp, '.'+identifier);
}


/**
 * resets and displays error on inputField
 * @param {object} lightningInputEl - Lightning Input Element from querySelector
 * @param {string} text - error text to display on lightning-input
 * @returns {void}
 * Example: displayLightningInputError(this.template.querySelector('.someClass'), 'This field cannot be empty. Please provide a value.');
 */
export function displayLightningInputErrorEl(lightningInputEl, text)
{

    if(isObjectEmpty(lightningInputEl) === false && typeof lightningInputEl.setCustomValidity === 'function' && typeof lightningInputEl.reportValidity === 'function')
    {
        lightningInputEl.setCustomValidity('');
        lightningInputEl.reportValidity();

        lightningInputEl.setCustomValidity(text);
        lightningInputEl.reportValidity();
    }
    
}


/**
 * resets and displays error on inputField
 * @param {object} cmp - Lightning Input Element from querySelector
 *  * @param {string} identifier - identifier to query via querySelector
 * @param {string} text - error text to display on lightning-input
 * @returns {void}
 * Example: displayLightningInputError(this, 'div.className', 'This field cannot be empty. Please provide a value.');
 */
export function displayLightningInputError(cmp, identifier, text)
{
    if(isObjectEmpty(cmp) === false)
    {
        let tmpEl = getElement(cmp, identifier);
        displayLightningInputErrorEl(tmpEl, text);
    }
}


/**
 * dynamically creates a link element and navigates to url provided
 * @param {string} url - url to navigate to
 * @param {string} target - target value ('_blank' or other valid values)
 * @returns {void}
 * Example: doLinkNavigate('https://www.domain.com','_blank');
 */
export function doLinkNavigate(url, target = '')
{
    if(isStringEmpty(url) === false)
    {
        let newLink = document.createElement('a');
        newLink.setAttribute('href',url);
        if(isStringEmpty(target) === false)
        {
            newLink.setAttribute('target', target);
        }
        newLink.click();
    }
}