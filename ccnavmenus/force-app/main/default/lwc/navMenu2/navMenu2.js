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
import faMain from '@salesforce/resourceUrl/fontawesome';
import formFactor from '@salesforce/client/formFactor';
import userId from '@salesforce/user/Id';
import { CurrentPageReference } from 'lightning/navigation';
import ActiveLanguageCode from '@salesforce/i18n/lang';



export default class NavMenu2 extends LightningElement {

    @api configJSONString = '{}';
    @track urlSubMapJsonModified = this.urlSubMapJsonModified;
    
    get configObj() {
        return JSON.parse(this.configJSONString);
    }

    get configJSONPrettyPrintString() {
        return JSON.stringify(this.configObj, undefined, 4);
    }

    /* General Config */ 
    menuId = 'nameFilter';
    get menuName() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.general?.menuName) || this.configObj?.general?.menuName.trim() === 'undefined') 
        ? '' : this.configObj?.general?.menuName;
        return tmpvalue;
    }

    get language() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.general?.languageFilter) || this.configObj?.general?.languageFilter.trim() === 'undefined') 
        ? 'auto' : this.configObj?.general?.languageFilter;
        return tmpvalue;
    }
    

    get showMenu() {

        let showMenuTmp = true;
        if(formFactor === 'Medium')
        {
            showMenuTmp = (this.configObj?.general?.menuModeTablet === 'hidden') ? false : showMenuTmp;
        }
        else if(formFactor === 'Small') 
        {
            showMenuTmp = (this.configObj?.general?.menuModeMobile === 'hidden') ? false : showMenuTmp;
        }
        else 
        {
            showMenuTmp = (this.configObj?.general?.menuModeDesktop === 'hidden') ? false : showMenuTmp;
        }
        
        return showMenuTmp;

    }

    get isHamburgerMenu() {

        let isHamburgerMenuTmp = false;
        if(formFactor === 'Medium')
        {
            isHamburgerMenuTmp = (this.configObj?.general?.menuModeTablet === 'hamburger') ? true : isHamburgerMenuTmp;
        }
        else if(formFactor === 'Small') 
        {
            isHamburgerMenuTmp = (this.configObj?.general?.menuModeMobile === 'hamburger') ? true : isHamburgerMenuTmp;
        }
        else 
        {
            isHamburgerMenuTmp = (this.configObj?.general?.menuModeDesktop === 'hamburger') ? true : isHamburgerMenuTmp;
        }
        
        return isHamburgerMenuTmp;

    }

    get isVertical() {

        let isVerticalTmp = false;
        if(formFactor === 'Medium')
        {
            isVerticalTmp = (this.configObj?.general?.menuModeTablet === 'allLevels') ? true : isVerticalTmp;
        }
        else if(formFactor === 'Small') 
        {
            isVerticalTmp = (this.configObj?.general?.menuModeMobile === 'allLevels') ? true : isVerticalTmp;
        }
        else 
        {
            isVerticalTmp = (this.configObj?.general?.menuModeDesktop === 'allLevels') ? true : isVerticalTmp;
        }
        
        return isVerticalTmp;

    }

    get isDrillDown()
    {

        let isDrillDownTmp = false;
        if(formFactor === 'Medium')
        {
            isDrillDownTmp = (this.configObj?.general?.menuTypeTablet === 'drilldown') ? true : isDrillDownTmp;
        }
        else if(formFactor === 'Small') 
        {
            isDrillDownTmp = (this.configObj?.general?.menuTypeMobile === 'drilldown') ? true : isDrillDownTmp;
        }
        else 
        {
            isDrillDownTmp = (this.configObj?.general?.menuTypeDesktop === 'drilldown') ? true : isDrillDownTmp;
        }
        
        return isDrillDownTmp;
    }

    get isMega()
    {

        let isMegaTmp = false;
        if(formFactor === 'Medium')
        {
            isMegaTmp = (this.configObj?.general?.menuTypeTablet === 'mega') ? true : isMegaTmp;
        }
        else if(formFactor === 'Small') 
        {
            isMegaTmp = (this.configObj?.general?.menuTypeMobile === 'mega') ? true : isMegaTmp;
        }
        else 
        {
            isMegaTmp = (this.configObj?.general?.menuTypeDesktop === 'mega') ? true : isMegaTmp;
        }
        
        return isMegaTmp;
    }

    get debugMode() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.general?.debugMode)) 
        ? false : this.configObj?.general?.debugMode;
        return tmpvalue;
    }

    get isDebugAndPreview() {
        return (this.debugMode === true && this.isInSitePreview === true);
    }

    /* [{"replaceThis":"[!recordId]","replaceWith":"{!recordId}"}] */ 
    get urlSubMapJson() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.general?.urlSubMap)) 
        ? undefined : JSON.stringify(this.configObj?.general?.urlSubMap);
        return tmpvalue;
    }

    get cacheEnabled() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.general?.cacheEnabled)) 
        ? false : this.configObj?.general?.cacheEnabled;

        if(tmpvalue === true)
        {
            
            let alphanumericExp = /^([0-9]|[a-z])+([0-9a-z]*)$/i;

            if(!this.isStringEmpty(this.cacheName) && this.cacheName.match(alphanumericExp) !== null 
            && !this.isStringEmpty(this.cacheKey) && this.cacheKey.match(alphanumericExp) !== null )
            {
                this.cacheKeyCalculated = this.cacheKey + userId + this.language;
            }
            else 
            {
                tmpvalue = false;
                this.consoleLog('cache_name_key_error','clientCacheStatus: ');
            }
        }
        else 
        {
            this.consoleLog('cache_disabled','clientCacheStatus: ');
        }

        return tmpvalue;
    }
    
    get cacheName() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.general?.cacheName) || this.configObj?.general?.cacheName.trim() === 'undefined') 
        ? '' : this.configObj?.general?.cacheName;
        return tmpvalue;
    }

    get cacheKey() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.general?.cacheKey) || this.configObj?.general?.cacheKey.trim() === 'undefined') 
        ? '' : this.configObj?.general?.cacheKey;
        return tmpvalue;
    }


    /* Labels Config */
    get overflowLabel() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.labels?.overflowLabel) || this.configObj?.labels?.overflowLabel.trim() === 'undefined') 
        ? '' : this.configObj?.labels?.overflowLabel;
        return tmpvalue;
    }
    get drillDownBackButtonLabel() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.labels?.drilldownBackLabel) || this.configObj?.labels?.drilldownBackLabel.trim() === 'undefined') 
        ? '' : this.configObj?.labels?.drilldownBackLabel;
        return tmpvalue;
    }
    get allLabel() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.labels?.drilldownGotoLabel) || this.configObj?.labels?.drilldownGotoLabel.trim() === 'undefined') 
        ? '' : this.configObj?.labels?.drilldownGotoLabel;
        return tmpvalue;
    }


    @api uuid = crypto.randomUUID();
    @track pageRef;

    get isInSitePreview() {
        
        return (this.pageRef?.state?.app === "commeditor" || this.pageRef?.state?.view === "editor");
    }
    

    //styling inputs
    get hideHamburgerMenuAnimation() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.hideHamburgerMenuAnimation)) 
        ? false : this.configObj?.styles?.hideHamburgerMenuAnimation;
        return tmpvalue;
    }

    get menuAlignment() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.menuAlignment) || this.configObj?.styles?.menuAlignment.trim() === 'undefined') 
        ? 'center' : this.configObj?.styles?.menuAlignment;
        return tmpvalue;
    }

    get menuItemVerticalPadding() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.menuItemVerticalPadding)) 
        ? 20 : this.configObj?.styles?.menuItemVerticalPadding;
        return tmpvalue;
    }

    get topLevelItemSpacing() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.topLevelItemSpacing)) 
        ? 20 : this.configObj?.styles?.topLevelItemSpacing;
        return tmpvalue;
    }

    get overrideFontFamily() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.overrideFontFamily) || this.configObj?.styles?.overrideFontFamily.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.overrideFontFamily;
        return tmpvalue;
    }

    get overrideTextCase() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.overrideTextCase) || this.configObj?.styles?.overrideTextCase.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.overrideTextCase;
        return tmpvalue;
    }

    get navMenuClassNames() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.menuCSSClasses) || this.configObj?.styles?.menuCSSClasses.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.menuCSSClasses;
        return tmpvalue;
    }

    /* Color Config */
    get navContainerTextColor() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navContainerTextColor) || this.configObj?.styles?.navContainerTextColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerTextColor;
        return tmpvalue;
    }

    get navContainerTextColorHover() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navContainerTextColorHover) || this.configObj?.styles?.navContainerTextColorHover.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerTextColorHover;
        return tmpvalue;
    }

    get navContainerBackgroundColor() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navContainerBackgroundColor) || this.configObj?.styles?.navContainerBackgroundColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerBackgroundColor;
        return tmpvalue;
    }

    get navContainerBackgroundColorHover() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navContainerBackgroundColorHover) || this.configObj?.styles?.navContainerBackgroundColorHover.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerBackgroundColorHover;
        return tmpvalue;
    }

    get navTextColor() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navTextColor) || this.configObj?.styles?.navTextColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navTextColor;
        return tmpvalue;
    }

    get navTextColorHover() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navTextColorHover) || this.configObj?.styles?.navTextColorHover.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navTextColorHover;
        return tmpvalue;
    }

    get navBackgroundColor() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navBackgroundColor) || this.configObj?.styles?.navBackgroundColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navBackgroundColor;
        return tmpvalue;
    }

    get navBackgroundColorHover() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navBackgroundColorHover) || this.configObj?.styles?.navBackgroundColorHover.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navBackgroundColorHover;
        return tmpvalue;
    }

    get navContainerBorderStyle() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navContainerBorderStyle) || this.configObj?.styles?.navContainerBorderStyle.trim() === 'undefined') 
        ? 'none' : this.configObj?.styles?.navContainerBorderStyle;
        return tmpvalue;
    }

    get navContainerBorderDirection() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navContainerBorderDirection) || this.configObj?.styles?.navContainerBorderDirection.length === 0) 
        ? ['bottom'] : this.configObj?.styles?.navContainerBorderDirection;
        return tmpvalue;
    }

    get navContainerBorderColor() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navContainerBorderColor) || this.configObj?.styles?.navContainerBorderColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerBorderColor;
        return tmpvalue;
    }

    get navContainerBorderWidth() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navContainerBorderWidth)) 
        ? 1 : this.configObj?.styles?.navContainerBorderWidth;
        return tmpvalue;
    }

    get navBorderStyle() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navBorderStyle) || this.configObj?.styles?.navBorderStyle.trim() === 'undefined') 
        ? 'none' : this.configObj?.styles?.navBorderStyle;
        return tmpvalue;
    }

    get navBorderDirection() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navBorderDirection) || this.configObj?.styles?.navBorderDirection.length === 0) 
        ? ['bottom'] : this.configObj?.styles?.navBorderDirection;
        return tmpvalue;
    }

    get navBorderColor() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navBorderColor) || this.configObj?.styles?.navBorderColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navBorderColor;
        return tmpvalue;
    }

    get navBorderWidth() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navBorderWidth)) 
        ? 1 : this.configObj?.styles?.navBorderWidth;
        return tmpvalue;
    }
    
    get navAlsoApplyToSelectedState() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navAlsoApplyToSelectedState)) 
        ? false : this.configObj?.styles?.navAlsoApplyToSelectedState;
        return tmpvalue;
    }

    get navContainerAlsoApplyToSelectedState() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navContainerAlsoApplyToSelectedState)) 
        ? false : this.configObj?.styles?.navContainerAlsoApplyToSelectedState;
        return tmpvalue;
    }

    get navAllLevelBorderStyle() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navAllLevelBorderStyle) || this.configObj?.styles?.navAllLevelBorderStyle.trim() === 'undefined') 
        ? 'none' : this.configObj?.styles?.navAllLevelBorderStyle;
        return tmpvalue;
    }

    get navAllLevelBorderColor() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navAllLevelBorderColor) || this.configObj?.styles?.navAllLevelBorderColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navAllLevelBorderColor;
        return tmpvalue;
    }

    get navAllLevelBorderWidth() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navAllLevelBorderWidth)) 
        ? 1 : this.configObj?.styles?.navAllLevelBorderWidth;
        return tmpvalue;
    }

    get navAllLevelShadowBoxType() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navAllLevelShadowBoxType) || this.configObj?.styles?.navAllLevelShadowBoxType.trim() === 'undefined') 
        ? 'none' : this.configObj?.styles?.navAllLevelShadowBoxType;
        return tmpvalue;
    }

    get navAllLevelShadowBoxColor() {
        let tmpvalue = (this.isStringEmpty(this.configObj?.styles?.navAllLevelShadowBoxColor) || this.configObj?.styles?.navAllLevelShadowBoxColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navAllLevelShadowBoxColor;
        return tmpvalue;
    }

    get navAllLevelShadowBoxXOffset() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navAllLevelShadowBoxXOffset)) 
        ? 1 : this.configObj?.styles?.navAllLevelShadowBoxXOffset;
        return tmpvalue;
    }

    get navAllLevelShadowBoxYOffset() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navAllLevelShadowBoxYOffset)) 
        ? 1 : this.configObj?.styles?.navAllLevelShadowBoxYOffset;
        return tmpvalue;
    }

    get navAllLevelShadowBoxBlur() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navAllLevelShadowBoxBlur)) 
        ? 1 : this.configObj?.styles?.navAllLevelShadowBoxBlur;
        return tmpvalue;
    }

    get navAllLevelShadowBoxSpread() {
        let tmpvalue = (this.isObjectEmpty(this.configObj?.styles?.navAllLevelShadowBoxSpread)) 
        ? 1 : this.configObj?.styles?.navAllLevelShadowBoxSpread;
        return tmpvalue;
    }



    @track items = [];
    @track url = '';
    @track hamburgerMenuVisible = false;
   
    @track clickListener;
    @track userInfo = {};
    @track cacheKeyCalculated;
    
    
    get menuAriaAnnouncement()
    {
        
        if(this.debugMode === true)
        {
            debugger;
        }

        if(this.items !== undefined && this.items !== null && this.items.length > 0)
        {
            return ' Menu first Item of ' + this.items.length + ' items';
        }
        else 
        {
            return '';
        }
    }

    get menuAlignmentClass() {

        if(this.debugMode === true)
        {
            debugger;
        }

        const cssClasses = ['slds-grid hamburgerIconContainer'];

        // Default is 'left' and only 'center' and 'right' need to be set explicitly
        if (this.menuAlignment === 'center') {
            cssClasses.push('slds-grid_align-center');
        } else if (this.menuAlignment === 'right') {
            cssClasses.push('slds-grid_align-end');
        }

        //return (this.isVertical === true || this.isHamburgerMenu === true) ? cssClasses.join(' ') : '';
        return cssClasses.join(' ');
    }

    get hamburgerMenuClass() {

        if(this.debugMode === true)
        {
            debugger;
        }

        const cssClasses = ['slds-button slds-button_icon slds-button_icon-inverse ccnavmenu-hamburger-button slds-p-horizontal_x-small'];

        if (this.hideHamburgerMenuAnimation === false) {
            cssClasses.push('showHamburgerAnimation');
        } 

        return cssClasses.join(' ');

    }

    get closeButtonDivClasses() {

        if(this.debugMode === true)
        {
            debugger;
        }

        const cssClasses = ['closeButtonDiv'];
        if (this.menuAlignment === 'left') {
            cssClasses.push('closeButtonDivLeft');
        }

        return cssClasses.join(' ');
    }

    trueVar = true;

    //wire functions
    wireFetchMenu;
    @wire(fetchMenu,{menuId: '$menuId', language: '$language', nameFilter: '$menuName'})
    fetchMenuImperativeWiring(result) 
    {
        if(this.debugMode === true)
        {
            debugger;
        }

        if (result.data) {
            let resData = JSON.parse(result.data)
            if(resData.menu)
            {
                try {

                    if(this.items === undefined || this.items === null || this.items.length === 0)
                    {
                        this.consoleLog('no_cache','clientCacheStatus: ');
                    }

                    this.items = resData?.menu;
                    this.userInfo = resData?.user;
                    
                    if(!this.isStringEmpty(this.urlSubMapJson))
                    {
                        this.handleUserInfoReplacements();
                        if(this.items && Array.isArray(this.items))
                        {
                            this.handleUrlReplaceItems(this.items);
                        }
                    }
                    
                    this.putMenuInCache();
                    this.error = undefined;
                    this.consoleLog(resData.cacheStatus + '','cacheStatus: ');
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
        
        if(this.debugMode === true)
        {
            debugger;
        }

        try {
            this.url = window.location.href.split('?')[0];
        } catch(err){
            this.url = document.URL.split('?')[0];
        }
        
        loadStyle(this, navMenuCSS);
        loadStyle(this, faMain + '/css/fontawesome.min.css');
        loadStyle(this, faMain + '/css/brands.min.css');
        loadStyle(this, faMain + '/css/solid.min.css');
        
       if(this.cacheEnabled === true)
        {
            this.getMenuFromCache();
        }

        try {
            
            if(this.language !== undefined && this.language !== null && this.language.trim() === 'auto')
            {
                let lang = this.getURLParameter('language');
                lang = (this.isStringEmpty(lang)) ? ActiveLanguageCode : lang;
                this.language += (!this.isStringEmpty(lang)) ? lang : '';
            }
        } catch(e){}

        this.setStylingProperties();

        if(this.isHamburgerMenu === true)
        {
            this.clickListener = this.handleCloseHamburgerMenu.bind(this);
            window.addEventListener(
                'click',
                this.clickListener
            );
        }
        
        
    }

    disconnectedCallback() {

        if(this.debugMode === true)
        {
            debugger;
        }

        if(this.isHamburgerMenu === true)
        {
            window.removeEventListener('click', this.clickListener);
        }
    }

    renderedCallback()
    {
        if(this.debugMode === true)
        {
            debugger;
        }

        this.setStylingProperties();
        if(this.template.querySelector('c-tree') !== undefined && this.template.querySelector('c-tree') !== null && typeof this.template.querySelector('c-tree').handleWindowResize === 'function')
        {
            this.template.querySelector('c-tree').handleWindowResize();
        }
    }

    toggleHamburgerMenu(e)
    {

        if(this.debugMode === true)
        {
            debugger;
        }

        this.hamburgerMenuVisible = !this.hamburgerMenuVisible;
        
        let hamburgerMenu = this.template.querySelector('[data-id="toggleHamburgerMenu"]');
        if(hamburgerMenu !== undefined && hamburgerMenu !== null)
        {
            hamburgerMenu.classList.toggle('opened');
            hamburgerMenu.setAttribute('aria-expanded', hamburgerMenu.classList.contains('opened'));
        }
        e.preventDefault();
        e.stopPropagation();
    }

    handleCloseHamburgerMenu(e)
    {

        if(this.debugMode === true)
        {
            debugger;
        }

        if(this.shouldCloseHamburgerMenu(e) === true)
        {
            this.closeHamburgerMenu();
        }

    }

    shouldCloseHamburgerMenu(e) {

        if(this.debugMode === true)
        {
            debugger;
        }

        if(e.target !== undefined && e.target !== null)
        {
            if(e.detail.forceClose !== undefined && e.detail.forceClose !== null && e.detail.forceClose === true)
            {
                return true;
            }

            //if click is from drill down back button
            if(e.target.tagName === 'BUTTON' && e.target.dataset.id !== undefined && e.target.dataset.id === 'back') {
                return false;
            }

            //if click is from outside the component
            if((e.target.tagName !== 'CCNAVMENUS-NAV-MENU' && e.target.tagName !== 'CCNAVMENUS-NAV-MENU2') ||
            ((e.target.tagName === 'CCNAVMENUS-NAV-MENU' || e.target.tagName === 'CCNAVMENUS-NAV-MENU2') && e.target.uuid !== this.uuid))
            {
                return true;
            }
        }

        return false;

    }

    closeHamburgerMenu()
    {
        if(this.debugMode === true)
        {
            debugger;
        }

        this.hamburgerMenuVisible = false;
        let hamburgerMenu = this.template.querySelector('[data-id="toggleHamburgerMenu"]');
        if(hamburgerMenu !== undefined && hamburgerMenu !== null)
        {
            hamburgerMenu.classList.remove('opened');
            hamburgerMenu.setAttribute('aria-expanded', false);
        }
    }


    checkMobile()
    {
        if(this.debugMode === true)
        {
            debugger;
        }
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        if(check === false && formFactor === 'Small')
        {
            check = true;
        }
        return check;
    }

    getURLParameter(name) {
        if(this.debugMode === true)
        {
            debugger;
        }
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
      }


    setStylingProperties()
    {
        
        if(this.debugMode === true)
        {
            debugger;
        }

        let treeItemCSS = this.template.querySelector('div[role="ccnavMenuCSS"]');

        if(!this.isObjectEmpty(treeItemCSS))
        {
            if(!this.isStringEmpty(this.navContainerTextColor))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-navContainer-text-color', this.navContainerTextColor);
            }

            if(!this.isStringEmpty(this.navContainerTextColorHover))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-navContainer-text-color-hover', this.navContainerTextColorHover);
                if(this.navContainerAlsoApplyToSelectedState === true)
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-text-color-selected', this.navContainerTextColorHover);
                }
            }

            if(!this.isStringEmpty(this.navContainerBackgroundColor))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-navContainer-background-color', this.navContainerBackgroundColor);
            }

            if(!this.isStringEmpty(this.navContainerBackgroundColorHover))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-navContainer-background-color-hover', this.navContainerBackgroundColorHover);
                if(this.navContainerAlsoApplyToSelectedState === true)
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-background-color-selected', this.navContainerBackgroundColorHover);
                }
            }

            if(!this.isStringEmpty(this.navTextColor))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-text-color', this.navTextColor);
            }

            if(!this.isStringEmpty(this.navTextColorHover))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-text-color-hover', this.navTextColorHover);
                if(this.navAlsoApplyToSelectedState === true)
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-text-color-selected', this.navTextColorHover);
                }
            }
            
            if(!this.isStringEmpty(this.navBackgroundColor))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-background-color', this.navBackgroundColor);
            }

            if(!this.isStringEmpty(this.navBackgroundColorHover))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-background-color-hover', this.navBackgroundColorHover);
                if(this.navAlsoApplyToSelectedState === true)
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-background-color-selected', this.navBackgroundColorHover);
                }
            }



            if(!this.isStringEmpty(this.overrideFontFamily))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-fontFamily', this.overrideFontFamily);
            }

            
            if(!this.isStringEmpty(this.overrideTextCase))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-textTransform', this.overrideTextCase);
            }

            if(this.menuItemVerticalPadding !== undefined && this.menuItemVerticalPadding !== null)
            {
                treeItemCSS.style.setProperty('--ccnavmenus-menuItemVerticalPadding', this.menuItemVerticalPadding +'px');
            }

            if(this.topLevelItemSpacing !== undefined && this.topLevelItemSpacing !== null)
            {
                treeItemCSS.style.setProperty('--ccnavmenus-topLevelItemSpacing', this.topLevelItemSpacing +'px');
            }

           
            if(this.menuAlignment !== undefined && this.menu !== null && this.menuAlignment === 'center' )
            {
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-right', 'auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-left', 'auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-closeButton-left', '0');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-closeButton-right', 'auto');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-vertical-left','calc(50% - 10rem)');
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-vertical-float','none');
            }
            else if(this.menuAlignment !== undefined && this.menu !== null && this.menuAlignment === 'right' )
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

            if(this.isHamburgerMenu === true)
            {
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-before-after-display', 'none');
            }
            else
            {
                treeItemCSS.style.setProperty('--ccnavmenus-drillDownNav-list-before-after-display', 'inherit');
            }

            if(!this.isStringEmpty(this.navAllLevelBorderStyle) && this.navAllLevelBorderStyle !== 'none')
            {
                let borderStyle = '';
                borderStyle += this.navAllLevelBorderWidth + 'px ';
                borderStyle += this.navAllLevelBorderStyle + ' ';
                borderStyle += (this.isStringEmpty(this.navAllLevelBorderColor)) ? 'var(--dxp-g-brand)' : this.navAllLevelBorderColor;

                treeItemCSS.style.setProperty('--ccnavmenus-nav-allLevel-border', borderStyle);
            }

            if(!this.isStringEmpty(this.navContainerBorderStyle) && this.navContainerBorderStyle !== 'none')
            {
                let borderStyle = '';
                borderStyle += this.navContainerBorderWidth + 'px ';
                borderStyle += this.navContainerBorderStyle + ' ';
                borderStyle += (this.isStringEmpty(this.navContainerBorderColor)) ? 'var(--dxp-g-brand)' : this.navContainerBorderColor;

                if(!this.isObjectEmpty(this.navContainerBorderDirection) && this.navContainerBorderDirection.includes('bottom'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-bottom', borderStyle);
                    if(this.navContainerAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-bottom-selected', borderStyle);
                    }
                }

                if(!this.isObjectEmpty(this.navContainerBorderDirection) && this.navContainerBorderDirection.includes('top'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-top', borderStyle);
                    if(this.navContainerAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-top-selected', borderStyle);
                    }
                }

                if(!this.isObjectEmpty(this.navContainerBorderDirection) && this.navContainerBorderDirection.includes('left'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-left', borderStyle);
                    if(this.navContainerAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-left-selected', borderStyle);
                    }
                }

                if(!this.isObjectEmpty(this.navContainerBorderDirection) && this.navContainerBorderDirection.includes('right'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-right', borderStyle);
                    if(this.navContainerAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-right-selected', borderStyle);
                    }
                }

            }


            if(!this.isStringEmpty(this.navBorderStyle) && this.navBorderStyle !== 'none')
            {
                let borderStyle = '';
                borderStyle += this.navBorderWidth + 'px ';
                borderStyle += this.navBorderStyle + ' ';
                borderStyle += (this.isStringEmpty(this.navBorderColor)) ? 'var(--dxp-g-brand)' : this.navBorderColor;

                if(!this.isObjectEmpty(this.navBorderDirection) && this.navBorderDirection.includes('bottom'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-border-bottom', borderStyle);
                    if(this.navAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-nav-border-bottom-selected', borderStyle);
                    }
                }

                if(!this.isObjectEmpty(this.navBorderDirection) && this.navBorderDirection.includes('top'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-border-top', borderStyle);
                    if(this.navAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-nav-border-top-selected', borderStyle);
                    }
                }

                if(!this.isObjectEmpty(this.navBorderDirection) && this.navBorderDirection.includes('left'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-border-left', borderStyle);
                    if(this.navAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-nav-border-left-selected', borderStyle);
                    }
                }

                if(!this.isObjectEmpty(this.navBorderDirection) && this.navBorderDirection.includes('right'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-border-right', borderStyle);
                    if(this.navAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-nav-border-right-selected', borderStyle);
                    }
                }

            }


            if(!this.isStringEmpty(this.navAllLevelShadowBoxType) && this.navAllLevelShadowBoxType !== 'none')
            {

                let shadowBoxStyle = '';
                shadowBoxStyle += (this.navAllLevelShadowBoxType === 'inset') ? 'inset ' : '';
                shadowBoxStyle += this.navAllLevelShadowBoxXOffset + 'px ' + this.navAllLevelShadowBoxYOffset + 'px ' + this.navAllLevelShadowBoxBlur + 'px ' + this.navAllLevelShadowBoxSpread + 'px ';
                shadowBoxStyle += (!this.isStringEmpty(this.navAllLevelShadowBoxColor)) ? this.navAllLevelShadowBoxColor : 'var(--dxp-g-brand)';

                treeItemCSS.style.setProperty('--ccnavmenus-nav-allLevel-shadowBox', shadowBoxStyle);

            }


        }
    }

    handleUrlReplaceItems(items) {
        
        if(this.debugMode === true)
        {
            debugger;
        }

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
        if(this.debugMode === true)
        {
            debugger;
        }
        
        try {
            
            if(!this.isStringEmpty(this.urlSubMapJsonModified))
            {
                let urlSubMap = JSON.parse(this.urlSubMapJsonModified);

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

        if(this.debugMode === true)
        {
            debugger;
        }

        this.urlSubMapJsonModified = JSON.parse(JSON.stringify(this.urlSubMapJson));

        if(this.userInfo.Id !== undefined && this.userInfo.Id !== null)
        {

            let searchMask = this.escapeRegex('[@User.Id]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.Id;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        } 
        
        if(this.userInfo.AccountId !== undefined && this.userInfo.AccountId !== null)
        {

            let searchMask = this.escapeRegex('[@User.AccountId]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.AccountId;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }
        
        if(this.userInfo?.Account?.Name !== undefined && this.userInfo?.Account?.Name !== null)
        {

            let searchMask = this.escapeRegex('[@User.AccountName]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo?.Account?.Name;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(this.userInfo.ContactId !== undefined && this.userInfo.ContactId !== null)
        {

            let searchMask = this.escapeRegex('[@User.ContactId]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.ContactId;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(this.userInfo.FirstName !== undefined && this.userInfo.FirstName !== null)
        {

            let searchMask = this.escapeRegex('[@User.FirstName]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.FirstName;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(!this.isStringEmpty(this.userInfo.FirstName))
        {

            let searchMask = this.escapeRegex('[@User.FirstInitial]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.FirstName.substr(0,1);
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(this.userInfo.LastName !== undefined && this.userInfo.LastName !== null)
        {

            let searchMask = this.escapeRegex('[@User.LastName]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.LastName;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(!this.isStringEmpty(this.userInfo.LastName))
        {

            let searchMask = this.escapeRegex('[@User.LastInitial]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.LastName.substr(0,1);
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }
        
        if(this.userInfo.CommunityNickname !== undefined && this.userInfo.CommunityNickname !== null)
        {

            let searchMask = this.escapeRegex('[@User.CommunityNickname]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.CommunityNickname;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }
      
    }

    getMenuFromCache()
    {

        if(this.debugMode === true)
        {
            debugger;
        }

        if (this.cacheEnabled === true && 'caches' in window) {

            caches.open(this.cacheName).then(cache => {
                cache.match(this.cacheKeyCalculated).then(response => {
                    if(response) {
                        response.json().then(jsonValue => {

                            try {
                                this.items = JSON.parse(jsonValue);
                                this.consoleLog('from_cache','clientCacheStatus: ');
                             } catch(err) {
                                this.consoleLog('cache_error','clientCacheStatus: ');
                                }

                        });
                        
                    }

                }); 
            })
        }

    }

    putMenuInCache()
    {
        if(this.debugMode === true)
        {
            debugger;
        }

        if (this.cacheEnabled === true && 'caches' in window) 
        {

            caches.open(this.cacheName).then(cache => {
                cache.put(this.cacheKeyCalculated, Response.json(JSON.stringify(this.items)));
            });
        }

    }
    
    @wire(CurrentPageReference) handlePageReference(pageReference) {
        // do something with pageReference.state
        this.pageRef = pageReference;
        let tmpItemsString = JSON.stringify(this.items);
        this.items = undefined;
        this.items = JSON.parse(tmpItemsString);
    }

    consoleLog(text = '', before = '', after = '')
    {
        if(this.debugMode === true)
        {
            console.log(before + text + after);
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