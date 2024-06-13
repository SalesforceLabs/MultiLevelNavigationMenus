/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { LightningElement, track, api } from 'lwc';

export default class MegaNavigationList extends LightningElement {
    @api menuItems;
    @api parentItem;
    @api isFirstLevel = false;
    @api uuid;
    @api gotoLabel = 'Go to';
    @api doNotRenderParentLink = false;
    @api containerClasses = '';
    

    get parentSelected() {
        let url = document.URL;
        return (!this.isObjectEmpty(this.parentItem) && !this.isStringEmpty(this.parentItem.href) && !this.parentItem.href.trim().includes('void(0)') && this.parentItem.href.trim() !== '#' && url.includes(this.parentItem.href));
    }

    get isParentItemLink() {
        return (!this.isObjectEmpty(this.parentItem) && this.doNotRenderParentLink === false && this.parentItem.type !== 'MoreMenu' && this.parentItem.level === 1 && !this.isStringEmpty(this.parentItem.href) && !this.parentItem.href.trim().includes('void(0)') && !this.parentItem.href.trim().includes('#'));
    }

    get localMenuItems() {

        let localMenuItemsTmp = [];
        let url = document.URL;

        if(this.menuItems !== undefined && this.menuItems !== null && this.menuItems.length > 0)
        {
            localMenuItemsTmp = JSON.parse(JSON.stringify(this.menuItems));

            for(let i=0;i<localMenuItemsTmp.length; i++)
            {
                localMenuItemsTmp[i].renderLink = (!this.isStringEmpty(localMenuItemsTmp[i])
                                                    && localMenuItemsTmp[i].href.trim().indexOf('#') < 0 && localMenuItemsTmp[i].href.trim().indexOf('void(0)') < 0 );
                localMenuItemsTmp[i].hasChildren = (!this.isObjectEmpty(localMenuItemsTmp[i].items) && localMenuItemsTmp[i].items.length > 0) ? true : false;

                localMenuItemsTmp[i].iconPositionLeft =  (!this.isStringEmpty(localMenuItemsTmp[i].iconPosition) && localMenuItemsTmp[i].iconPosition === 'left');  
                localMenuItemsTmp[i].iconPositionRight =  (!this.isStringEmpty(localMenuItemsTmp[i].iconPosition) && localMenuItemsTmp[i].iconPosition === 'right');
                localMenuItemsTmp[i].selected = (!this.isStringEmpty(localMenuItemsTmp[i].href) && !localMenuItemsTmp[i].href.trim().includes('void(0)') && !localMenuItemsTmp[i].href.trim().includes('#') && url.includes(localMenuItemsTmp[i].href));
                
            }

        }
        
        return localMenuItemsTmp;

    }

    get repeatedDivClasses() {

        return (this.isFirstLevel === true) ? 'slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-m-top_x-large' : 'slds-size_12-of-12 slds-p-left_medium';

    }

    handleNavClick(event) {
        let preventDefaultAndPropagation = false;
        if(event.target?.role !== 'menuitem' && event?.target?.tagName !== 'C-MEGA-NAVIGATION-LIST')
        {
            preventDefaultAndPropagation = true;
        }
        if (preventDefaultAndPropagation) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    isObjectEmpty(param)
    {   
        return (param === undefined || param === null);
    }

    isStringEmpty(param)
    {   
        return (typeof param === 'string') ? (param === undefined || param === null || param.trim() === '') : this.isObjectEmpty(param);
    }


}