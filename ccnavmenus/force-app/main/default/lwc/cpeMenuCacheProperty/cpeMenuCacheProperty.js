import { LightningElement, api, track } from 'lwc';

const typeDelay = 500;

export default class cpeMenuCacheProperty extends LightningElement {
    _value; 

    @track cacheName;
    @track cacheKey;
    @track cacheEnabled;

    @track cacheNameError = '';
    @track cacheKeyError = '';
    @track cacheEnabledError = '';

    cacheNameDelayTimeout;
    cacheKeyDelayTimeout;

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = {};
        this.cacheEnabled = value.cacheEnabled;
        if(this.cacheEnabled === true)
        {
            let cacheEnabledEl = this.template.querySelector('.cacheEnabled');
            if(cacheEnabledEl !== undefined && cacheEnabledEl !== null && cacheEnabledEl.checked === false) 
            {
                cacheEnabledEl.checked = true;
            }
        }
        this.cacheKey = value.cacheKey;
        this.cacheName = value.cacheName;
        this._value = value;
    }


    validateValues() {

        this.displayInputError('.cacheName', '');
        this.displayInputError('.cacheKey', '');

        let isCacheNameValid = true, isCacheKeyValid = true, isCacheEnabledValid = true;
        this.cacheNameError = '';
        this.cacheKeyError = '';
        this.cacheEnabledError = '';

        let alphanumericExp = /^([0-9]|[a-z])+([0-9a-z]*)$/i;

        if(this.cacheEnabled === true)
        {
            if((this.cacheName !== undefined && this.cacheName !== null && this.cacheName.trim() !== '') === false)
            {
                this.cacheNameError = 'Cache Name is required.';
                isCacheNameValid = false;
                isCacheEnabledValid = false;
            }

            if((this.cacheKey !== undefined && this.cacheKey !== null && this.cacheKey.trim() !== '') === false)
            {
                this.cacheKeyError = 'Cache Key is required.';
                isCacheKeyValid = false;
                isCacheEnabledValid = false;
            }
        }
        else 
        {
            this.displayInputError('.cacheName', '');
            this.displayInputError('.cacheKey', '');
        }

        if(this.cacheName !== undefined && this.cacheName !== null && this.cacheName.trim() !== '' && this.cacheName.match(alphanumericExp) === null)
        {
            this.cacheNameError = 'Cache Name must be alphanumeric only.';
            isCacheNameValid = false;
        }

        if(this.cacheKey !== undefined && this.cacheKey !== null && this.cacheKey.trim() !== '' && this.cacheKey.match(alphanumericExp) === null)
        {
            this.cacheKeyError = 'Cache Key must be alphanumeric only.';
            isCacheKeyValid = false;
        }

        console.log('isCacheNameValid: ',isCacheNameValid);
        console.log('isCacheKeyValid: ',isCacheKeyValid);
        console.log('isCacheEnabledValid: ',isCacheEnabledValid);

        if(isCacheNameValid === true && isCacheKeyValid === true && isCacheEnabledValid === true)
        {
            let tmpvalue = {};
            tmpvalue.cacheEnabled = this.cacheEnabled;
            tmpvalue.cacheName = this.cacheName;
            tmpvalue.cacheKey = this.cacheKey;
            this.value = tmpvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: this.value}}));

        }
        else 
        {
            
            if(isCacheNameValid === false)
            {
                this.displayInputError('.cacheName', this.cacheNameError);
            }

            if(isCacheKeyValid === false)
            {
                this.displayInputError('.cacheKey', this.cacheKeyError);
            }


        }

        console.log('value: ',JSON.stringify(this.value));
        console.log('cacheEnabled: ',this.cacheEnabled);
        console.log('cacheName: ',this.cacheName);
        console.log('cacheKey: ',this.cacheKey);

    }

    displayInputError(identifier, text)
    {

        let inputCmp = this.template.querySelector(identifier);

        inputCmp.setCustomValidity('');
        inputCmp.reportValidity();

        inputCmp.setCustomValidity(text);
        inputCmp.reportValidity();
    }

    handleCacheNameChange(e) {

        window.clearTimeout(this.cacheNameDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.cacheNameDelayTimeout = setTimeout(() => {
            this.cacheName = e.detail.value.trim();
            this.validateValues();
        }, typeDelay);
        
    }

    handleCacheKeyChange(e) {

        window.clearTimeout(this.cacheKeyDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.cacheKeyDelayTimeout = setTimeout(() => {
            this.cacheKey = e.detail.value.trim();
            this.validateValues();
        }, typeDelay);
        
    }

    handleCacheEnabledChange(e) {
        this.cacheEnabled = e.detail.checked;
        this.validateValues();
    }

}