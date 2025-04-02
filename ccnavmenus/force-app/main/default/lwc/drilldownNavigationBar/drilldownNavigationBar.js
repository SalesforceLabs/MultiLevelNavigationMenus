/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { api, LightningElement, track } from 'lwc';
import { addOverflowMenu } from './overflow';
import * as generalUtils from 'c/gtaUtilsGeneral';

const NAVIGATE_EVENT = 'navigatetopage';
const SHOW_APP_LAUNCHER = 'showapplauncher';
const DEFAULT_ALIGNMENT = 'left';
const labelAppLauncherTitle = 'App Launcher';
const componentNameLabel = 'Nav Menu';

/**
 * Communities global navigation.
 * Supports horizontal and vertical nav types.
 * Exposed through forceCommunity:globalNavigation.
 */
export default class DrilldownNavigationBar extends LightningElement {
    // Not working atm because contains is not available on template/this
    //static renderMode = 'light';

    @api backButtonLabel = 'Back';
    @api overflowLabel = 'More';
    @api inHamburgerMenu = false;
    @api allLabel = 'Go to';
    @api menuAlignmentClass;
    @api additionalOverflowWidth = 0;
    @api expandOnHover = false;


    //styling inputs
    @api brandNavigationColorText;
    @api brandNavigationBarBackgroundColor;
    @api brandNavigationBackgroundColor;
    @api fontFamily;
    @api textTransform;
    @api topLevelItemSpacing = 20;

    itemWidth = [];
    overflowItems = [];
    setFocusOnFirstSubMenuItem;
    setFocusOnLastSubMenuItem;
    menuItemsChanged = false;
    overflowCalculated = false;

    /*
    We need to store the inner Width to prevent Safari on iOS from triggering overflow calculations when resize is
    triggered by scrolling on iPad.
    * */
    knownWindowWidth = 0;

    moreMenuItem = {
        id: 'more-item',
        label: 'More',
        items: [],
        active: false,
        href: null,
        type: 'MoreMenu'
    };

    appLauncherMenuItem = {
        id: 'app-launcher-item',
        appLauncher: true
    };

    _resetTabIndex = true;
    _showAppLauncher = false;
    _focusedItemId;
    _menuItems = [];
    _menuAlignment = DEFAULT_ALIGNMENT;

    // The copy of menuItems is needed to mutate the read-only @api items to show and hide submenus.
    @track visibleMenuItems = [];

    /**
     * @type {MenuItems[]}
     */
    @api get menuItems() {
        return this._menuItems;
    }

    set menuItems(value) {
        this.resetMenuItems(value);
    }

    get componentNameLabel() {
        return componentNameLabel;
    }

    resetMenuItems(menuItems) {
        if (Array.isArray(menuItems)) {
            // We create a copy of the handed over value to add and change properties
            // on the MenuItems in the component
            this._menuItems = [];
            this.visibleMenuItems = [];

            if (this._showAppLauncher) {
                this._menuItems.push(this.appLauncherMenuItem);
                this.visibleMenuItems.push(this.appLauncherMenuItem);
            }

            menuItems = this.customEvalMenuItems(menuItems);

            for (const item of menuItems) {
                this._menuItems.push(item);
                this.visibleMenuItems.push(item);
            }
        } else {
            this._menuItems = [];
            this.visibleMenuItems = [];
        }

        this.menuItemsChanged = true;
    }


    /**
     * @type {string}
     * String values accepted are 'left' 'center' 'right'
     *
     * Controls horizontal alignment of the navigation menu within the nav element.
     * Accepts only 'left', 'right' or 'center'. Falls back to a predefined default
     * otherwise.
     */
    @api get menuAlignment() {
        return this._menuAlignment;
    }

    set menuAlignment(value) {
        this._menuAlignment = ['left', 'center', 'right'].includes(value)
            ? value
            : DEFAULT_ALIGNMENT;
    }

    /**
     * @type boolean
     */
    @api get showAppLauncher() {
        return this._showAppLauncher;
    }

    set showAppLauncher(value) {
        this._showAppLauncher = value;

        // reset menu items so that the custom setter is called to add or remove the app launcher accordingly
        this.resetMenuItems(this._menuItems);
    }

    get appLauncherLabel() {
        return labelAppLauncherTitle;
    }

