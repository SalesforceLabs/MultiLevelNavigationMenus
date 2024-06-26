/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


/**
 * based on a debug property, logs the given text
 * @param {boolean} debugMode - value of debugMode
 * @param {string} text - text to log in console
 * @param {string} before - text value to log before the text
 * @param {string} after = text value to log after the text
 * @returns {void}
 * Example: consoleLog(true, 'Details of Some code event has occurred.', 'Warning:', 'This is how to fix it...');
 */
export function consoleLog(debugMode = false, text = '', before = '', after = '')
{
    if(debugMode === true && isStringEmpty(text) === false)
    {
        text = ' ' + text + ' ';
        console.log(before + text + after);
    }
}


/**
 * checks a javascript object property for undefined or null
 * @param {object} param - object to check if empty
 * @returns {boolean}
 * Example: isObjectEmpty(someObject) === false ? 'do something' : 'do nothing';
 */
export function isObjectEmpty(param)
{   
    return (param === undefined || param === null);
}


/**
 * checks a javascript string property for undefined or null or empty string
 * @param {string} param - string to check if empty
 * @returns {boolean}
 * Example: isStringEmpty(someString) === true ? 'do something' : 'do nothing';
 */
export function isStringEmpty(param)
{   
    return (typeof param === 'string') ? (isObjectEmpty(param) || param.trim() === '') : isObjectEmpty(param);
}


/**
 * checks a javascript array property for undefined or null or 0 length
 * @param {array} param - string to check if empty
 * @returns {boolean}
 * Example: isArrayEmpty(someArray) === true ? 'do something' : 'do nothing';
 */
export function isArrayEmpty(param)
{   
    return isObjectEmpty(param) || isObjectEmpty(param.length) || param.length < 1;
}


/**
 * escapes string for use as regex pattern
 * @param {string} param - string to escape
 * @returns {string}
 * Example: let searchMask = escapeRegex('[@User.Id]');
 */
