/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, api, track } from 'lwc';
import { TreeData } from './treeData';
import { keyCodes, deepCopy } from 'c/utilsPrivate';
import * as generalUtils from 'c/gtaUtilsGeneral';

export default class cTree extends LightningElement {
    @api header;
    @api selectedContains = false;
    @api isVertical = false;
    @api uuid;
    
    @api hamburgerMenu = false;

    //styling inputs
    @api brandNavigationColorText;
    @api brandNavigationBarBackgroundColor;
    @api brandNavigationBackgroundColor;
    @api fontFamily;
    @api textTransform;  
    @api topLevelItemSpacing = 20;  
    @api menuAriaAnnouncement='';
    @api menuAlignment = 'Left';

    @api overflowLabel = 'More';

    @track _currentFocusedItem = null;
    @track _childNodes;
    @track _key;
    @track _focusedChild = null;
    @track _items = []
    @track widthCalculated = false;
    @track clickListener;
    @track resizeListener;
    

    @track origItems = [];
    @track resizeId;
    @track moreItems = {
        id: 'more',
        label: 'More',
        name: 'more',
        key: 'more',
        expanded: false,
        href: 'javascript:void(0);',
        level: 1,
        initWidth: 125,
        calcWidth: undefined,
        items: []
    };

    _defaultFocused = { key: '1', parent: '0' };
    _selected = null;
    @track _selectedItem = null;
    hasDetachedListeners = true;

    constructor() {
        super();
        this.callbackMap = {};
        this.treedata = null;
        this.template.addEventListener(
            'privateitemkeydown',
            this.handleKeydown.bind(this)
        );

        this.template.addEventListener(
            'privateitemclick',
            this.handleClick.bind(this)
        );

        this.template.addEventListener(
            'privateregisteritem',
            this.handleRegistration.bind(this)
        );

    }

    @api get childrenFirstLevel() {
        let itemsFirstLevel = generalUtils.cloneObjectWithJSON(this._childNodes);
        for(let i=0;i<itemsFirstLevel.length;i++)
        {
            itemsFirstLevel[i].items = [];
        }
        return itemsFirstLevel;
    }

    @api get items() {     

        return this._items || [];
    }

    set items(value) {
        this.normalizeData(value);
    }

    @api get selectedItem() {
        return this._selected;
    }

    set selectedItem(value) {
        this._selected = value;
        this.syncSelected();
    }

    get children() {
        return this._childNodes;
    }

    get rootElement() {
        return this._key;
    }

    get focusedChild() {
        return this._focusedChild;
    }

    @api menuAlignmentClass = '';

    @api get treeContainerClasses() {
        let treeContainerClasses = 'slds-tree_container';
        treeContainerClasses += (generalUtils.isObjectEmpty(this.isVertical) === false && this.isVertical) ? ' slds-tree_container-vertical slds-p-around_small ' : ' slds-tree_container-horizontal';
        return treeContainerClasses;
    }

    connectedCallback()
    {
        this.moreItems.label = this.overflowLabel;
        if(!this.isVertical)
        {
            this.clickListener = this.handleDropDownClose.bind(this);
            this.resizeListener = this.handleWindowResize.bind(this);
            window.addEventListener(
                'click',
                this.clickListener
            );
            
            
            window.addEventListener(
                'resize',
                this.resizeListener
            );
            
        }
    }

    syncSelected() {
        if (this.treedata && this._childNodes.length > 0) {
            this._selectedItem = this.treedata.syncSelectedToData(
                this.selectedItem
            );

           // this.syncCurrentFocused();
        }
    }

    normalizeData(items) {
        if(items !== undefined && items !== null)
        {
            this.treedata = new TreeData();

            this._items = items.map(item => {
                return this.treedata.cloneItems(item);
            });

            const treeRoot = this.treedata.parse(this.items, this.selectedItem, this.selectedContains);
            this._childNodes = treeRoot ? treeRoot.children : [];
            this._selectedItem = treeRoot.selectedItem;
            this._key = this._childNodes.length > 0 ? treeRoot.key : null;
            if (this._key) {
                //this.syncCurrentFocused();
            }
        }
    }

    syncCurrentFocused() {
        if (this._selectedItem) {
            this._currentFocusedItem = this._selectedItem;
        } else if (
            !this._currentFocusedItem ||
            !this.treedata.isValidCurrent(this._currentFocusedItem)
        ) {
            this._currentFocusedItem = this._defaultFocused;
        }
        this.updateCurrentFocusedChild();
        if(!this.isVertical)
        {
            this.collapseAll();
        }
    }