    getNavAvailableWidth() {
        const navElement = this.template.querySelector('div[role="menubarnav"]');
        //const navElementWidth = navElement?.getBoundingClientRect()?.width;
        const navElementWidth = generalUtils.getContainerElementWidth(navElement);
        const winWidth = generalUtils.getWindowWidth();
        // if the nav element is on it's own row and its container is not limiting its width to 100% (ex. B2B Aura)
        // then the navElement width will be greater than the window width and we need to use the window width
        return navElementWidth > winWidth
            ? winWidth
            : navElementWidth;
    }

    calculateNavItemWidth() {
        const elements = this.template.querySelectorAll('nav ul > li');
        elements.forEach((el) => {
            this.itemWidth.push(generalUtils.getElementWidth(el) + this.additionalOverflowWidth);
        });
    }

    getNavRequiredWidth() {
        const visibleItemsCount = this.itemWidth.length;
        return this.itemWidth
            .slice(0, visibleItemsCount)
            .reduce((sum, width) => sum + width, 0);
    }

    getOverflowWidth() {
        return generalUtils.getElementWidth(
            this.template.querySelector('nav ul > li:last-of-type')
        );
    }

    calculateOverflow() {
        if(this.overflowItems !== undefined && this.overflowItems !== null 
            && (this.overflowItems.length === 0))
        {
            this.itemWidth = [];
            this.calculateNavItemWidth();
        }
        
        const activeItem = this.visibleMenuItems.find((i) => i.active)?.id;

        this.setItemActive(activeItem, true);

        let navAvailableWidth = this.getNavAvailableWidth();
        const navRequiredWidth = this.getNavRequiredWidth();
        const overflowMenuWidth = this.getOverflowWidth();
        

        // If available width is too small to show all items
        if (navAvailableWidth < navRequiredWidth) {
            //navAvailableWidth -= overflowMenuWidth; // Reserve space for the overflow menu trigger
            navAvailableWidth -= this.itemWidth.reduce((a, b) => a + b) / this.itemWidth.length;

            const [newVisibleItems, newOverflow] = addOverflowMenu(
                this.menuItems,
                this.itemWidth,
                navAvailableWidth
            );

            // This is used later to determine if the menu has overflow or not
            this.overflowItems = newOverflow;

            this._resetTabIndex = true;
            this.visibleMenuItems = this.customEvalMenuItems([
                ...newVisibleItems,
                { ...this.moreMenuItem, items: [...this.overflowItems] }
            ]);
        }
        else 
        {
            this.visibleMenuItems = generalUtils.cloneObjectWithJSON(this.menuItems);
        }

        if(navAvailableWidth > 0 && navRequiredWidth > 0 && generalUtils.isArrayEmpty(this.visibleMenuItems) === false)
        {
            this.overflowCalculated = true;
        }

    }

    customEvalMenuItems(tmpmenuItems) {
        let url = document.URL;
        let menuItems = JSON.parse(JSON.stringify(tmpmenuItems));
        for(let i=0; i<menuItems.length;i++)
        {
            menuItems[i].isLast = ((menuItems.length - 1) === i);
            menuItems[i].hasChildren = (generalUtils.isArrayEmpty(menuItems[i].items) === false);
            menuItems[i].iconPositionLeft = (generalUtils.isStringEmpty(menuItems[i].iconPosition) === false && menuItems[i].iconPosition.trim() === 'left');
            menuItems[i].iconPositionRight = (generalUtils.isStringEmpty(menuItems[i].iconPosition) === false && menuItems[i].iconPosition.trim() === 'right');
            menuItems[i].isSelected = (!generalUtils.isStringEmpty(menuItems[i].href) && !menuItems[i].href.trim().includes('void(0)') && menuItems[i].href.trim() !== '#' && url.includes(menuItems[i].href));
        }
        return menuItems;            
    }

    resetTabIndex() {
        let listItems = this.template.querySelectorAll('[role=menuitem]');
        if (listItems.length) {
            listItems[0].tabIndex = 0;
            for (let i = 1; i < listItems.length; i++) {
                listItems[i].tabIndex = -1;
            }
        }
    }

    renderedCallback() {
        if (this._resetTabIndex) {
            this.resetTabIndex();
        }
        this._resetTabIndex = true;

        this.knownWindowWidth = generalUtils.getWindowWidth();

        if (this.menuItemsChanged) {
            this.menuItemsChanged = false;
            this.calculateNavItemWidth();
            setTimeout(this.calculateOverflow.bind(this), 300);
        }

    }

