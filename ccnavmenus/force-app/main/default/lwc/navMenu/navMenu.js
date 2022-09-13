/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api, track, wire } from 'lwc';
import fetchMenu from '@salesforce/apex/menusController.getMenu';
import {loadStyle} from 'lightning/platformResourceLoader';
import navMenuCSS from '@salesforce/resourceUrl/navMenu';
import formFactor from '@salesforce/client/formFactor';

export default class NavMenu extends LightningElement {

    @api menuId;
    @api nameFilter = '';
    @api isVertical = false;
    @api verticalMode = ''; //on, off, mobile-only
    @api uuid = Date.now();
    /* [{"replaceThis":"[!recordId]","replaceWith":"{!recordId}"}] */ 
    @api urlSubMapJson;
    @api language = 'auto';

    //styling inputs
    @api brandNavigationColorText;
    @api brandNavigationBarBackgroundColor;
    @api brandNavigationBackgroundColor;
    @api fontFamily;
    @api textTransform;
    @api topLevelItemSpacing = 20;
    @api hamburgerMenuMode = 'mobile-only'; //on, mobile-only, off
    @api navMenuClassNames = '';
    @api menuAlignment = 'Left';

    @api menuMode = 'Default'; //default, Drill Down

    @api drillDownBackButtonLabel = 'Back';
    @api overflowLabel = 'More';
    @api allLabel = 'Go to';

    @track items = [];
    @track url = '';
    @track hamburgerMenuVisible = false;
    @track hamburgerMenu = false;
    @track clickListener;
    @track userInfo = {};
    
    get menuAriaAnnouncement()
    {
        if(this.items.length > 0)
        {
            return ' Menu first Item of ' + this.items.length + ' items';
        }
        else 
        {
            return '';
        }
    }

    get isDrillDown()
    {
        return this.menuMode === 'Drill Down';
    }

    get menuAlignmentClass() {
        const cssClasses = ['slds-grid hamburgerIconContainer'];

        // Default is 'left' and only 'center' and 'right' need to be set explicitly
        if (this.menuAlignment === 'Center') {
            cssClasses.push('slds-grid_align-center');
        } else if (this.menuAlignment === 'Right') {
            cssClasses.push('slds-grid_align-end');
        }

        return (this.isVertical || this.hamburgerMenu) ? cssClasses.join(' ') : '';
    }

    get closeButtonDivClasses() {
        const cssClasses = ['closeButtonDiv'];
        if (this.menuAlignment === 'Left') {
            cssClasses.push('closeButtonDivLeft');
        }

        return cssClasses.join(' ');
    }

    //wire functions
    wireFetchMenu;
    @wire(fetchMenu,{menuId: '$menuId', language: '$language', nameFilter: '$nameFilter'})
    fetchMenuImperativeWiring(result) 
    {
        if (result.data) {
            let resData = JSON.parse(result.data)
            if(resData.menu)
            {
                try {
                    
                    this.items = resData?.menu;
                    this.userInfo = resData?.user;
                    
                    if(this.urlSubMapJson !== undefined && this.urlSubMapJson !== null && this.urlSubMapJson.trim() !== '')
                    {

                        this.handleUserInfoReplacements();

                        if(this.items && Array.isArray(this.items))
                        {
                            this.handleUrlReplaceItems(this.items);
                        }
                    }

                    this.error = undefined;
                }catch(e){}
            }
            else if(!resData.menu && resData.error)
            {
                this.error = resData.error;
                this.items = undefined;
            }
        } else if (result.error) {
           // this.menuItemListResult = result;
            this.error = result.error;
            this.items = undefined;
        }

    }