    updateCurrentFocusedChild() {
        if (this._key === this._currentFocusedItem.parent) {
            this._focusedChild = this.treedata.getChildNum(
                this._currentFocusedItem.key
            );
        } else {
            this._focusedChild = this._currentFocusedItem.key;
            this.treedata.updateCurrentFocusedChild(
                this._currentFocusedItem.key
            );
        }
    }

    handleTreeFocusIn(event) {
        const relatedTarget = event.relatedTarget;
        if (
            this._currentFocusedItem &&
            relatedTarget &&
            relatedTarget.tagName !== 'C-TREE-ITEM'
        ) {
            this.setFocusToItem(this._currentFocusedItem, false);
        }
    }

    renderedCallback() {
        if (this._selectedItem) {
            this.setFocusToItem(this._currentFocusedItem, false);
        }
        if (this.hasDetachedListeners) {
            const container = this.template.querySelector(
                '[role="treeContainer"]'
            );

        
            container.addEventListener(
                'focus',
                this.handleTreeFocusIn.bind(this)
            );
            

            this.hasDetachedListeners = false;
        }
        
        if(!this.widthCalculated)
        {
            this.handleWidthCalculations();
        }

        

    }

    disconnectedCallback() {
        this.hasDetachedListeners = true;
        window.removeEventListener('click', this.clickListener);
        window.removeEventListener('resize', this.resizeListener);
    }

    handleClick(event) {
        const key = event.detail.key;
        const target = event.detail.target;
        const item = this.treedata.getItem(key);
        if (item) {
            if (target === 'chevron') {
                if (item.treeNode.nodeRef.expanded) {
                    this.collapseBranch(item.treeNode);
                } else {
                    this.expandBranch(item.treeNode);
                    
                    if(!this.isVertical && item.treeNode.level === 1)
                    {
                        for(let i=0; i < this.items.length;i++)
                        {
                            if(this.items[i].name !== item.treeNode.name)
                            {
                                let itemToCollapse = this.treedata.getItemFromName(this.items[i].name);
                                this.collapseBranch(itemToCollapse.treeNode);
                            }
                        }
                    }

                }
            } else {
                this._selectedItem = item;
                this.dispatchSelectEvent(item.treeNode);
                this.setFocusToItem(item);
                event.target.forceClose = true;
                this.handleDropDownClose(event);
            }
        }
    }