    _resizeListener = generalUtils.debounce(() => {
        const currentWidth = window.innerWidth;

        const widthHasChanged = this.knownWindowWidth !== currentWidth;

        if (widthHasChanged) {
            this.knownWindowWidth = currentWidth;
            this.calculateOverflow();
        }
    }, 300);

    // Must be an arrow function expression because otherwise `this.template` will be undefined at the time the callback is executed
    _outsideClickListener = (event) => {
        if (!this.template.contains(event.target)) {
            // removing focus from the items and set items to inactive
            this.setFocusOnFirstSubMenuItem = false;
            this.setFocusOnLastSubMenuItem = false;
            this._resetTabIndex = true;
            this.resetTabIndex();
            this.setActiveItemToInactive();

            if(this.inHamburgerMenu === true)
            {
                this.dispatchEvent(new CustomEvent('ccnavmenus__closehamburgermenu', {bubbles: true, composed: true}));
            }

        }        

    };

    connectedCallback() {
        /* Fires for clicks anywhere in the document to allow closing the menu for outside clicks.
         * However, since a click inside the menu would also trigger this event,
         * `DrilldownNavigationBar.handleNavClick()` catches click events from inside the menu and
         * prevents them from being caught here.
         * */
        document.addEventListener('click', this._outsideClickListener);
        window.addEventListener('resize', this._resizeListener);

        this.moreMenuItem.label = this.overflowLabel;

    }

    disconnectedCallback() {
        document.removeEventListener('click', this._outsideClickListener);
        window.removeEventListener('resize', this._resizeListener);
    }

    /**
     * Getter to calculate the correct slds class for the menu list given the alignment value
     */
    get menuAlignmentClassCalculated() {
        const cssClasses = [
            'comm-drilldown-navigation__bar',
            'slds-grid',
            'slds-has-flexi-truncate'
        ];

        if(this.overflowCalculated === false)
        {
            cssClasses.push('slds-hidden');
        }

        // Default is 'left' and only 'center' and 'right' need to be set explicitly
        if (this.menuAlignment === 'center') {
            cssClasses.push('slds-grid_align-center');
        } else if (this.menuAlignment === 'right') {
            cssClasses.push('slds-grid_align-end');
        }

        if(!this.inHamburgerMenu) {
            cssClasses.push('display-block');
        }

        return cssClasses.join(' ');
    }

    /**
     * Fires the 'navigatetopage' event with itemId as parameter
     */
    fireNavigationEvent(event) {
        let itemId = event?.currentTarget?.dataset?.id;
        let item = this.findItem(itemId);
        this.dispatchEvent(
            new CustomEvent(NAVIGATE_EVENT, {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: {
                    menuItemId: itemId,
                    type: item.type,
                    href: item.href
                }
            })
        );
    }

    setItemActive(id, active) {
        const itemIndex = this.findItemIndex(id);

        if (active) {
            this.setActiveItemToInactive();
        }

        if (itemIndex !== -1) {
            const mutatedItem = {
                ...this.visibleMenuItems[itemIndex],
                active
            };
            this.visibleMenuItems = [
                ...this.visibleMenuItems.slice(0, itemIndex),
                mutatedItem,
                ...this.visibleMenuItems.slice(itemIndex + 1)
            ];
        }
        this._resetTabIndex = false;
    }

    /**
     * find item in visibleMenuItems for given id
     * @param id {string}
     * @returns {menuItem}
     */
    findItem(id) {
        return this.visibleMenuItems.find((el) => el.id === id);
    }

    /**
     * find item in visibleMenuItems for given id and return index
     * @param id
     * @returns {number}
     */
    findItemIndex(id) {
        return this.visibleMenuItems.findIndex((el) => el.id === id);
    }

    /**
     * search for the item that is currently active and set it to inactive
     */
    setActiveItemToInactive() {
        const activeItem = this.visibleMenuItems.find((el) => !!el.active);

        if (activeItem) {
            this.setItemActive(activeItem.id, false);
        }
    }

    handleParentMouseOver(event) {
            if(this.expandOnHover === true)
            {
                let doClick = true;
                if(event?.target?.role === 'menuitem' && generalUtils.isStringEmpty(event?.target?.dataset?.id) === false)
                {
                    const activeItem = this.visibleMenuItems.find((i) => i.active)?.id;
                    if(generalUtils.isStringEmpty(activeItem) === false && activeItem === event?.target?.dataset?.id)
                    {
                        doClick = false;
                    }
    
                    if(doClick === true)
                    {
                        this.handleParentClick(event);
                    }
                }                      
            }
        }
    