    connectedCallback()
    { 
        this.hamburgerMenu = (this.hamburgerMenuMode !== undefined && this.hamburgerMenuMode !== null
            && (
                    (this.hamburgerMenuMode === 'mobile-only' && this.checkMobile()) 
                    || this.hamburgerMenuMode === 'on')
                );

        try {
            this.url = window.location.href.split('?')[0];
        } catch(err){
            this.url = document.URL.split('?')[0];
        }
        
        loadStyle(this, navMenuCSS);
        
        this.isVertical = false;
        this.isVertical = (this.verticalMode === 'on') ? true : this.isVertical;
        this.isVertical = (this.checkMobile() && this.verticalMode === 'mobile-only') ? this.checkMobile() : this.isVertical;

        try {
            
            if(this.language !== undefined && this.language !== null && this.language.trim() === 'auto')
            {
                let lang = this.getURLParameter('language');
                this.language += (lang !== undefined && lang !== null && lang.trim() !== '') ? lang : '';
            }
        } catch(e){}

        this.setStylingProperties();

        if(this.hamburgerMenu)
        {
            this.clickListener = this.handleCloseHamburgerMenu.bind(this);
            window.addEventListener(
                'click',
                this.clickListener
            );
        }
        
    }

    disconnectedCallback() {
        if(this.hamburgerMenu)
        {
            window.removeEventListener('click', this.clickListener);
        }
    }

    renderedCallback()
    {
        this.setStylingProperties();
    }

    toggleHamburgerMenu(e)
    {
        this.hamburgerMenuVisible = !this.hamburgerMenuVisible;
        e.preventDefault();
        e.stopPropagation();
    }

    handleCloseHamburgerMenu(e)
    {
        if(e.target !== undefined && e.target !== null && 
                (
                    e.target.tagName !== 'CCNAVMENUS-NAV-MENU' || 
                    (e.target.tagName === 'CCNAVMENUS-NAV-MENU' && e.target.uuid !== this.uuid)
                )
            )
        {
            this.closeHamburgerMenu();
        }
    }

    closeHamburgerMenu()
    {
        this.hamburgerMenuVisible = false;
    }

    checkMobile()
    {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        if(check === false && formFactor === 'Small')
        {
            check = true;
        }
        return check;
    }

    getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
      }


    setStylingProperties()
    {
        let treeItemCSS = this.template.querySelector('div[role="ccnavMenuCSS"]');

        if(treeItemCSS !== undefined && treeItemCSS !== null)
        {
            if(this.brandNavigationColorText !== undefined && this.brandNavigationColorText !== null && this.brandNavigationColorText.trim() !== '')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-brandNavigationColorText', this.brandNavigationColorText);
            }

            if(this.brandNavigationBarBackgroundColor !== undefined && this.brandNavigationBarBackgroundColor !== null && this.brandNavigationBarBackgroundColor.trim() !== '')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-brandNavigationBarBackgroundColor', this.brandNavigationBarBackgroundColor);
            }

            if(this.brandNavigationBackgroundColor !== undefined && this.brandNavigationBackgroundColor !== null && this.brandNavigationBackgroundColor.trim() !== '')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-brandNavigationBackgroundColor', this.brandNavigationBackgroundColor);
            }

            if(this.fontFamily !== undefined && this.fontFamily !== null && this.fontFamily.trim() !== '')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-fontFamily', this.fontFamily);
            }

            
            if(this.textTransform !== undefined && this.textTransform !== null && this.textTransform.trim() !== '')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-textTransform', this.textTransform);
            }

            if(this.topLevelItemSpacing !== undefined && this.topLevelItemSpacing !== null)
            {
                treeItemCSS.style.setProperty('--ccnavmenus-topLevelItemSpacing', this.topLevelItemSpacing +'px');
            }

           
            if(this.menuAlignment !== undefined && this.menu !== null && this.menuAlignment === 'Center' )
            {
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-right', 'auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-left', 'auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-closeButton-left', '0');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-closeButton-right', 'auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-vertical-left','calc(50% - 10rem)');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-vertical-float','none');
            }
            else if(this.menuAlignment !== undefined && this.menu !== null && this.menuAlignment === 'Right' )
            {
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-right', '0');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-left', '0');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-closeButton-left', '0');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-closeButton-right', 'auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-vertical-left','auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-vertical-float','right');
            }
            else 
            {
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-right', 'initial');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-left', '0');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-closeButton-left', 'auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-closeButton-right', '0');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-vertical-left','0');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-vertical-float','none');
            }

            if(this.hamburgerMenu)
            {
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-before-after-display', 'none');
            }
            else
            {
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-before-after-display', 'inherit');
            }
        }
    }

    handleUrlReplaceItems(items) {
        if(items !== undefined && items !== null && Array.isArray(items))
        {
            for (var item of items) {

                this.handleUrlReplace(item);
                if(item.items !== undefined && item.items !== null && Array.isArray(item.items))
                {
                    this.handleUrlReplaceItems(item.items);
                }
             
            }
        }

    }

    handleUrlReplace(item)
    {
        
        try {
            
            if(this.urlSubMapJson !== undefined && this.urlSubMapJson !== null && this.urlSubMapJson.trim() !== '')
            {
                let urlSubMap = JSON.parse(this.urlSubMapJson);

                if(urlSubMap !== undefined && urlSubMap !== null && urlSubMap.length > 0)
                {
                    for(let i=0;i<urlSubMap.length;i++)
                    {
                        if(urlSubMap[i].replaceThis === undefined || urlSubMap[i].replaceThis === null || urlSubMap[i].replaceThis.trim() === ''
                            || urlSubMap[i].replaceWith === undefined || urlSubMap[i].replaceWith === null)
                        {
                            continue;
                        }

                        let searchMask = this.escapeRegex(urlSubMap[i].replaceThis);
                        
                        let regEx = new RegExp(searchMask, "ig");
                        
                        let replaceMask = urlSubMap[i].replaceWith;
                        

                        
                        item.href = (item.href !== undefined && item.href !== null) ? item.href.replace(regEx, replaceMask) : item.href;
                        item.label = (item.label !== undefined && item.label !== null) ? item.label.replace(regEx, replaceMask) : item.label;
                            
                        
                    }
                }
            }

            

        } catch(e) {}
    }

    escapeRegex(string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    handleUserInfoReplacements()
    {
        if(this.userInfo.Id !== undefined && this.userInfo.Id !== null)
        {

            let searchMask = this.escapeRegex('[@User.Id]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.Id;
            this.urlSubMapJson = this.urlSubMapJson.replace(regEx,replaceMask);
        } 
        
        if(this.userInfo.AccountId !== undefined && this.userInfo.AccountId !== null)
        {

            let searchMask = this.escapeRegex('[@User.AccountId]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.AccountId;
            this.urlSubMapJson = this.urlSubMapJson.replace(regEx,replaceMask);
        }

        if(this.userInfo.ContactId !== undefined && this.userInfo.ContactId !== null)
        {

            let searchMask = this.escapeRegex('[@User.ContactId]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.ContactId;
            this.urlSubMapJson = this.urlSubMapJson.replace(regEx,replaceMask);
        }

        if(this.userInfo.FirstName !== undefined && this.userInfo.FirstName !== null)
        {

            let searchMask = this.escapeRegex('[@User.FirstName]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.FirstName;
            this.urlSubMapJson = this.urlSubMapJson.replace(regEx,replaceMask);
        }

        if(this.userInfo.LastName !== undefined && this.userInfo.LastName !== null)
        {

            let searchMask = this.escapeRegex('[@User.LastName]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.LastName;
            this.urlSubMapJson = this.urlSubMapJson.replace(regEx,replaceMask);
        }
        
        if(this.userInfo.CommunityNickname !== undefined && this.userInfo.CommunityNickname !== null)
        {

            let searchMask = this.escapeRegex('[@User.CommunityNickname]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.CommunityNickname;
            this.urlSubMapJson = this.urlSubMapJson.replace(regEx,replaceMask);
        }
      
    }

}