/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, api, track } from 'lwc';
import { classSet } from 'c/utils';
import { keyCodes } from 'c/utilsPrivate';

const i18n = {
    collapseBranch: 'Collapse ',
    expandBranch: 'Expand '
};

export default class cTreeItem extends LightningElement {
    @track _children = [];
    @track _tabindexes = {};
    @track _selected = {};
    

    _focusedChild = null;

    @api isRoot = false;
    @api label = '';
    @api href;
    @api target;
    @api icon;
    @api iconPosition;
    @api metatext;
    @api nodeRef;
    @api isExpanded;
    @api isDisabled = false;
    @api nodename;
    @api nodeKey;
    @api isLeaf;
    @api selected;
    @api level = 0;
    @api isVertical = false;
    @api uuid;
    @api urlSubMapJson;
    @api menuAriaAnnouncement='';

    //styling inputs
    @api brandNavigationColorText;
    @api brandNavigationBarBackgroundColor;
    @api brandNavigationBackgroundColor;
    @api textTransform;
    @api fontFamily;
    @api topLevelItemSpacing = 20;

    @api get liClass()
    {
        let liClass = (this.isVertical) ? 'groupMenuItem' : 'horizontalMenuItem';
        return liClass;
    }
    
    @api get groupDivClass()
    {
        let groupDivClass = (this.isVertical) ? 'vertical-' : 'horizontal-';
        return groupDivClass + 'groupDiv-' + this.level;
    }

    @api get iconPositionLeft() {
        return this.iconPosition !== undefined && this.iconPosition !== null && this.iconPosition.trim() === 'left';
    }

    @api get iconPositionRight() {
        return this.iconPosition !== undefined && this.iconPosition !== null && this.iconPosition.trim() === 'right';
    }

    @api get treeItemElements() {
       return this.template.querySelectorAll('c-tree-item[aria-level="1"]');
    }

    @api get childItems() {
        return this._children;
    }

    set childItems(value) {
        this._children = value;
        const childLen = this._children.length;
        for (let i = 0; i < childLen; i++) {
            this.setSelectedAttribute(i, 'false');
        }
    }

    @api get focusedChild() {
        return this._focusedChild;
    }

    set focusedChild(value) {
        this._focusedChild = value;
    }

    setSelectedAttribute(childNum, value) {
        this._selected[childNum] = value;
    }

    connectedCallback() {
        
        this.dispatchEvent(
            new CustomEvent('privateregisteritem', {
                composed: true,
                bubbles: true,
                detail: {
                    focusCallback: this.makeChildFocusable.bind(this),
                    unfocusCallback: this.makeChildUnfocusable.bind(this),
                    key: this.nodeKey
                }
            })
        );

        this.addEventListener('keydown', this.handleKeydown.bind(this));

        this.handleUrlReplace();
        
    }