        handleNavMouseout(event) {
            event.stopPropagation();
            
            if(this.expandOnHover === true )
            {
                let doClose = false;
    
               
    
                if(event?.target?.role === 'menuitem' && generalUtils.isStringEmpty(event?.target?.dataset?.id) === false)
                {
                    const activeItem = this.visibleMenuItems.find((i) => i.active)?.id;
                    if(generalUtils.isStringEmpty(activeItem) === false && activeItem !== event?.target?.dataset?.id)
                    {
                        doClose = true;
                    }
                }
                else if(event?.target?.role === 'megaPopover' 
                    || event?.target?.tagName === 'C-DRILLDOWN-NAVIGATION-LIST' 
                    || event?.target?.role === 'none'
                    || event?.target?.tagName === 'C-PRIMITIVE-ICON')
                {
                    doClose = false;
                }
                else
                {
                    doClose = true;
                }
                
                
    
                if(doClose === true)
                {
                    this.closeSubMenus();
                }
    
                
            }
        }

    /**
     * When a parent item is clicked, the item that was active before should be set to inactive and
     * the clicked item is set to active instead.
     * A parent is an item that has children/submenus.
     * @param event
     */
    handleParentClick(event) {
        event.preventDefault();
        this.setFocusOnFirstSubMenuItem = false;
        this.setFocusOnLastSubMenuItem = false;
        this.handleParentSelect(event);
    }

    handleParentSelect(event, reset) {
        this._resetTabIndex = false;

        const itemId = event?.currentTarget?.dataset?.id;
        const item = this.findItem(itemId);

        this.setActiveItemToInactive();
        this.setFocusToMenuItem(itemId, reset || !item?.active);
    }

    /**
     * When a leaf item is clicked a navigation event should be dispatched.
     * A leaf item is an item that doesn't have children/submenus.
     * @param event
     */
    handleLeafClick(event) {
        this.closeSubMenus();
        this.fireNavigationEvent(event);
    }

    closeSubMenus() {
        this.setFocusOnFirstSubMenuItem = false;
        this.setFocusOnLastSubMenuItem = false;
        this._resetTabIndex = false;
        this.setActiveItemToInactive();
    }

    /**
     * ignore click when it happened outside the menu or close menu when it was inside
     * @param event
     */
    handleNavClick(event) {
        let preventDefaultAndPropagation = true;
        if(event?.target?.role === 'menuitem')
        {
           let item = this.findItem(event?.target?.dataset?.id);
           if(!item.hasChildren && !item.href.startsWith('javascript:void(0)'))
           {
                preventDefaultAndPropagation = false;
           }
        }

        if(event.target.tagName === 'C-DRILLDOWN-NAVIGATION-LIST')
        {
            preventDefaultAndPropagation = false;
        }
        
        if (preventDefaultAndPropagation) {
            event.stopPropagation();
            event.preventDefault();
        }

        // if the menu bar was clicked instead of a parent item, close any open submenus
        if (event.target.role === 'menubar') {
            this.closeSubMenus();
        }
    }

    /**
     *
     * Keyboard interactions
     *
     *  */