export function escapeRegex(param) 
{
    return param.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


/**
 * get the value of a url parameter by name
 * @param {string} name - name of the URL parameter
 * @returns {string}
 * Example: let recordId = getURLParameter('recordId');
 */
export function getURLParameter(name) 
{
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}


/**
 * generates a unique identifier
 * @returns {string}
 * Example: let uid = generateUniqueIdentifier();
 */
export function generateUniqueIdentifier()
{
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    let uid;
    try {

        uid = crypto.randomUUID();
        
    } catch(ex) {

        uid = (
            s4() +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            s4() +
            s4()
        );

    }
    
    return uid;

}


/**
 * generates a pretty print JSON string representation of an object
 * @param {object} param - object to convert to json pretty printed string
 * @returns {string}
 * Example: let jsonString = prettyPrintJSON(someObject);
 */
export function prettyPrintJSON(param) {
    return JSON.stringify(param, undefined, 4);
}


/**
 * return the width of current window
 * @returns {integer}
 * Example: let winWidth = getWindowWidth();
 */
export function  getWindowWidth() {
    return window.innerWidth;
}


/**
 * return the width of a DOM container element along with its padding
 * @param {object} el - DOM element to calculate width for
 * @returns {integer}
 * Example: let elWidth = getElementWidth(this.template.querySelector('.someClass'));
 */
export function  getContainerElementWidth(el) {
    let width = 0;
    if(isObjectEmpty(el) === false)
    {
        width = el.getBoundingClientRect().width;
    }
    return width;
}


/**
 * return the width of a DOM element along with its padding and margins
 * @param {object} el - DOM element to calculate width for
 * @returns {integer}
 * Example: let elWidth = getElementWidth(this.template.querySelector('.someClass'));
 */
export function  getElementWidth(el) {
    let width = 0;
    if(isObjectEmpty(el) === false)
    {
        width = el.getBoundingClientRect().width + parseInt(getComputedStyle(el).marginLeft) + parseInt(getComputedStyle(el).marginRight);
    }
    return width;
}


/**
 * debounce a function (wait) for certain amount of time before executing
 * @param {function} fn - function to execute after waiting
 * @param {integer} wait - integer representing the number of milliseconds to wait before executing the function
 * @returns {function}
 * Example: _resizeListener = debounce(() => {
        const currentWidth = window.innerWidth;

        const widthHasChanged = this.knownWindowWidth !== currentWidth;

        if (widthHasChanged) {
            this.knownWindowWidth = currentWidth;
            this.calculateOverflow();
        }
    }, 300);
 */
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
 * check if a javascript object contains a property
 * @param {object} obj - javascript object to check property for
 * @param {string} key - property key to check if object has set
 * @returns {boolean}
 * Example: let testObj = {test: 'value'}; objectHasProperty(testObj, 'test') === true ? 'has property' : 'doesn't have property';
 */
export function objectHasProperty(obj, key)
{
    if(isObjectEmpty(obj) === true || isStringEmpty(key) === true)
    {
        return false;   
    }
    return Object.prototype.hasOwnProperty.call(obj, key);
}


/**
 * dynamically get property value in an object
 * @param {object} data - javascript object to get property from
 * @param {string} keys - property key to get value for
 * @returns {object}
 * Example: let tmpVal = getObjPropValue(obj, 'general.label');
 */
export function getObjPropValue(data, keys) {
    // If plain string, split it to array
    if(typeof keys === 'string') {
      keys = keys.split('.')
    }
    
    // Get key
    let key = keys.shift();
    
    // Get data for that key
    let keyData = data[key];
    
    // Check if there is data
    if(isObjectEmpty(keyData)) {
      return undefined;
    }
     
    // Check if we reached the end of query string
    if(keys.length === 0){
      return keyData;
    }
    
    // recusrive call!
    return getObjPropValue(Object.assign({}, keyData), keys);
}


/**
 * dynamically set property value in an object
 * @param {object} data - javascript object to get property from
 * @param {string} key - property key to set value for
 * @param {Object} value - property value to set for provided key
 * @returns {object}
 * Example: let testObj = setObjPropValue(testObj, 'general.label', 'Name');
 */
export function setObjPropValue(data, key, value) {
    let schema = data;
    let pList = key.split('.');
    let len = pList.length;
    for(let i = 0; i < len-1; i++) {
        let elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;
    return data;
}

/**
 * checks if string is alphanumeric
 * @param {string} param - property key to set value for
 * @returns {boolean}
 * Example: isAlphaNumeric('someteststring1') ? 'string is alphanumeric' : 'string is not alphanumeric';
 */
export function isAlphaNumeric(param)
{
    if(isStringEmpty(param) === true)
    {
        return false;
    }
    const alphanumericExp = /^([0-9]|[a-z])+([0-9a-z]*)$/i;
    return param.match(alphanumericExp) !== null;

}


/**
 * makes a clone of an object using JSON methods
 * @param {object} obj - object to be cloned
 * @returns {object}
 * Example: let cloneObj = cloneObjectWithJSON(origObject);
 */
export function cloneObjectWithJSON(obj)
{
    if(isObjectEmpty(obj) === true)
    {
        return undefined;
    }
    
    return JSON.parse(JSON.stringify(obj));

}


/**
 * invokes saving/downloading a file with data to local machine
 * @param {string} filename - filename for the file to save
 * @param {string} text - data to be saved in the file
 * @param {string} contentType - content type of the file
 * @param {string} charset - character set of file text content
 * @returns {object}
 * Example: downloadTextFile('config.json', someJsonText, 'text/plain', 'utf-8');
 */
export function downloadTextFile(filename, text, contentType = 'text/plain', charset = 'utf-8') {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:' + contentType + ';charset=' + charset + ',' + encodeURIComponent(text));
    element.setAttribute('download', filename);
        
    element.click();
  
    element.setAttribute('href','');
    element.setAttribute('download', '');
}


/**
 * reads a text file
 * @param {object} fileElement - file element from querySelector
 * @returns {text}
 * Example: readTextFile(this.template.querySelector('.someFileInput')).then(
            (result) => {
                do something with result
            },
            (error) => {
                do something with errors    
            }
 */
export function readTextFile(fileElement) {
	return new Promise(function(resolve, reject) {
        if(isObjectEmpty(fileElement) === false)
        {

            let file = fileElement.files.item(0);
            if(isObjectEmpty(file) === false)
            {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const content = e.target.result;
                    // just resolve with the data you want
                    resolve(content);
                };
                // and reject any errors
                reader.onerror = reject;
                reader.readAsText(file);
            }
            else 
            {
                reject(new Error('No File Selected.'));
            }
        }
        else
        {
            reject(new Error('No File Element.'));
        }
	});
}