    expandBranch(node) {
        if (!node.isLeaf && !node.isDisabled) {
            node.nodeRef.expanded = true;
            if (
                this._selectedItem &&
                this._selectedItem.key.startsWith(node.key)
            ) {
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => {
                    this.setFocusToItem(this._selectedItem);
                }, 0);
            }

            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        items: deepCopy(this._items)
                    }
                })
            );
        }
    }

    collapseBranch(node) {
        if (!node.isLeaf && !node.isDisabled) {
            node.nodeRef.expanded = false;
            this.treedata.updateVisibleTreeItemsOnCollapse(node.key);

            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: { items: deepCopy(this._items) }
                })
            );
        }
    }

    collapseAll()
    {
        for(let i=0; i < this.items.length;i++)
        {
            if(this.items[i].level === 1)
            {
                let itemToCollapse = this.treedata.getItemFromName(this.items[i].name);
                this.collapseBranch(itemToCollapse.treeNode);
            }
        }
    }

    dispatchSelectEvent(node) {
        if (!node.isDisabled) {
            const customEvent = new CustomEvent('select', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: { name: node.name }
            });

            this.dispatchEvent(customEvent);
        }
    }

    handleKeydown(event) {
        event.preventDefault();
        event.stopPropagation();
        const item = this.treedata.getItem(event.detail.key);
        switch (event.detail.keyCode) {
            case keyCodes.up:
                this.setFocusToPrevItem();
                break;
            case keyCodes.down:
                this.setFocusToNextItem();
                break;
            case keyCodes.home:
                this.setFocusToFirstItem();
                break;
            case keyCodes.end:
                this.setFocusToLastItem();
                break;
            case keyCodes.right:
                this.expandBranch(item.treeNode);
                break;
            case keyCodes.left:
                if (item.treeNode.nodeRef.expanded && !item.treeNode.isLeaf) {
                    this.collapseBranch(item.treeNode);
                } else {
                    this.handleParentCollapse(event.detail.key);
                }
                break;

            default:
                break;
        }
    }

    setFocusToItem(item, shouldFocus = true) {
        const currentFocused = this.treedata.getItemAtIndex(
            this.treedata.currentFocusedItemIndex
        );

        if (
            currentFocused &&
            currentFocused.key !== item.key &&
            this.callbackMap[currentFocused.parent]
        ) {
            this.callbackMap[currentFocused.key].unfocusCallback();
        }
        if (item) {
            this._currentFocusedItem = this.treedata.updateCurrentFocusedItemIndex(
                item.index
            );

            if (this.callbackMap[item.parent]) {
                this.callbackMap[item.parent].focusCallback(
                    item.key,
                    shouldFocus
                );
            }
        }
    }

    setFocusToNextItem() {
        const nextNode = this.treedata.findNextNodeToFocus();
        if (nextNode && nextNode.index !== -1) {
            this.setFocusToItem(nextNode);
        }
    }

    setFocusToPrevItem() {
        const prevNode = this.treedata.findPrevNodeToFocus();
        if (prevNode && prevNode.index !== -1) {
            this.setFocusToItem(prevNode);
        }
    }

    setFocusToFirstItem() {
        const node = this.treedata.findFirstNodeToFocus();
        if (node && node.index !== -1) {
            this.setFocusToItem(node);
        }
    }

    setFocusToLastItem() {
        const lastNode = this.treedata.findLastNodeToFocus();
        if (lastNode && lastNode.index !== -1) {
            this.setFocusToItem(lastNode);
        }
    }

    handleFocusFirst(event) {
        event.stopPropagation();
        this.setFocusToFirstItem();
    }

    handleFocusLast(event) {
        event.stopPropagation();
        this.setFocusToLastItem();
    }

    handleFocusNext(event) {
        event.stopPropagation();
        this.setFocusToNextItem();
    }

    handleFocusPrev(event) {
        event.stopPropagation();
        this.setFocusToPrevItem();
    }

    handleChildBranchCollapse(event) {
        event.stopPropagation();
        this.treedata.updateVisibleTreeItemsOnCollapse(event.detail.key);
    }

    handleParentCollapse(key) {
        const item = this.treedata.getItem(key);
        if (item && item.level > 1) {
            const parent = this.treedata.getItem(item.parent);
            this.collapseBranch(parent.treeNode);
            this.setFocusToItem(parent);
        }
    }

    handleRegistration(event) {
        const itemKey = event.detail.key;
        this.callbackMap[itemKey] = {
            focusCallback: event.detail.focusCallback,
            unfocusCallback: event.detail.unfocusCallback
        };

        this.treedata.addVisible(itemKey);
        event.stopPropagation();
    }

    get hasChildren() {
        return generalUtils.isArrayEmpty(this._items) === false;
    }

    handleDropDownClose(e)
    {
        try {
            if(this.hamburgerMenu === false && (this.isVertical || (e.target.tagName === 'C-TREE-ITEM' && e.target.uuid === this.uuid && e.target.forceClose === undefined)))
            {
                return;
            }
            else if( ((e.target.tagName === 'CCNAVMENUS-NAV-MENU' || e.target.tagName === 'CCNAVMENUS-NAV-MENU2')  && e.target.uuid !== this.uuid) || 
                        e.target.uuid === undefined || 
                    (e.target.forceClose !== undefined && e.target.forceClose === true) )
            {
                e.target.forceClose = undefined;
                if(this.hamburgerMenu === false)
                {
                    for(let i=0; i < this.items.length;i++)
                    {
                        if(this.items[i].level === 1)
                        {
                            let itemToCollapse = this.treedata.getItemFromName(this.items[i].name);
                            if(itemToCollapse.treeNode.isExpanded)
                            {
                                this.collapseBranch(itemToCollapse.treeNode);
                            }
                        }
                    }
                }
                else
                {
                    let eventDetail = {forceClose: true};
                    const custEvent = new CustomEvent(
                        'closehamburgermenu', {detail: eventDetail});
                    this.dispatchEvent(custEvent);
                }
            }
        } catch(e){}
    }

    @api handleWindowResize(e)
    {
        try {
            //clearTimeout(this.resizeId);
            //this.resizeId = setTimeout(this.handleMenuResize(e), 500);
            this.resizeId = generalUtils.debounce(this.handleMenuResize(e), 500);
        } catch(e){}
    }

    handleWidthCalculations()
    {
        try{
            if(this.isVertical)
            {
                this.widthCalculated = true;
            }
            else
            {
                this.origItems = (generalUtils.isArrayEmpty(this.origItems) === true) ? this.items : this.origItems; 
                let treeItemElementsObjects = this.template.querySelector('c-tree-item');
                let treeItemElements = (generalUtils.isObjectEmpty(treeItemElementsObjects) === false) ? treeItemElementsObjects.treeItemElements : [];

                if(treeItemElements.length > 0)
                {
                    for(let i=0;i<treeItemElements.length;i++)
                    {
                        if(treeItemElements[i].key !== 'more')
                        {
                            //let computedWidth = treeItemElements[i].offsetWidth + parseInt(getComputedStyle(treeItemElements[i]).marginLeft) + parseInt(getComputedStyle(treeItemElements[i]).marginRight);
                            let computedWidth = generalUtils.getElementWidth(treeItemElements[i]);
                            this.origItems[i].calcWidth = (generalUtils.isObjectEmpty(this.origItems[i].calcWidth) === true || this.origItems[i].calcWidth > computedWidth) ? computedWidth : this.origItems[i].calcWidth;
                        }
                        else
                        {
                            this.moreItems.calcWidth = (generalUtils.isObjectEmpty(this.moreItems.calcWidth) === true) ? generalUtils.getElementWidth(treeItemElements[i]) : this.moreItems.calcWidth;
                        }
                    }
                    this.widthCalculated = true;
                    this.handleMenuResize();
                }
            }
        }catch(e){}

    }
    
    handleMenuResize(e)
    {
        try {
            if(!this.isVertical && this.widthCalculated)
            {
                this.origItems = (generalUtils.isArrayEmpty(this.origItems) === true) ? this.items : this.origItems; 
                
                let topElement = this.template.querySelector('[role="treeContainer"]');
                //let topElementWidth = topElement.offsetWidth + parseInt(getComputedStyle(topElement).marginLeft) + parseInt(getComputedStyle(topElement).marginRight);
                let topElementWidth = generalUtils.getContainerElementWidth(topElement);

                //let deviceWidth = document?.documentElement?.clientWidth || document?.body?.clientWidth;
                let deviceWidth = generalUtils.getWindowWidth();

                topElementWidth = (deviceWidth < topElementWidth) ? deviceWidth : topElementWidth;

                let currItems = [];

                this.moreItems.items = [];

                let MoreItemsWidth = (generalUtils.isObjectEmpty(this.moreItems.calcWidth) === true) ? this.moreItems.initWidth + this.topLevelItemSpacing : this.moreItems.calcWidth;
                let calcItemsWidth = MoreItemsWidth;
                for(let i=0;i<this.origItems.length;i++)
                {
                    if(this.origItems[i].key === 'more')
                    {
                        continue;
                    }

                    calcItemsWidth += (generalUtils.isObjectEmpty(this.origItems[i].calcWidth) === false) ? this.origItems[i].calcWidth : 0;
                    if(i === (this.origItems.length - 1) &&  (calcItemsWidth - MoreItemsWidth)  <= topElementWidth)
                    {
                        currItems.push(this.origItems[i]);
                    }
                    else if(calcItemsWidth >= topElementWidth)
                    {
                        let origItem = generalUtils.cloneObjectWithJSON(this.origItems[i]);
                        this.moreItems.items.push(origItem);
                    }
                    else
                    {
                        currItems.push(this.origItems[i]);
                    }
                }
                
                if(this.moreItems.items.length > 0)
                { 
                    this.recursiveUpdateLevel(this.moreItems.items, 2);
                    currItems.push(this.moreItems);
                }
                
                this.items = currItems;
            }
        
        } catch(e){}

    }

    recursiveUpdateLevel(items, level)
    {
        if(generalUtils.isArrayEmpty(items) === false)
        {
            for(let i=0;i<items.length;i++)
            {
                items[i].level = level;
                if(generalUtils.isArrayEmpty(items[i].items) === false)
                {
                    this.recursiveUpdateLevel(items[i].items, level+1);
                }
            }
        }
    }

}