    renderedCallback() {
        if (typeof this.focusedChild === 'number') {
            const child = this.getNthChildItem(this.focusedChild + 1);
            if (child && ((!child.isLeaf && this.isVertical === false) || (child.level > 1 && this.isVertical === true))) {
                child.tabIndex = '0';
            }
        }

        let treeItemCSS = this.template.querySelector('div[role="ccnavMenu-treeItemCSS"]');

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

            if(this.textTransform === undefined || this.textTransform === null || this.textTransform.trim() === '' || this.textTransform.trim() === 'inherit')
            {   
                this.textTransform = getComputedStyle(document.documentElement).getPropertyValue('--lwc-textTransform');
            }
            if(this.textTransform !== undefined && this.textTransform !== null && this.textTransform.trim() !== '')
            {
                treeItemCSS.style.setProperty('--ccnavmenus-textTransform', this.textTransform);
            }

            if(this.topLevelItemSpacing !== undefined && this.topLevelItemSpacing !== null)
            {
                treeItemCSS.style.setProperty('--ccnavmenus-topLevelItemSpacing', this.topLevelItemSpacing +'px');
            }
        }
        
    }

    get isDropDownTrigger() {
        return (this.href === 'javascript:void(0)' || this.href === 'javascript:void(0);');
    }

    get buttonLabel() {
        if (this.nodeRef && this.nodeRef.expanded) {
            return i18n.collapseBranch + this.label;
        }
        return i18n.expandBranch + this.label;
    }

    get linkTitle() {
        let linkTitleTmp = '';
        if(this.isDropDownTrigger && this.children.length > 0)
        {
            linkTitleTmp = this.buttonLabel;
        }
        else 
        {
            linkTitleTmp =  this.label;
        }
        return linkTitleTmp;
    }

    get linkRole() {
        if(this.isLeaf === true || !this.isDropDownTrigger)
        {
            return 'link';
        }
        else 
        {
            return 'menuitem';
        }
    }

    get showExpanded() { 
        if (!this.nodeRef) {
            return false;
        }
        return !this.isDisabled && this.nodeRef.expanded;
    }

    get computedButtonClass() {
        let buttonClasses = 'slds-button slds-button_icon';
        buttonClasses += (this.computedIconPositionLeft) ? ' slds-m-right_x-small ' : ' slds-m-left_x-small ';
        return classSet(buttonClasses)
            .add({
                'slds-hide': this.isLeaf || this.isDisabled
            })
            .toString();
    }

    get computedIconName() {
        let iconName = document.dir === 'rtl'
            ? 'utility:chevronleft'
            : 'utility:chevronright';
        iconName = (this.computedIconPositionLeft) ? iconName : 'utility:chevrondown' ;
        iconName = (this.isExpanded) ? 'utility:chevrondown' : iconName;
        iconName = (this.level === 6) ? null : iconName; 
        return iconName;
    }

    get computedIconTabindex() {

        if(this.isDropDownTrigger)
        {
            return '-1';
        }
        else 
        {
            return '0';
        }

    }

    get computedIconFocusable() {

        if(this.isDropDownTrigger)
        {
            return 'false';
        }
        else 
        {
            return 'true';
        }
        
    }

    get ariaLabelledById() 
    {
        if(this.nodeKey === "1")
        {
            return 'announceNavMenu';
        }
        else 
        {
            return '';
        }
    }

    get isFirstNode()
    {
        return this.nodeKey === "1";
    }

    get linkIsExpanded() {
        if(this.isLeaf || !this.isDropDownTrigger)
        {
            return '';
        }
        let tmpLinkIsExpanded = false;
        tmpLinkIsExpanded = this.children.length > 0 && this.isExpanded;
        return tmpLinkIsExpanded;
    }

    get computedIconPositionLeft()
    {
        return (this.isVertical || this.level !== 1);
    }

    get computedIconPositionRight()
    {
        return (!this.isVertical && this.level === 1);
    }

    get nextLevel()
    {
        return this.level + 1;
    }

    get children() {
        return this._children.map((child, idx) => {
            return {
                node: child,
                tabindex: this._tabindexes[idx],
                selected: this._selected[idx]
            };
        });
    }

    preventDefaultAndStopPropagation(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleClick(event) {
        if (!this.isDisabled) {
            // eslint-disable-next-line no-script-url
            if (this.isDropDownTrigger) {
                event.preventDefault();
            }
            let target = 'anchor';
            if (
                event.target.tagName === 'BUTTON' ||
                event.target.tagName === 'C-PRIMITIVE-ICON' ||
                (this.isDropDownTrigger && this.isLeaf === false)
            ) {
                target = 'chevron';
            }
            const customEvent = new CustomEvent('privateitemclick', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    name: this.nodename,
                    key: this.nodeKey,
                    target
                }
            });

            this.dispatchEvent(customEvent);

            if(target === 'chevron')
            {
                this.preventDefaultAndStopPropagation(event);
            }
        }
    }

    handleKeydown(event) {
        switch (event.keyCode) {
            case keyCodes.space:
            case keyCodes.enter:
                this.preventDefaultAndStopPropagation(event);
                if(event.target.tagName === 'C-PRIMITIVE-ICON')
                {
                    this.handleClick(event);
                }
                else
                {
                    this.template.querySelector('.slds-tree__item a').click();
                }
                break;
            case keyCodes.up:
            case keyCodes.down:
            case keyCodes.right:
            case keyCodes.left:
            case keyCodes.home:
            case keyCodes.end:
                this.preventDefaultAndStopPropagation(event);
                this.dispatchEvent(
                    new CustomEvent('privateitemkeydown', {
                        bubbles: true,
                        composed: true,
                        cancelable: true,
                        detail: {
                            key: this.nodeKey,
                            keyCode: event.keyCode
                        }
                    })
                );

                break;

            default:
                break;
        }
    }

    fireCustomEvent(eventName, item) {
        const eventObject = {
            bubbles: true,
            composed: true,
            cancelable: false
        };

        if (item !== undefined) {
            eventObject.detail = { key: item };
        }
        // eslint-disable-next-line lightning-global/no-custom-event-identifier-arguments
        this.dispatchEvent(new CustomEvent(eventName, eventObject));
    }

    handleFocus() {
        this.fireCustomEvent('privatechildfocused', this.nodeKey);
    }

    handleBlur() {
        this.fireCustomEvent('privatechildunfocused', this.nodeKey);
    }

    getChildNum(childKey) {
        const idx = childKey.lastIndexOf('.');
        const childNum =
            idx > -1
                ? parseInt(childKey.substring(idx + 1), 10)
                : parseInt(childKey, 10);
        return childNum - 1;
    }

    makeChildFocusable(childKey, shouldFocus) {
        const child = this.getImmediateChildItem(childKey);
        if (child) {
            if (child.tabIndex !== '0' && ((!child.isLeaf && this.isVertical === false) || (child.level > 1 && this.isVertical === true))) {
                child.tabIndex = '0';
            }
            if (shouldFocus) {
                child.focus();
            }
            //child.ariaSelected = true;
            child.setAttribute('aria-selected', true);
        }
    }

    makeChildUnfocusable() {
        //this.ariaSelected = 'false';
        this.setAttribute('aria-selected', false);
        this.removeAttribute('tabindex');        
    }

    getImmediateChildItem(key) {
        return this.template.querySelector(
            "c-tree-item[data-key='" + key + "']"
        );
    }

    getNthChildItem(n) {
        return this.template.querySelector(
            'c-tree-item:nth-of-type(' + n + ')'
        );
    }

    handleUrlReplace()
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
                            || urlSubMap[i].replaceWith === undefined || urlSubMap[i].replaceWith === null || urlSubMap[i].replaceWith.trim() === '')
                        {
                            continue;
                        }

                        let searchMask = this.escapeRegex(urlSubMap[i].replaceThis);
                        let regEx = new RegExp(searchMask, "ig");
                        let replaceMask = urlSubMap[i].replaceWith;
                        this.href = (this.href !== undefined && this.href !== null) ? this.href.replace(regEx, replaceMask) : this.href;
                    }
                }
            }

        } catch(e) {}
    }

    escapeRegex(string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

}