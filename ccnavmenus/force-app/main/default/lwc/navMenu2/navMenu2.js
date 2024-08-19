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
import { CurrentPageReference } from 'lightning/navigation';

import * as generalUtils from 'c/gtaUtilsGeneral';
import * as experienceUtils from 'c/gtaUtilsExperience';
import * as cacheUtils from 'c/gtaUtilsCache';
import * as userUtils from 'c/gtaUtilsUser';
import * as deviceUtils from 'c/gtaUtilsDevice';


export default class NavMenu2 extends LightningElement {

    @api configJSONString = '{}';
    @track urlSubMapJsonModified = this.urlSubMapJsonModified;
    
    get configObj() {
        return JSON.parse(this.configJSONString);
    }

    get configJSONPrettyPrintString() {
        return generalUtils.prettyPrintJSON(this.configObj);
    }

    /* General Config */ 
    menuId = 'nameFilter';
    get menuName() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.general?.menuName) || this.configObj?.general?.menuName.trim() === 'undefined') 
        ? '' : this.configObj?.general?.menuName;
        return tmpvalue;
    }

    get language() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.general?.languageFilter) || this.configObj?.general?.languageFilter.trim() === 'undefined') 
        ? 'auto' : this.configObj?.general?.languageFilter;
        return tmpvalue;
    }
    

    get showMenu() {

        let showMenuTmp = true;
        if(deviceUtils.getFormFactor() === 'Medium')
        {
            showMenuTmp = (this.configObj?.general?.menuModeTablet === 'hidden') ? false : showMenuTmp;
        }
        else if(deviceUtils.getFormFactor() === 'Small') 
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
        if(deviceUtils.getFormFactor() === 'Medium')
        {
            isHamburgerMenuTmp = (this.configObj?.general?.menuModeTablet === 'hamburger') ? true : isHamburgerMenuTmp;
        }
        else if(deviceUtils.getFormFactor() === 'Small') 
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
        if(deviceUtils.getFormFactor() === 'Medium')
        {
            isVerticalTmp = (this.configObj?.general?.menuModeTablet === 'allLevels') ? true : isVerticalTmp;
        }
        else if(deviceUtils.getFormFactor() === 'Small') 
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
        if(deviceUtils.getFormFactor() === 'Medium')
        {
            isDrillDownTmp = (this.configObj?.general?.menuTypeTablet === 'drilldown') ? true : isDrillDownTmp;
        }
        else if(deviceUtils.getFormFactor() === 'Small') 
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
        if(deviceUtils.getFormFactor() === 'Medium')
        {
            isMegaTmp = (this.configObj?.general?.menuTypeTablet === 'mega') ? true : isMegaTmp;
        }
        else if(deviceUtils.getFormFactor() === 'Small') 
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
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.general?.debugMode)) 
        ? false : this.configObj?.general?.debugMode;
        return tmpvalue;
    }

    get isDebugAndPreview() {
        return (this.debugMode === true && this.isInSitePreview === true);
    }

    /* [{"replaceThis":"[!recordId]","replaceWith":"{!recordId}"}] */ 
    get urlSubMapJson() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.general?.urlSubMap)) 
        ? undefined : JSON.stringify(this.configObj?.general?.urlSubMap);
        return tmpvalue;
    }

    get cacheEnabled() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.general?.cacheEnabled)) 
        ? false : this.configObj?.general?.cacheEnabled;

        if(tmpvalue === true)
        {
            
            if(!generalUtils.isStringEmpty(this.cacheName) && generalUtils.isAlphaNumeric(this.cacheName) === true 
            && !generalUtils.isStringEmpty(this.cacheKey) && generalUtils.isAlphaNumeric(this.cacheKey) === true )
            {
                this.cacheKeyCalculated = this.cacheKey + userUtils.getUserId() + this.language;
            }
            else 
            {
                tmpvalue = false;
                generalUtils.consoleLog(this.debugMode, 'cache_name_key_error','clientCacheStatus: ');
            }
        }
        else 
        {
            generalUtils.consoleLog(this.debugMode, 'cache_disabled','clientCacheStatus: ');
        }

        return tmpvalue;
    }
    
    get cacheName() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.general?.cacheName) || this.configObj?.general?.cacheName.trim() === 'undefined') 
        ? '' : this.configObj?.general?.cacheName;
        return tmpvalue;
    }

    get cacheKey() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.general?.cacheKey) || this.configObj?.general?.cacheKey.trim() === 'undefined') 
        ? '' : this.configObj?.general?.cacheKey;
        return tmpvalue;
    }


    /* Labels Config */
    get overflowLabel() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.labels?.overflowLabel) || this.configObj?.labels?.overflowLabel.trim() === 'undefined') 
        ? '' : this.configObj?.labels?.overflowLabel;
        return tmpvalue;
    }
    get drillDownBackButtonLabel() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.labels?.drilldownBackLabel) || this.configObj?.labels?.drilldownBackLabel.trim() === 'undefined') 
        ? '' : this.configObj?.labels?.drilldownBackLabel;
        return tmpvalue;
    }
    get allLabel() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.labels?.drilldownGotoLabel) || this.configObj?.labels?.drilldownGotoLabel.trim() === 'undefined') 
        ? '' : this.configObj?.labels?.drilldownGotoLabel;
        return tmpvalue;
    }


    @api uuid = generalUtils.generateUniqueIdentifier();
    @track pageRef;

    get isInSitePreview() {
        
        return experienceUtils.isInSitePreview();
    }
    

    //styling inputs
    get hideHamburgerMenuAnimation() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.hideHamburgerMenuAnimation)) 
        ? false : this.configObj?.styles?.hideHamburgerMenuAnimation;
        return tmpvalue;
    }

    get menuAlignment() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.menuAlignment) || this.configObj?.styles?.menuAlignment.trim() === 'undefined') 
        ? 'center' : this.configObj?.styles?.menuAlignment;
        return tmpvalue;
    }

    get menuItemVerticalPadding() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.menuItemVerticalPadding)) 
        ? 20 : this.configObj?.styles?.menuItemVerticalPadding;
        return tmpvalue;
    }

    get topLevelItemSpacing() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.topLevelItemSpacing)) 
        ? 20 : this.configObj?.styles?.topLevelItemSpacing;
        return tmpvalue;
    }

    get overrideFontFamily() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.overrideFontFamily) || this.configObj?.styles?.overrideFontFamily.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.overrideFontFamily;
        return tmpvalue;
    }

    get overrideFontSize() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.overrideFontSize)) 
        ? undefined : this.configObj?.styles?.overrideFontSize;
        return tmpvalue;
    }

    get overrideFontSizeMobile() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.overrideFontSizeMobile)) 
        ? undefined : this.configObj?.styles?.overrideFontSizeMobile;
        return tmpvalue;
    }

    get sldsIconSize() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.sldsIconSize) || this.configObj?.styles?.sldsIconSize.trim() === 'undefined') 
        ? '1' : this.configObj?.styles?.sldsIconSize;
        try {
            tmpvalue = parseFloat(tmpvalue);
        } catch(err){
            tmpvalue = 1;
        }
        return tmpvalue;
    }

    get iconSpacing() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.iconSpacing)) 
        ? 10 : this.configObj?.styles?.iconSpacing;
        return tmpvalue;
    }

    get overrideTextCase() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.overrideTextCase) || this.configObj?.styles?.overrideTextCase.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.overrideTextCase;
        return tmpvalue;
    }

    get navMenuClassNames() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.menuCSSClasses) || this.configObj?.styles?.menuCSSClasses.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.menuCSSClasses;
        return tmpvalue;
    }

    /* Color Config */
    get navContainerTextColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navContainerTextColor) || this.configObj?.styles?.navContainerTextColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerTextColor;
        return tmpvalue;
    }

    get navContainerTextColorHover() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navContainerTextColorHover) || this.configObj?.styles?.navContainerTextColorHover.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerTextColorHover;
        return tmpvalue;
    }

    get navContainerBackgroundColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navContainerBackgroundColor) || this.configObj?.styles?.navContainerBackgroundColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerBackgroundColor;
        return tmpvalue;
    }

    get navContainerBackgroundColorHover() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navContainerBackgroundColorHover) || this.configObj?.styles?.navContainerBackgroundColorHover.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerBackgroundColorHover;
        return tmpvalue;
    }

    get navTextColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navTextColor) || this.configObj?.styles?.navTextColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navTextColor;
        return tmpvalue;
    }

    get navTextColorHover() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navTextColorHover) || this.configObj?.styles?.navTextColorHover.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navTextColorHover;
        return tmpvalue;
    }

    get navBackgroundColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navBackgroundColor) || this.configObj?.styles?.navBackgroundColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navBackgroundColor;
        return tmpvalue;
    }

    get navBackgroundColorHover() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navBackgroundColorHover) || this.configObj?.styles?.navBackgroundColorHover.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navBackgroundColorHover;
        return tmpvalue;
    }

    get navContainerBorderStyle() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navContainerBorderStyle) || this.configObj?.styles?.navContainerBorderStyle.trim() === 'undefined') 
        ? 'none' : this.configObj?.styles?.navContainerBorderStyle;
        return tmpvalue;
    }

    get navContainerBorderDirection() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navContainerBorderDirection) || this.configObj?.styles?.navContainerBorderDirection.length === 0) 
        ? ['bottom'] : this.configObj?.styles?.navContainerBorderDirection;
        return tmpvalue;
    }

    get navContainerBorderColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navContainerBorderColor) || this.configObj?.styles?.navContainerBorderColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navContainerBorderColor;
        return tmpvalue;
    }

    get navContainerBorderWidth() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navContainerBorderWidth)) 
        ? 1 : this.configObj?.styles?.navContainerBorderWidth;
        return tmpvalue;
    }

    get navBorderStyle() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navBorderStyle) || this.configObj?.styles?.navBorderStyle.trim() === 'undefined') 
        ? 'none' : this.configObj?.styles?.navBorderStyle;
        return tmpvalue;
    }

    get navBorderDirection() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navBorderDirection) || this.configObj?.styles?.navBorderDirection.length === 0) 
        ? ['bottom'] : this.configObj?.styles?.navBorderDirection;
        return tmpvalue;
    }

    get navBorderColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navBorderColor) || this.configObj?.styles?.navBorderColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navBorderColor;
        return tmpvalue;
    }

    get navBorderWidth() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navBorderWidth)) 
        ? 1 : this.configObj?.styles?.navBorderWidth;
        return tmpvalue;
    }
    
    get navAlsoApplyToSelectedState() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navAlsoApplyToSelectedState)) 
        ? false : this.configObj?.styles?.navAlsoApplyToSelectedState;
        return tmpvalue;
    }

    get navContainerAlsoApplyToSelectedState() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navContainerAlsoApplyToSelectedState)) 
        ? false : this.configObj?.styles?.navContainerAlsoApplyToSelectedState;
        return tmpvalue;
    }

    get navAllLevelBorderStyle() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navAllLevelBorderStyle) || this.configObj?.styles?.navAllLevelBorderStyle.trim() === 'undefined') 
        ? 'none' : this.configObj?.styles?.navAllLevelBorderStyle;
        return tmpvalue;
    }

    get navAllLevelBorderColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navAllLevelBorderColor) || this.configObj?.styles?.navAllLevelBorderColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navAllLevelBorderColor;
        return tmpvalue;
    }

    get navAllLevelBorderWidth() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navAllLevelBorderWidth)) 
        ? 1 : this.configObj?.styles?.navAllLevelBorderWidth;
        return tmpvalue;
    }

    get navAllLevelBorderRadius() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navAllLevelBorderRadius)) 
        ? 0 : this.configObj?.styles?.navAllLevelBorderRadius;
        return tmpvalue;
    }

    get navAllLevelShadowBoxType() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navAllLevelShadowBoxType) || this.configObj?.styles?.navAllLevelShadowBoxType.trim() === 'undefined') 
        ? 'none' : this.configObj?.styles?.navAllLevelShadowBoxType;
        return tmpvalue;
    }

    get navAllLevelShadowBoxColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.styles?.navAllLevelShadowBoxColor) || this.configObj?.styles?.navAllLevelShadowBoxColor.trim() === 'undefined') 
        ? '' : this.configObj?.styles?.navAllLevelShadowBoxColor;
        return tmpvalue;
    }

    get navAllLevelShadowBoxXOffset() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navAllLevelShadowBoxXOffset)) 
        ? 1 : this.configObj?.styles?.navAllLevelShadowBoxXOffset;
        return tmpvalue;
    }

    get navAllLevelShadowBoxYOffset() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navAllLevelShadowBoxYOffset)) 
        ? 1 : this.configObj?.styles?.navAllLevelShadowBoxYOffset;
        return tmpvalue;
    }

    get navAllLevelShadowBoxBlur() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navAllLevelShadowBoxBlur)) 
        ? 1 : this.configObj?.styles?.navAllLevelShadowBoxBlur;
        return tmpvalue;
    }

    get navAllLevelShadowBoxSpread() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.styles?.navAllLevelShadowBoxSpread)) 
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

        if(generalUtils.isArrayEmpty(this.items) === false)
        {
            return ' Menu first Item of ' + this.items.length + ' items';
        }
  
        return '';
        
    }

    get menuAlignmentClass() {

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

        const cssClasses = ['slds-button slds-button_icon slds-button_icon-inverse ccnavmenu-hamburger-button slds-p-horizontal_x-small'];

        if (this.hideHamburgerMenuAnimation === false) {
            cssClasses.push('showHamburgerAnimation');
        } 

        return cssClasses.join(' ');

    }

    get closeButtonDivClasses() {

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

        if (result.data) {
            let resData = JSON.parse(result.data)
            if(resData.menu)
            {
                try {

                    if(generalUtils.isArrayEmpty(this.items) === true)
                    {
                        generalUtils.consoleLog(this.debugMode, 'no_cache','clientCacheStatus: ');
                    }

                    this.items = resData?.menu;
                    this.userInfo = resData?.user;
                    
                    if(!generalUtils.isStringEmpty(this.urlSubMapJson))
                    {
                        this.handleUserInfoReplacements();
                        if(generalUtils.isArrayEmpty(this.items) === false)
                        {
                            this.handleUrlReplaceItems(this.items);
                        }
                    }
                    
                    this.putMenuInCache();
                    this.error = undefined;
                    generalUtils.consoleLog(this.debugMode, resData.cacheStatus + '','serverCacheStatus: ');
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
            
            if(generalUtils.isObjectEmpty(this.language) === false && this.language.trim() === 'auto')
            {
                let lang = generalUtils.getURLParameter('language');
                lang = (generalUtils.isStringEmpty(lang)) ? experienceUtils.getActiveLanguage() : lang;
                this.language += (!generalUtils.isStringEmpty(lang)) ? lang : '';
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
        if(generalUtils.isObjectEmpty(this.template.querySelector('c-tree')) === false && typeof this.template.querySelector('c-tree').handleWindowResize === 'function')
        {
            this.template.querySelector('c-tree').handleWindowResize();
        }
    }

    toggleHamburgerMenu(e)
    {

        this.hamburgerMenuVisible = !this.hamburgerMenuVisible;
        
        let hamburgerMenu = this.template.querySelector('[data-id="toggleHamburgerMenu"]');
        if(generalUtils.isObjectEmpty(hamburgerMenu) === false)
        {
            hamburgerMenu.classList.toggle('opened');
            hamburgerMenu.setAttribute('aria-expanded', hamburgerMenu.classList.contains('opened'));
        }
        e.preventDefault();
        e.stopPropagation();
    }

    handleCloseHamburgerMenu(e)
    {

        if(this.shouldCloseHamburgerMenu(e) === true)
        {
            this.closeHamburgerMenu();
        }

    }

    shouldCloseHamburgerMenu(e) {

        if(generalUtils.isObjectEmpty(e.target) === false)
        {
            if(generalUtils.isObjectEmpty(e.detail.forceClose) === false && e.detail.forceClose === true)
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

        this.hamburgerMenuVisible = false;
        let hamburgerMenu = this.template.querySelector('[data-id="toggleHamburgerMenu"]');
        if(generalUtils.isObjectEmpty(hamburgerMenu) === false)
        {
            hamburgerMenu.classList.remove('opened');
            hamburgerMenu.setAttribute('aria-expanded', false);
        }
    }


    setStylingProperties()
    {

        let treeItemCSS = this.template.querySelector('div[role="ccnavMenuCSS"]');

        if(!generalUtils.isObjectEmpty(treeItemCSS))
        {
            if(!generalUtils.isStringEmpty(this.navContainerTextColor))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-navContainer-text-color', this.navContainerTextColor);
            }

            if(!generalUtils.isStringEmpty(this.navContainerTextColorHover))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-navContainer-text-color-hover', this.navContainerTextColorHover);
                if(this.navContainerAlsoApplyToSelectedState === true)
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-text-color-selected', this.navContainerTextColorHover);
                }
            }

            if(!generalUtils.isStringEmpty(this.navContainerBackgroundColor))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-navContainer-background-color', this.navContainerBackgroundColor);
            }

            if(!generalUtils.isStringEmpty(this.navContainerBackgroundColorHover))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-navContainer-background-color-hover', this.navContainerBackgroundColorHover);
                if(this.navContainerAlsoApplyToSelectedState === true)
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-background-color-selected', this.navContainerBackgroundColorHover);
                }
            }

            if(!generalUtils.isStringEmpty(this.navTextColor))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-text-color', this.navTextColor);
            }

            if(!generalUtils.isStringEmpty(this.navTextColorHover))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-text-color-hover', this.navTextColorHover);
                if(this.navAlsoApplyToSelectedState === true)
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-text-color-selected', this.navTextColorHover);
                }
            }
            
            if(!generalUtils.isStringEmpty(this.navBackgroundColor))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-background-color', this.navBackgroundColor);
            }

            if(!generalUtils.isStringEmpty(this.navBackgroundColorHover))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-background-color-hover', this.navBackgroundColorHover);
                if(this.navAlsoApplyToSelectedState === true)
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-background-color-selected', this.navBackgroundColorHover);
                }
            }



            if(!generalUtils.isStringEmpty(this.overrideFontFamily))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-fontFamily', this.overrideFontFamily);
            }

            if(!generalUtils.isObjectEmpty(this.overrideFontSizeMobile) && deviceUtils.getFormFactor() === 'Small')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-fontSize', this.overrideFontSizeMobile + 'px');                          
            }
            else if(!generalUtils.isObjectEmpty(this.overrideFontSize) && deviceUtils.getFormFactor() !== 'Small')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-fontSize', this.overrideFontSize + 'px');
            }
            else if(generalUtils.isObjectEmpty(this.overrideFontSizeMobile) && deviceUtils.getFormFactor() === 'Small')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-fontSize', 'var(--dxp-s-html-font-size-mobile, 16px)');   
            }
            else
            {
                treeItemCSS.style.setProperty('--ccnavmenus-fontSize', 'var(--dxp-s-html-font-size, 16px)');
            }
            

            if(!generalUtils.isObjectEmpty(this.sldsIconSize))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-icon-multiplier', this.sldsIconSize);
            }
            
            if(!generalUtils.isObjectEmpty(this.iconSpacing))
            {
                treeItemCSS.style.setProperty('--ccnavmenus-icon-spacing', this.iconSpacing + 'px');
            }

            if(!generalUtils.isStringEmpty(this.overrideTextCase))
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

            if(!generalUtils.isStringEmpty(this.navAllLevelBorderStyle) && this.navAllLevelBorderStyle !== 'none')
            {
                let borderStyle = '';
                borderStyle += this.navAllLevelBorderWidth + 'px ';
                borderStyle += this.navAllLevelBorderStyle + ' ';
                borderStyle += (generalUtils.isStringEmpty(this.navAllLevelBorderColor)) ? 'var(--dxp-g-brand)' : this.navAllLevelBorderColor;

                treeItemCSS.style.setProperty('--ccnavmenus-nav-allLevel-border', borderStyle);
            }

            if(generalUtils.isObjectEmpty(this.navAllLevelBorderRadius) === false)
            {
                treeItemCSS.style.setProperty('--ccnavmenus-nav-allLevel-border-radius', this.navAllLevelBorderRadius + 'px');
            }

            if(!generalUtils.isStringEmpty(this.navContainerBorderStyle) && this.navContainerBorderStyle !== 'none')
            {
                let borderStyle = '';
                borderStyle += this.navContainerBorderWidth + 'px ';
                borderStyle += this.navContainerBorderStyle + ' ';
                borderStyle += (generalUtils.isStringEmpty(this.navContainerBorderColor)) ? 'var(--dxp-g-brand)' : this.navContainerBorderColor;

                if(!generalUtils.isObjectEmpty(this.navContainerBorderDirection) && this.navContainerBorderDirection.includes('bottom'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-bottom', borderStyle);
                    if(this.navContainerAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-bottom-selected', borderStyle);
                    }
                }

                if(!generalUtils.isObjectEmpty(this.navContainerBorderDirection) && this.navContainerBorderDirection.includes('top'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-top', borderStyle);
                    if(this.navContainerAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-top-selected', borderStyle);
                    }
                }

                if(!generalUtils.isObjectEmpty(this.navContainerBorderDirection) && this.navContainerBorderDirection.includes('left'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-left', borderStyle);
                    if(this.navContainerAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-left-selected', borderStyle);
                    }
                }

                if(!generalUtils.isObjectEmpty(this.navContainerBorderDirection) && this.navContainerBorderDirection.includes('right'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-right', borderStyle);
                    if(this.navContainerAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-navContainer-border-right-selected', borderStyle);
                    }
                }

            }


            if(!generalUtils.isStringEmpty(this.navBorderStyle) && this.navBorderStyle !== 'none')
            {
                let borderStyle = '';
                borderStyle += this.navBorderWidth + 'px ';
                borderStyle += this.navBorderStyle + ' ';
                borderStyle += (generalUtils.isStringEmpty(this.navBorderColor)) ? 'var(--dxp-g-brand)' : this.navBorderColor;

                if(!generalUtils.isObjectEmpty(this.navBorderDirection) && this.navBorderDirection.includes('bottom'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-border-bottom', borderStyle);
                    if(this.navAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-nav-border-bottom-selected', borderStyle);
                    }
                }

                if(!generalUtils.isObjectEmpty(this.navBorderDirection) && this.navBorderDirection.includes('top'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-border-top', borderStyle);
                    if(this.navAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-nav-border-top-selected', borderStyle);
                    }
                }

                if(!generalUtils.isObjectEmpty(this.navBorderDirection) && this.navBorderDirection.includes('left'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-border-left', borderStyle);
                    if(this.navAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-nav-border-left-selected', borderStyle);
                    }
                }

                if(!generalUtils.isObjectEmpty(this.navBorderDirection) && this.navBorderDirection.includes('right'))
                {
                    treeItemCSS.style.setProperty('--ccnavmenus-nav-border-right', borderStyle);
                    if(this.navAlsoApplyToSelectedState === true)
                    {
                        treeItemCSS.style.setProperty('--ccnavmenus-nav-border-right-selected', borderStyle);
                    }
                }

            }


            if(!generalUtils.isStringEmpty(this.navAllLevelShadowBoxType) && this.navAllLevelShadowBoxType !== 'none')
            {

                let shadowBoxStyle = '';
                shadowBoxStyle += (this.navAllLevelShadowBoxType === 'inset') ? 'inset ' : '';
                shadowBoxStyle += this.navAllLevelShadowBoxXOffset + 'px ' + this.navAllLevelShadowBoxYOffset + 'px ' + this.navAllLevelShadowBoxBlur + 'px ' + this.navAllLevelShadowBoxSpread + 'px ';
                shadowBoxStyle += (!generalUtils.isStringEmpty(this.navAllLevelShadowBoxColor)) ? this.navAllLevelShadowBoxColor : 'var(--dxp-g-brand)';

                treeItemCSS.style.setProperty('--ccnavmenus-nav-allLevel-shadowBox', shadowBoxStyle);

            }


        }
    }

    handleUrlReplaceItems(items) {

        if(generalUtils.isArrayEmpty(items) === false)
        {
            for (var item of items) {

                this.handleUrlReplace(item);
                if(generalUtils.isArrayEmpty(item.items) === false)
                {
                    this.handleUrlReplaceItems(item.items);
                }
             
            }
        }

    }

    handleUrlReplace(item)
    {
        
        try {
            
            if(!generalUtils.isStringEmpty(this.urlSubMapJsonModified))
            {
                let urlSubMap = JSON.parse(this.urlSubMapJsonModified);

                if(generalUtils.isArrayEmpty(urlSubMap) === false)
                {
                    for(let i=0;i<urlSubMap.length;i++)
                    {
                        if(generalUtils.isStringEmpty(urlSubMap[i].replaceThis) === true
                            || generalUtils.isObjectEmpty(urlSubMap[i].replaceWith) === true)
                        {
                            continue;
                        }

                        let searchMask = generalUtils.escapeRegex(urlSubMap[i].replaceThis);
                        
                        let regEx = new RegExp(searchMask, "ig");
                        
                        let replaceMask = urlSubMap[i].replaceWith;
                        

                        
                        item.href = (generalUtils.isObjectEmpty(item.href) === false) ? item.href.replace(regEx, replaceMask) : item.href;
                        item.label = (generalUtils.isObjectEmpty(item.label) === false) ? item.label.replace(regEx, replaceMask) : item.label;
                            
                        
                    }
                }
            }

            

        } catch(e) {}
    }

    handleUserInfoReplacements()
    {

        this.urlSubMapJsonModified = generalUtils.cloneObjectWithJSON(this.urlSubMapJson);

        if(generalUtils.isObjectEmpty(this.userInfo.Id) === false)
        {

            let searchMask = generalUtils.escapeRegex('[@User.Id]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.Id;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        } 
        
        if(generalUtils.isObjectEmpty(this.userInfo.AccountId) === false)
        {

            let searchMask = generalUtils.escapeRegex('[@User.AccountId]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.AccountId;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }
        
        if(generalUtils.isObjectEmpty(this.userInfo?.Account?.Name) === false)
        {

            let searchMask = generalUtils.escapeRegex('[@User.AccountName]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo?.Account?.Name;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(generalUtils.isObjectEmpty(this.userInfo.ContactId) === false)
        {

            let searchMask = generalUtils.escapeRegex('[@User.ContactId]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.ContactId;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(generalUtils.isObjectEmpty(this.userInfo.FirstName) === false)
        {

            let searchMask = generalUtils.escapeRegex('[@User.FirstName]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.FirstName;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(!generalUtils.isObjectEmpty(this.userInfo.FirstName))
        {

            let searchMask = generalUtils.escapeRegex('[@User.FirstInitial]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.FirstName.substr(0,1);
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(generalUtils.isObjectEmpty(this.userInfo.LastName) === false)
        {

            let searchMask = generalUtils.escapeRegex('[@User.LastName]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.LastName;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }

        if(!generalUtils.isObjectEmpty(this.userInfo.LastName))
        {

            let searchMask = generalUtils.escapeRegex('[@User.LastInitial]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.LastName.substr(0,1);
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }
        
        if(generalUtils.isObjectEmpty(this.userInfo.CommunityNickname) === false)
        {

            let searchMask = generalUtils.escapeRegex('[@User.CommunityNickname]');
            let regEx = new RegExp(searchMask, "ig");
            let replaceMask = this.userInfo.CommunityNickname;
            this.urlSubMapJsonModified = this.urlSubMapJsonModified.replace(regEx,replaceMask);
        }
      
    }

    getMenuFromCache()
    {

        if (this.cacheEnabled === true && 'caches' in window) 
        {
            generalUtils.consoleLog(this.debugMode, 'attempting to retrieve menu from cache');
            this.items = cacheUtils.getFromCache(this.cacheName, this.cacheKeyCalculated, this.debugMode);
        }

    }

    putMenuInCache()
    {

        if (this.cacheEnabled === true && 'caches' in window) 
        {
            cacheUtils.putInCache(this.cacheName, this.cacheKeyCalculated, this.items, this.debugMode)
        }

    }
    
    @wire(CurrentPageReference) handlePageReference(pageReference) {
        // do something with pageReference.state
        this.pageRef = pageReference;
        let tmpItemsString = JSON.stringify(this.items);
        this.items = undefined;
        this.items = JSON.parse(tmpItemsString);
    }

}