    handleKeyDown(event) {
        let preventDefault = false;
        const item = this.visibleMenuItems.find(
            (i) => i.id === event.currentTarget.dataset.id
        );

        switch (event.key) {
            case 'ArrowRight':
                // navigate to the next menu item on the menu bar; if the menu item had an active submenu then activate the next menu item's submenu if it has one
                this.setFocusToMenuItem(
                    this.getNextMenuItemId(),
                    !item.appLauncher && item.active
                );
                preventDefault = true;
                break;
            case 'ArrowLeft':
                this.setFocusToMenuItem(
                    this.getPreviousMenuItemId(),
                    item.active
                );
                preventDefault = true;
                break;
            case 'Enter':
            case ' ': // Spacebar
                if (item.items) {
                    this.setFocusOnFirstSubMenuItem = true;
                    this.setFocusOnLastSubMenuItem = false;
                    this.handleParentSelect(event);
                } else {
                    this.handleLeafClick(event);
                }
                preventDefault = true;
                break;
            case 'ArrowDown':
                if (item.items) {
                    this.setFocusOnFirstSubMenuItem = true;
                    this.setFocusOnLastSubMenuItem = false;
                    this.handleParentSelect(event, true);
                }
                preventDefault = true;
                break;
            case 'ArrowUp':
                if (item.items) {
                    this.setFocusOnFirstSubMenuItem = false;
                    this.setFocusOnLastSubMenuItem = true;
                    this.handleParentSelect(event, true);
                }
                preventDefault = true;
                break;
            case 'Home':
            case 'PageUp':
                this.setFocusToMenuItem(this.getFirstMenuItemId(), false);
                preventDefault = true;
                break;
            case 'End':
            case 'PageDown':
                this.setFocusToMenuItem(this.getLastMenuItemId(), false);
                preventDefault = true;
                break;
            case 'Esc':
            case 'Escape':
                this.closeSubMenus();
                preventDefault = true;
                break;
            default:
                break;
        }

        if (preventDefault) {
            event.preventDefault();
        }
    }

    setFocusToMenuItem(menuItemId, targetSubMenuActive) {
        if(menuItemId)
        {
            let listItems = this.template.querySelectorAll('[role=menuitem]');
            let itemToFocus = listItems[this.findItemIndex(menuItemId)];

            if (this._focusedItemId) {
                let oldFocusItem =
                    listItems[this.findItemIndex(this._focusedItemId)];
                if(generalUtils.isObjectEmpty(oldFocusItem) === false)
                {
                    oldFocusItem.tabIndex = -1;
                }
                
            }

            if(generalUtils.isObjectEmpty(itemToFocus) === false)
            {
                itemToFocus.tabIndex = 0;
                itemToFocus.focus();
            }
            
            if (targetSubMenuActive) {
                this.setItemActive(menuItemId, true);
            }
            this._focusedItemId = menuItemId;
        }
    }

    getNextMenuItemId() {
        let currentFocusedItemIndex = this.findItemIndex(this._focusedItemId);
        let newFocusedItemIndex =
            currentFocusedItemIndex + 1 >= this.visibleMenuItems.length
                ? 0
                : currentFocusedItemIndex + 1;
        return this.visibleMenuItems[newFocusedItemIndex].id;
    }

    getPreviousMenuItemId() {
        let currentFocusedItemIndex = this.findItemIndex(this._focusedItemId);
        let newFocusedItemIndex =
            currentFocusedItemIndex - 1 < 0
                ? this.visibleMenuItems.length - 1
                : currentFocusedItemIndex - 1;
        return this.visibleMenuItems[newFocusedItemIndex].id;
    }

    getFirstMenuItemId() {
        return this.visibleMenuItems[0].id;
    }

    getLastMenuItemId() {
        return this.visibleMenuItems[this.visibleMenuItems.length - 1].id;
    }

    handleCloseSubmenus(event) {
        let itemIdToFocus = event?.detail?.parentItemId;
        this.setFocusToMenuItem(itemIdToFocus, false);
        this.closeSubMenus();
    }

    handleLeftRightArrowKeyOnSubmenu(event) {
        let parentItemId = event.detail.parentItemId;
        let parentItemIndex = this.findItemIndex(parentItemId);
        let newFocusedItemId;
        if (event.detail.key === 'ArrowLeft') {
            let newFocusedItemIndex =
                parentItemIndex - 1 < 0
                    ? this.visibleMenuItems.length - 1
                    : parentItemIndex - 1;
            newFocusedItemId = this.visibleMenuItems[newFocusedItemIndex].id;
        }

        if (event.detail.key === 'ArrowRight') {
            let newFocusedItemIndex =
                parentItemIndex + 1 >= this.visibleMenuItems.length
                    ? 0
                    : parentItemIndex + 1;
            newFocusedItemId = this.visibleMenuItems[newFocusedItemIndex].id;
        }
        this.setActiveItemToInactive();
        this.setFocusToMenuItem(newFocusedItemId, true);
    }

    handleFocus(event) {
        event.preventDefault();
        this._focusedItemId = event.currentTarget.dataset.id;
    }

    handleAppLauncher(event) {
        event.preventDefault();
        this.dispatchEvent(
            new CustomEvent(SHOW_APP_LAUNCHER, {
                bubbles: true,
                cancelable: true,
                composed: true
            })
        );
    }


}