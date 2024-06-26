/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { api, LightningElement, track } from 'lwc';
import { flattenItems } from './flatten';
import * as generalUtils from 'c/gtaUtilsGeneral';
import * as componentUtils from 'c/gtaUtilsComponent';

const NAVIGATE_EVENT = 'navigatetopage';
const closeLabel = 'Close';
const allLabel = 'All';
const backLabel = 'Back';

/**
 * Communities Drilldown Navigation Menu
 * Supports horizontal and vertical nav types.
 */
export default class DrilldownNavigationList extends LightningElement {
    // Not working atm because contains is not available on template/this
    //static renderMode = 'light';

    @track _menuItems = [];
    _parentItem = {};
    _focusOnFirstItem = false;
    _focusOnLastItem = false;
    _isMobileView = false;
    _isBackButtonClicked = false;
    _showAnimation = false;
    _outsideClickListener;
    _drilledDown = 0;
    _focusedListItemIndex;
    @track _flatItems = {};
    @track _listStack = [];

    @api showBackLabel = false;
    @api backButtonLabel = 'Back';
    @api isLastItem = false;
    @api allLabel = 'Go to';
    @api isVertical = false;
    @api isInHamburgerMenu = false;

    /**
     * MenuItems that should be visualized
     * @returns {MenuItem[]}
     */
    @api get menuItems() {
        return this._menuItems;
    }

    set menuItems(value) {
        let tmpValue = JSON.parse(JSON.stringify(value));
        for(let i=0; i < tmpValue.length; i++)
        {
            tmpValue[i].hasChildren = (generalUtils.isObjectEmpty(tmpValue[i].items) === false && tmpValue[i].items.length > 0);
        }
        this._flatItems = flattenItems(tmpValue);
        this._menuItems = tmpValue;
    }

    /**
     * set parent item if list visualized the submenu of a horizontal menu
     * @returns {*[]}
     */
    @api get parentItem() {
        return this._parentItem;
    }

    set parentItem(value) {
        let tmpValue = generalUtils.cloneObjectWithJSON(value);

        tmpValue.hasChildren = (generalUtils.isObjectEmpty(tmpValue.items) === false && tmpValue.items.length > 0);
        tmpValue.iconPositionLeft = (generalUtils.isStringEmpty(tmpValue.iconPosition) === false && tmpValue.iconPosition.trim() === 'left');
        tmpValue.iconPositionRight = (generalUtils.isStringEmpty(tmpValue.iconPosition) === false && tmpValue.iconPosition.trim() === 'right');

        this._parentItem = tmpValue;
        this._listStack.push(tmpValue);
        this._flatItems[tmpValue.id] = tmpValue;
    }

    get parentIsSelected() {
        let url = document.URL;
        return (!generalUtils.isStringEmpty(this._parentItem.href) && url.includes(this._parentItem.href)) ? true : false ;
    }

    /**
     * value that should be set to true if the focus should be set on the first menu item
     * @returns {boolean}
     */
    @api get focusOnFirstItem() {
        return this._focusOnFirstItem;
    }

    set focusOnFirstItem(value) {
        this._focusOnFirstItem = value;
    }

    /**
     * value that should be set to true if the focus should be set on the last menu item
     * @returns {boolean}
     */
    @api get focusOnLastItem() {
        return this._focusOnLastItem;
    }

    set focusOnLastItem(value) {
        this._focusOnLastItem = value;
    }

    /**
     * value that should be set to true when list visualizes a separate menu (mobile)
     * @returns {boolean}
     */
    @api get isMobileView() {
        return this._isMobileView;
    }

    set isMobileView(value) {
        this._isMobileView = value;
    }

    /**
     * Override the styles when a theme is present
     * @type Object
     */
    @api customThemeStyles;


    /**
     * Show "Back" or the parent item label
     */
    get backButtonLabelComputed() {
        return this.showBackLabel ? this.backButtonLabel : this._parentItem.label;
    }

    /* Get the labels */
    get labels() {
        return {
            closeLabel,
            allLabel,
            backLabel
        };
    }

    
    get visibleItems() {
        let url = document.URL;
        let items;
        if (
            !this.parentItem ||
            (typeof this.parentItem === 'object' &&
                Object.keys(this.parentItem).length === 0)
        ) {
            items = JSON.parse(JSON.stringify(this.menuItems));
        }
        else
        {
            items = this._listStack.length && this._listStack[this._listStack.length - 1]?.items;
        }
        
        if(generalUtils.isArrayEmpty(items) === false)
        {
            for(let i=0; i < items.length; i++)
            {
                items[i].hasChildren = (generalUtils.isArrayEmpty(items[i].items) === false);
                items[i].iconPositionLeft = (generalUtils.isStringEmpty(items[i].iconPosition) === false && items[i].iconPosition.trim() === 'left');
                items[i].iconPositionRight = (generalUtils.isStringEmpty(items[i].iconPosition) === false && items[i].iconPosition.trim() === 'right');
                items[i].isSelected = (!generalUtils.isStringEmpty(items[i].href) && url.includes(items[i].href)) ? true : false ;
            }  
        }
        
        return items;
    }

