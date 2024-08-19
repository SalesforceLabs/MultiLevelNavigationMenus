/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import networkId from "@salesforce/community/Id";
import sitePath from "@salesforce/community/basePath";
import siteId from "@salesforce/site/Id";
import siteLanguages from "@salesforce/site/activeLanguages";
import ActiveLanguageCode from '@salesforce/i18n/lang';
import ActiveLocale from '@salesforce/i18n/locale';
import ActiveTimeZone from '@salesforce/i18n/timeZone';

import {getURLParameter, isStringEmpty} from 'c/gtaUtilsGeneral';


/**
 * returns the active language
 * @returns {string}
 * Example: let language = getActiveLanguage();
 */
export function getActiveLanguage() 
{
    let lang = getURLParameter('language');
    lang = (isStringEmpty(lang)) ? ActiveLanguageCode : lang;
    return lang;
}


/**
 * returns the active locale
 * @returns {string}
 * Example: let locale = getActiveLocale();
 */
export function getActiveLocale() 
{
    return ActiveLocale;
}


/**
 * returns the active timezone
 * @returns {string}
 * Example: let timezone = getActiveTimezone();
 */
export function getActiveTimezone() 
{
    return ActiveTimeZone;
}


/**
 * returns the site active languages
 * @returns {array}
 * Example: let languages = getActiveLanguages();
 */
export function getActiveLanguages() 
{
    return siteLanguages;
}


/**
 * returns the experience site Id
 * @returns {string}
 * Example: let siteId = getExperienceSiteId();
 */
export function getExperienceSiteId() 
{
    return siteId;
}


/**
 * returns the experience network Id
 * @returns {string}
 * Example: let networkId = getExperienceNetworkId();
 */
export function getExperienceNetworkId() 
{
    return networkId;
}


/**
 * returns the experience site base Path
 * @returns {string}
 * Example: let siteBasePath = getExperienceSiteBasePath();
 */
export function getExperienceSiteBasePath() 
{
    return sitePath;
}


/**
 * returns whether the code is running in context of builder / site preview
 * @returns {boolean}
 * Example: let inSitePreview = isInSitePreview();
 */
export function isInSitePreview() {
    let domain = document.URL.split('?')[0].replace('https://','').split('/')[0];
    return (domain.includes('.sitepreview.')  
        || domain.includes('.livepreview.') 
        || domain.includes('.live-preview.')  
        || domain.includes('.live.') 
        || domain.includes('.builder.') 
        );
}


/**
 * loads a script dynamically into head markup of site
 * @param {string} url - url of the script to load
 * @returns {void}
 * Example: loadScript('https://www.somedomain.com/script.js');
 */
export function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.charset = 'utf-8';
        script.type = 'text/javascript';
        document.head.appendChild(script);
        script.addEventListener('load', resolve);
        script.addEventListener('error', reject);
    })
}