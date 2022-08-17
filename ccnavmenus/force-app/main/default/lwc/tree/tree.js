/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, api, track } from 'lwc';
import { TreeData } from './treeData';
import { keyCodes, deepCopy } from 'c/utilsPrivate';

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
        initWidth: 70,
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
        let itemsFirstLevel = JSON.parse(JSON.stringify(this._childNodes));
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

    @api get treeContainerClasses() {
        let treeContainerClasses = 'slds-tree_container';
        treeContainerClasses += (this.isVertical !== undefined && this.isVertical !== null && this.isVertical) ? ' slds-tree_container-vertical' : ' slds-tree_container-horizontal';
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

            this.syncCurrentFocused();
        }
    }

    normalizeData(items) {
        this.treedata = new TreeData();

        this._items = items.map(item => {
            return this.treedata.cloneItems(item);
        });

        const treeRoot = this.treedata.parse(this.items, this.selectedItem, this.selectedContains);
        this._childNodes = treeRoot ? treeRoot.children : [];
        this._selectedItem = treeRoot.selectedItem;
        this._key = this._childNodes.length > 0 ? treeRoot.key : null;
        if (this._key) {
            this.syncCurrentFocused();
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
        return this._items && this._items.length > 0;
    }

    checkMobile()
    {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    handleDropDownClose(e)
    {
        try {
            if(this.hamburgerMenu === false && (this.isVertical || (e.target.tagName === 'C-TREE-ITEM' && e.target.uuid === this.uuid && e.target.forceClose === undefined)))
            {
                return;
            }
            else if( (e.target.tagName === 'CCNAVMENUS-NAV-MENU'  && e.target.uuid !== this.uuid) || 
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
                    const custEvent = new CustomEvent(
                        'closehamburgermenu', {});
                    this.dispatchEvent(custEvent);
                }
            }
        } catch(e){}
    }

    handleWindowResize(e)
    {
        try {
            clearTimeout(this.resizeId);
            this.resizeId = setTimeout(this.handleMenuResize(e), 500);
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
                this.origItems = (this.origItems === undefined || this.origItems === null || this.origItems.length === 0) ? this.items : this.origItems; 
                let treeItemElementsObjects = this.template.querySelector('c-tree-item');
                let treeItemElements = (treeItemElementsObjects !== undefined && treeItemElementsObjects !== null) ? treeItemElementsObjects.treeItemElements : [];

                if(treeItemElements.length > 0)
                {
                    for(let i=0;i<treeItemElements.length;i++)
                    {
                        if(treeItemElements[i].key !== 'more')
                        {
                            let computedWidth = treeItemElements[i].offsetWidth + parseInt(getComputedStyle(treeItemElements[i]).marginLeft) + parseInt(getComputedStyle(treeItemElements[i]).marginRight);
                            this.origItems[i].calcWidth = (this.origItems[i].calcWidth === undefined || this.origItems[i].calcWidth === null || this.origItems[i].calcWidth > computedWidth) ? computedWidth : this.origItems[i].calcWidth;
                        }
                        else
                        {
                            this.moreItems.calcWidth = (this.moreItems.calcWidth === undefined) ? treeItemElements[i].offsetWidth + parseInt(getComputedStyle(treeItemElements[i]).marginLeft) + parseInt(getComputedStyle(treeItemElements[i]).marginRight) : this.moreItems.calcWidth;
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
                this.origItems = (this.origItems === undefined || this.origItems === null || this.origItems.length === 0) ? this.items : this.origItems; 
                
                let topElement = this.template.querySelector('[role="treeContainer"]');
                let topElementWidth = topElement.offsetWidth + parseInt(getComputedStyle(topElement).marginLeft) + parseInt(getComputedStyle(topElement).marginRight);

                let deviceWidth = document?.documentElement?.clientWidth || document?.body?.clientWidth;
                
                topElementWidth = (deviceWidth < topElementWidth) ? deviceWidth : topElementWidth;

                let currItems = [];

                this.moreItems.items = [];

                let MoreItemsWidth = (this.moreItems.calcWidth === undefined) ? this.moreItems.initWidth + this.topLevelItemSpacing : this.moreItems.calcWidth;
                let calcItemsWidth = MoreItemsWidth;
                for(let i=0;i<this.origItems.length;i++)
                {
                    if(this.origItems[i].key === 'more')
                    {
                        continue;
                    }

                    calcItemsWidth += (this.origItems[i].calcWidth !== undefined && this.origItems[i].calcWidth !== null) ? this.origItems[i].calcWidth : 0;
                    if(i === (this.origItems.length - 1) &&  (calcItemsWidth - MoreItemsWidth)  <= topElementWidth)
                    {
                        currItems.push(this.origItems[i]);
                    }
                    else if(calcItemsWidth >= topElementWidth)
                    {
                        var origItem = JSON.parse(JSON.stringify(this.origItems[i]));
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
        if(items !== undefined && items !== null && items.length > 0)
        {
            for(let i=0;i<items.length;i++)
            {
                items[i].level = level;
                if(items[i].items !== undefined && items[i].items !== null && items[i].items.length > 0)
                {
                    this.recursiveUpdateLevel(items[i].items, level+1);
                }
            }
        }
    }

}