    get hasVisibleItems() {
        return this.visibleItems && this.visibleItems.length > 0;
    }

    get hasProperParentItem() {
        return this._parentItem?.href?.length && this._parentItem?.href?.trim() !== 'javascript:void(0);';
    }

    get closeButtonDivClasses() {
        const cssClasses = ['closeButtonDiv'];
        if (this.menuAlignment === 'Right') {
            cssClasses.push('closeButtonDivRight');
        }

        return cssClasses.join(' ');
    }

    get navMenuClassList() {
        let classList = [
            'comm-drilldown-navigation__list', 
            'comm-drilldown-navigation__slideDown',
            'slds-list_vertical',
            'slds-has-flexi-truncate'
        ];
        
        if(this.isMobileView)
        {
            classList.push('menuMobileView');
        }

        if(this.isLastItem)
        {
            classList.push('comm-drilldown-navigation__list-last');
        }

        if(this.isVertical)
        {
            classList.push('comm-drilldown-navigation__list-vertical');
        }

        if(!this.isInHamburgerMenu) {
            classList.push('slds-m-top_xx-small');
        }

        return classList.join(' ');

    }

    renderedCallback() {
        let listItems = this.template.querySelectorAll('[role=menuitem]');

        if (listItems.length) {
            if (this._showAnimation) {
                // for each menu item, add the slide class so the menu items slide in
                listItems.forEach((item) => {
                    // eslint-disable-next-line no-unused-expressions
                    this._isBackButtonClicked
                        ? item.classList.add(
                              'comm-drilldown-navigation__slideLeftToRight'
                          )
                        : item.classList.add(
                              'comm-drilldown-navigation__slideRightToLeft'
                          );
                });
            }

            if (!this._focusOnLastItem) {
                listItems[0].tabIndex = 0;
                if (this._focusOnFirstItem) {
                    listItems[0].focus();
                }
                for (let i = 1; i < listItems.length; i++) {
                    listItems[i].tabIndex = -1;
                }
                this._focusedListItemIndex = 0;
            } else {
                // focus on the last item if the component was rendered by an Arrow Up key press
                for (let i = 0; i < listItems.length - 1; i++) {
                    listItems[i].tabIndex = -1;
                }
                listItems[listItems.length - 1].tabIndex = 0;
                listItems[listItems.length - 1].focus();
                this._focusedListItemIndex = listItems.length - 1;
            }
        }
    }

    /**
     * Fires the 'navigatetopage' event with itemId as parameter
     */
    fireNavigationEvent(event) {
        let itemId = event?.currentTarget?.dataset?.id;
        let item = this._flatItems[itemId];
        this.dispatchEvent(
            new CustomEvent(NAVIGATE_EVENT, {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: {
                    menuItemId: itemId,
                    type: item?.type,
                    href: item?.href
                }
            })
        );
    }

    /*
     * Fires the 'navigatetopage' event for the All item when using keyboard navigation
     */
    fireNavigationEventForAll(event) {
        let itemId = event?.currentTarget?.dataset?.id;
        let href = event?.currentTarget?.getAttribute('href');
        let type = 'InternalLink';
        this.dispatchEvent(
            new CustomEvent(NAVIGATE_EVENT, {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: {
                    menuItemId: itemId,
                    type: type,
                    href: href
                }
            })
        );
    }

    handleFocusOut(event) {
        let root = this.template.querySelector('ul');
        // event.relatedTarget is null during drill-in and drill-out. We do not want to close the list during these operations.
        if (event.relatedTarget && !root.contains(event.relatedTarget)) {
            this.fireCloseNavigationListEvent();
        }
    }

    // handle the click event on close button in mobile view
    handleCloseClick() {
        this.fireCloseNavigationListEvent();
    }

    handleHamburgerCloseClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('ccnavmenus__closehamburgermenu', {bubbles: true, composed: true}));
    }

    handleParentClick(event) {
        const newItem = this._flatItems[event?.currentTarget?.dataset?.id];
        let newItemTmp = generalUtils.cloneObjectWithJSON(newItem);
        newItemTmp.iconPositionLeft = (generalUtils.isStringEmpty(newItemTmp.iconPosition) === false && newItemTmp.iconPosition.trim() === 'left');
        newItemTmp.iconPositionRight = (generalUtils.isStringEmpty(newItemTmp.iconPosition) === false && newItemTmp.iconPosition.trim() === 'right');
        this._isBackButtonClicked = false;
        this._showAnimation = true;
        this._parentItem = newItemTmp;
        this._listStack.push(newItemTmp);
        this._drilledDown += 1;

        event.preventDefault();
        event.stopPropagation();
    }

    handleAnimationEnd(event) {
        // eslint-disable-next-line no-unused-expressions
        this._isBackButtonClicked
            ? event.target.classList.remove(
                  'comm-drilldown-navigation__slideLeftToRight'
              )
            : event.target.classList.remove(
                  'comm-drilldown-navigation__slideRightToLeft'
              );
    }

    handleBack(e) {
        this._isBackButtonClicked = true;
        this._listStack.pop();
        this._parentItem = this._listStack[this._listStack.length - 1];
        this._drilledDown -= 1;
        e.preventDefault();
        e.stopPropagation();
    }

    handleAllClick(event) {
        if(!this.isInHamburgerMenu)
        {
            //this.fireNavigationEvent(event);
            this.fireCloseNavigationListEvent();
        }
        else 
        {
            if(this.shouldCloseHamburgerMenu(event))
            {
                this.dispatchEvent(new CustomEvent('ccnavmenus__closehamburgermenu', {bubbles: true, composed: true}));
            }

        }

        event.stopImmediatePropagation();

    }

    handleLeafClick(event) {
        if(!this.isInHamburgerMenu)
        {
            //this.fireNavigationEvent(event);
            this.fireCloseNavigationListEvent();
        }   
        else 
        {
            if(this.shouldCloseHamburgerMenu(event))
            {
                this.dispatchEvent(new CustomEvent('ccnavmenus__closehamburgermenu', {bubbles: true, composed: true}));
            }
        }   

        event.stopImmediatePropagation();
    }

    shouldCloseHamburgerMenu(event) {

        if(generalUtils.isObjectEmpty(event.target) === false && event.target.tagName === 'A' && generalUtils.isObjectEmpty(event.target.dataset.id) === false
            && generalUtils.isObjectEmpty(event.target.href) === false && event.target.href.trim() !== 'javascript:void(0);'
            && event.target.href.trim() !== 'javascript:void(0)')
        {
            return true;
        }

        if(generalUtils.isObjectEmpty(event.target) === false && event.target.tagName === 'C-PRIMITIVE-ICON' 
            && generalUtils.isObjectEmpty(event.target.dataset.islink) === false && event.target.dataset.islink === 'true')
        {
            return true;
        }

        return false;

    }

    // if there is custom theme styling for the background color on hover use that instead of the ootb css
    handleHoverOrFocus(event) {
        let item = event.currentTarget;
        if (
            this.customThemeStyles &&
            this.customThemeStyles['background-hover']
        ) {
            // add the !important tag to the custom background color to override the !important component hover css
            item.style['background-color'] =
                this.customThemeStyles['background-hover'];
        }
    }


    handleHoverOrFocusOut(event) {
        let item = event.currentTarget;
        if (
            this.customThemeStyles &&
            this.customThemeStyles['background-color']
        ) {
            item.style['background-color'] =
                this.customThemeStyles['background-color'];
        }
    }

    resetListStackToFirstLevel() {
        while (this._listStack.length > 1) {
            this._listStack.pop();
        }
        this._drilledDown = 0;
        this._parentItem = this._listStack[0];
    }

    get showBackButton() {
        return this._drilledDown > 0;
    }

    get navMenuLabel() {
        return this.parentItem ? this.parentItem.label : '';
    }

    /**
     *
     * keyboard interactions
     *
     *  */

    // key down events that have common behavior across all type of list items
    handleCommonKeyDown(event) {
        let preventDefault = false;
        switch (event.key) {
            case 'ArrowDown':
                this.setFocusToMenuItem('Next');
                preventDefault = true;
                break;
            case 'ArrowUp':
                this.setFocusToMenuItem('Previous');
                preventDefault = true;
                break;
            case 'Home':
            case 'PageUp':
                this.setFocusToMenuItem('First');
                preventDefault = true;
                break;
            case 'End':
            case 'PageDown':
                this.setFocusToMenuItem('Last');
                preventDefault = true;
                break;
            case 'Esc':
            case 'Escape':
                if (this.showBackButton) {
                    this.handleBack();
                } else {
                    this.fireCloseNavigationListEvent();
                }
                preventDefault = true;
                break;
            case 'Tab':
                this.fireCloseNavigationListEvent();
                break;
            default:
                break;
        }

        if (preventDefault) {
            event.preventDefault();
        }
    }

    handleLeafKeyDown(event) {
        let preventDefault = false;
        switch (event.key) {
            case 'Enter':
            case ' ': // Spacebar
                this.handleLeafClick(event);
                preventDefault = true;
                break;
            case 'ArrowRight':
                this.resetListStackToFirstLevel();
                this.fireLeftRightArrowNavigationListEvent(event);
                preventDefault = true;
                break;
            case 'ArrowLeft':
                if (this.showBackButton) {
                    this.handleBack();
                } else {
                    this.fireLeftRightArrowNavigationListEvent(event);
                }
                preventDefault = true;
                break;
            default:
                this.handleCommonKeyDown(event);
                break;
        }

        if (preventDefault) {
            event.preventDefault();
        }
    }

    handleParentKeyDown(event) {
        let preventDefault = false;
        switch (event.key) {
            case 'Enter':
            case ' ': // Spacebar
            case 'ArrowRight':
                this._focusedListItemIndex = 0;
                this._focusOnFirstItem = true;
                this.handleParentClick(event);
                preventDefault = true;
                break;
            case 'ArrowLeft':
                if (this.showBackButton) {
                    this.handleBack();
                } else {
                    this.fireLeftRightArrowNavigationListEvent(event);
                }
                preventDefault = true;
                break;
            default:
                this.handleCommonKeyDown(event);
                break;
        }

        if (preventDefault) {
            event.preventDefault();
        }
    }

    handleBackKeyDown(event) {
        let preventDefault = false;
        switch (event.key) {
            case 'Enter':
            case ' ': // Spacebar
            case 'ArrowLeft':
                this.handleBack();
                preventDefault = true;
                break;
            case 'ArrowRight':
                this.resetListStackToFirstLevel();
                this.fireLeftRightArrowNavigationListEvent(event);
                preventDefault = true;
                break;
            default:
                this.handleCommonKeyDown(event);
                break;
        }

        if (preventDefault) {
            event.preventDefault();
        }
    }

    handleAllKeyDown(event) {
        let preventDefault = false;
        switch (event.key) {
            case 'Enter':
                break;
            case ' ': // Spacebar
                    event.stopPropagation();
                    event.preventDefault();
                   
                    componentUtils.doLinkNavigate(event.target.href, event.target.target);
                    
                    
                break;
            case 'ArrowRight':
                this.resetListStackToFirstLevel();
                this.fireLeftRightArrowNavigationListEvent(event);
                preventDefault = true;
                break;
            case 'ArrowLeft':
                if (this.showBackButton) {
                    this.handleBack();
                } else {
                    this.fireLeftRightArrowNavigationListEvent(event);
                }
                preventDefault = true;
                break;
            default:
                this.handleCommonKeyDown(event);
                break;
        }

        if (preventDefault) {
            event.preventDefault();
        }
    }

    setFocusToMenuItem(triggerType) {
        let listItems = this.template.querySelectorAll('[role=menuitem]');
        listItems[this._focusedListItemIndex].tabIndex = -1;
        switch (triggerType) {
            case 'Next':
            default:
                this._focusedListItemIndex =
                    this._focusedListItemIndex + 1 >= listItems.length
                        ? 0
                        : this._focusedListItemIndex + 1;
                break;
            case 'Previous':
                this._focusedListItemIndex =
                    this._focusedListItemIndex - 1 < 0
                        ? listItems.length - 1
                        : this._focusedListItemIndex - 1;
                break;
            case 'First':
                this._focusedListItemIndex = 0;
                break;
            case 'Last':
                this._focusedListItemIndex = listItems.length - 1;
                break;
        }
        let newMenuItem = listItems[this._focusedListItemIndex];
        newMenuItem.tabIndex = 0;
        newMenuItem.focus();
    }

    fireCloseNavigationListEvent() {
        // eslint-disable-next-line no-unused-expressions
        if (this._isMobileView) {
            this.dispatchEvent(new CustomEvent('closesubmenus'));
        } else {
            this.dispatchEvent(
                new CustomEvent('closesubmenus', {
                    detail: {
                        parentItemId: this.parentItem.id
                    }
                })
            );
        }
        this.resetListStackToFirstLevel();
    }

    fireLeftRightArrowNavigationListEvent(event) {
        this.dispatchEvent(
            new CustomEvent('leftrightarrowkeysubmenu', {
                detail: {
                    parentItemId: this.parentItem.id,
                    key: event.key
                }
            })
        );
    }

}