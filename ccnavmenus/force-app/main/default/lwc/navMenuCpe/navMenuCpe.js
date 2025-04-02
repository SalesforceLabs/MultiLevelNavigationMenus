import { LightningElement, track, api, wire } from 'lwc';
import searchMenus from '@salesforce/apex/menusManagerController.searchMenus';
import * as generalUtils from 'c/gtaUtilsGeneral';
import * as componentUtils from 'c/gtaUtilsComponent';


const typeDelay = 1000;
const defaultCSSClasses = 'slds-m-bottom_medium';
const propertyEditorWidthStyle = ':root {--cb-property-editor-width: 400px;}';

export default class NavMenuCpe extends LightningElement {

    uuid = generalUtils.generateUniqueIdentifier();

    @track menuOptions = new Array();
    @track showSpinner = false;
    @track showMenuOptions = false;
    @track showModal = false;
    @track urlSubMapTmp;
    @track showUrlSubMapTmp = true;
    @track exportError;
    @track importModalOpen = false;
    @track importError;


    @track propInputs = {
        /*
            template: {
                key: 'template', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Template', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'template', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.template', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleTestChange, //onchange handler for html lightning-input tag
            },
        */
            menuName: {
                key: 'menuName', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Name', //label used for html lighting-input tag
                type: 'search', //type used for html lightning-input tag
                help: 'Search or type Menu name', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'general.menuName', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuNameChange, //onchange handler for html lightning-input tag
            },
            languageFilter: {
                key: 'languageFilter', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Language Filter', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Select Language Filter', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.languageFilter', //property path within the value object
                value: 'auto', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleLanguageFilterChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'None', value: 'none' },
                    { label: 'Auto', value: 'auto' }
                ],
            },
            menuTypeDesktop: {
                key: 'menuTypeDesktop', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Type - Desktop', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Select Menu Type', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.menuTypeDesktop', //property path within the value object
                value: 'tree', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuTypeDesktopChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Tree', value: 'tree' },
                    { label: 'Drilldown', value: 'drilldown' },
                    { label: 'Mega', value: 'mega' }
                ],
            },
            menuModeDesktop: {
                key: 'menuModeDesktop', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Mode - Desktop', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Select Menu Mode', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.menuModeDesktop', //property path within the value object
                value: 'horizontalFirstLevel', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuModeDesktopChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Horizontal First Level', value: 'horizontalFirstLevel' },
                    { label: 'Apply Type to All Levels', value: 'allLevels' },
                    { label: 'Behind Hamburger Toggle', value: 'hamburger' },
                    { label: 'Hidden', value: 'hidden'}
                ],
            },
            dropdownOnHoverDesktop: {
                key: 'dropdownOnHoverDesktop', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Dropdown On Hover', //label used for html lighting-input tag
                type: 'toggle', //type used for html lightning-input tag
                help: 'Toggle opening dropdown menus on hover in addition to just on clicks', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.dropdownOnHoverDesktop', //property path within the value object
                value: false, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleDropdownOnHoverDesktopChange, //onchange handler for html lightning-input tag
            },
            menuTypeTablet: {
                key: 'menuTypeTablet', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Type - Tablet', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Select Menu Type', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.menuTypeTablet', //property path within the value object
                value: 'tree', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuTypeTabletChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Tree', value: 'tree' },
                    { label: 'Drilldown', value: 'drilldown' },
                    { label: 'Mega', value: 'mega' }
                ],
            },
            menuModeTablet: {
                key: 'menuModeTablet', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Mode - Tablet', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Select Menu Mode', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.menuModeTablet', //property path within the value object
                value: 'horizontalFirstLevel', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuModeTabletChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Horizontal First Level', value: 'horizontalFirstLevel' },
                    { label: 'Apply Type to All Levels', value: 'allLevels' },
                    { label: 'Behind Hamburger Toggle', value: 'hamburger' },
                    { label: 'Hidden', value: 'hidden'}
                ],
            },
            dropdownOnHoverTablet: {
                key: 'dropdownOnHoverTablet', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Dropdown On Hover', //label used for html lighting-input tag
                type: 'toggle', //type used for html lightning-input tag
                help: 'Toggle opening dropdown menus on hover in addition to just on clicks', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.dropdownOnHoverTablet', //property path within the value object
                value: false, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleDropdownOnHoverTabletChange, //onchange handler for html lightning-input tag
            },
            menuTypeMobile: {
                key: 'menuTypeMobile', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Type - Mobile', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Select Menu Type', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.menuTypeMobile', //property path within the value object
                value: 'tree', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuTypeMobileChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Tree', value: 'tree' },
                    { label: 'Drilldown', value: 'drilldown' },
                    { label: 'Mega', value: 'mega' }
                ],
            },
            menuModeMobile: {
                key: 'menuModeMobile', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Mode - Mobile', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Select Menu Mode', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.menuModeMobile', //property path within the value object
                value: 'hamburger', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuModeMobileChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Horizontal First Level', value: 'horizontalFirstLevel' },
                    { label: 'Apply Type to All Levels', value: 'allLevels' },
                    { label: 'Behind Hamburger Toggle', value: 'hamburger' },
                    { label: 'Hidden', value: 'hidden'}
                ],
            },
            dropdownOnHoverMobile: {
                key: 'dropdownOnHoverMobile', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Dropdown On Hover', //label used for html lighting-input tag
                type: 'toggle', //type used for html lightning-input tag
                help: 'Toggle opening dropdown menus on hover in addition to just on clicks', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.dropdownOnHoverMobile', //property path within the value object
                value: false, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleDropdownOnHoverMobileChange, //onchange handler for html lightning-input tag
            },
            cacheName: {
                key: 'cacheName', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Cache Name', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'Cache storage name', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.cacheName', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleCacheNameChange, //onchange handler for html lightning-input tag
            },
            cacheKey: {
                key: 'cacheKey', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Cache Key', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'Cache key', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.cacheKey', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleCacheKeyChange, //onchange handler for html lightning-input tag
            },
            cacheEnabled: {
                key: 'cacheEnabled', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Cache Enabled?', //label used for html lighting-input tag
                type: 'toggle', //type used for html lightning-input tag
                help: 'Enable cache', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.cacheEnabled', //property path within the value object
                value: false, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleCacheEnabledChange, //onchange handler for html lightning-input tag
            },
            debugMode: {
                key: 'debugMode', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Debug Mode?', //label used for html lighting-input tag
                type: 'toggle', //type used for html lightning-input tag
                help: 'Toggle Debug Mode', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.debugMode', //property path within the value object
                value: false, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleDebugModeChange, //onchange handler for html lightning-input tag
            },
            urlSubMap: {
                key: 'urlSubMap', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Label and URL Substition Map', //label used for html lighting-input tag
                buttonLabel: 'Create',
                type: 'arrayObject', //type used for html lightning-input tag
                help: 'Use one of these tokens in "Replace With" for dynamic User-related substitutions: [@User.Id] [@User.AccountId] [@User.AccountName] [@User.ContactId] [@User.FirstName] [@User.LastName] [@User.FirstInitial] [@User.LastInitial] [@User.CommunityNickname]', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.urlSubMap', //property path within the value object
                value: undefined, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                clickHandler: this.handleUrlSubMapClick, //onchange handler for html lightning-input tag
            },
            overflowLabel: {
                key: 'overflowLabel', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Overflow Label', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'Label for menu overflow', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'labels.overflowLabel', //property path within the value object
                value: 'More', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleOverflowLabelChange, //onchange handler for html lightning-input tag
            },
            drilldownBackLabel: {
                key: 'drilldownBackLabel', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Drilldown Back Label', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'Label for Drilldown menu back button', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'labels.drilldownBackLabel', //property path within the value object
                value: 'Back', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleDrilldownBackLabelChange, //onchange handler for html lightning-input tag
            },
            drilldownGotoLabel: {
                key: 'drilldownGotoLabel', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Drilldown Goto Label', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'Label for Drilldown menu Goto button', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'labels.drilldownGotoLabel', //property path within the value object
                value: 'Go to', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleDrilldownGotoLabelChange, //onchange handler for html lightning-input tag
            },
            menuAlignment: {
                key: 'menuAlignment', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Alignment - Desktop', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Menu Alignment', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.menuAlignment', //property path within the value object
                value: 'center', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuAlignmentChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Center', value: 'center' },
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' }
                ],
            },
            menuAlignmentTablet: {
                key: 'menuAlignmentTablet', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Alignment - Tablet', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Menu Alignment', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.menuAlignmentTablet', //property path within the value object
                value: 'center', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuAlignmentTabletChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Center', value: 'center' },
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' }
                ],
            },
            menuAlignmentMobile: {
                key: 'menuAlignmentMobile', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Alignment - Mobile', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Menu Alignment', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.menuAlignmentMobile', //property path within the value object
                value: 'center', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuAlignmentMobileChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Center', value: 'center' },
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' }
                ],
            },
            menuItemVerticalPadding: {
                key: 'menuItemVerticalPadding', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Item Vertical Padding (in px) - Desktop', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Top / Bottom total padding for all menu items', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.menuItemVerticalPadding', //property path within the value object
                value: 16, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleMenuItemVerticalPaddingChange, //onchange handler for html lightning-input tag
            },
            menuItemVerticalPaddingTablet: {
                key: 'menuItemVerticalPaddingTablet', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Item Vertical Padding (in px) - Tablet', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Top / Bottom total padding for all menu items', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.menuItemVerticalPaddingTablet', //property path within the value object
                value: 16, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleMenuItemVerticalPaddingTabletChange, //onchange handler for html lightning-input tag
            },
            menuItemVerticalPaddingMobile: {
                key: 'menuItemVerticalPaddingMobile', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Item Vertical Padding (in px) - Mobile', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Top / Bottom total padding for all menu items', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.menuItemVerticalPaddingMobile', //property path within the value object
                value: 16, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleMenuItemVerticalPaddingMobileChange, //onchange handler for html lightning-input tag
            },
            overrideFontSize: {
                key: 'overrideFontSize', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Override Font Size (in px) - Desktop', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Override font size, defaults to theme values', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.overrideFontSize', //property path within the value object
                value: undefined, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleOverrideFontSizeChange, //onchange handler for html lightning-input tag
            },
            overrideFontSizeTablet: {
                key: 'overrideFontSizeTablet', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Override Font Size (in px) - Tablet', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Override font size in tablet, defaults to theme values', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.overrideFontSizeTablet', //property path within the value object
                value: undefined, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleOverrideFontSizeTabletChange, //onchange handler for html lightning-input tag
            },
            overrideFontSizeMobile: {
                key: 'overrideFontSizeMobile', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Override Font Size (in px) - Mobile', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Override font size in mobile, defaults to theme values', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.overrideFontSizeMobile', //property path within the value object
                value: undefined, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleOverrideFontSizeMobileChange, //onchange handler for html lightning-input tag
            },
            topLevelItemSpacing: {
                key: 'topLevelItemSpacing', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Horizontal Bar Menu Item Horizontal Spacing (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Top (First) level item spacing between menu items when Horizontal First Level mode is selected', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.topLevelItemSpacing', //property path within the value object
                value: 20, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleTopLevelItemSpacingChange, //onchange handler for html lightning-input tag
            },
            hideHamburgerMenuAnimation: {
                key: 'hideHamburgerMenuAnimation', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Hide Hamburger Menu Animation', //label used for html lighting-input tag
                type: 'toggle', //type used for html lightning-input tag
                help: 'Hide Hamburger Menu Animation', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.hideHamburgerMenuAnimation', //property path within the value object
                value: false, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleHideHamburgerMenuAnimationChange, //onchange handler for html lightning-input tag
            },
            overrideFontFamily: {
                key: 'overrideFontFamily', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Override Font Family', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'Override menu text font family', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.overrideFontFamily', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_xx-large', //css classes for html lightning-input tag
                changeHandler: this.handleOverrideFontFamilyChange, //onchange handler for html lightning-input tag
            },
            overrideTextCase: {
                key: 'overrideTextCase', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Override Text Case', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Override the menu text case', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.overrideTextCase', //property path within the value object
                value: 'inherit', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleOverrideTextCaseChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Inherit', value: 'inherit' },
                    { label: 'None', value: 'none' },
                    { label: 'Capitalize', value: 'capitalize' },
                    { label: 'Uppercase', value: 'uppercase' },
                    { label: 'Lowercase', value: 'lowercase' }
                ],
            },
            sldsIconSize: {
                key: 'sldsIconSize', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'SLDS Icon Size - Desktop', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'SLDS Icon Size. Affected by both the font and this value together. Font Awesome Icons are only affected by the font size.', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.sldsIconSize', //property path within the value object
                value: '1', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleSldsIconSizeChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'X-Small', value: '0.5' },
                    { label: 'Small', value: '0.75' },
                    { label: 'Medium', value: '1' },
                    { label: 'Large', value: '1.25' },
                    { label: 'X-Large', value: '1.5' }
                ],
            },
            sldsIconSizeTablet: {
                key: 'sldsIconSizeTablet', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'SLDS Icon Size - Tablet', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'SLDS Icon Size. Affected by both the font and this value together. Font Awesome Icons are only affected by the font size.', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.sldsIconSizeTablet', //property path within the value object
                value: '1', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleSldsIconSizeTabletChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'X-Small', value: '0.5' },
                    { label: 'Small', value: '0.75' },
                    { label: 'Medium', value: '1' },
                    { label: 'Large', value: '1.25' },
                    { label: 'X-Large', value: '1.5' }
                ],
            },
            sldsIconSizeMobile: {
                key: 'sldsIconSizeMobile', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'SLDS Icon Size - Mobile', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'SLDS Icon Size. Affected by both the font and this value together. Font Awesome Icons are only affected by the font size.', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.sldsIconSizeMobile', //property path within the value object
                value: '1', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleSldsIconSizeMobileChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'X-Small', value: '0.5' },
                    { label: 'Small', value: '0.75' },
                    { label: 'Medium', value: '1' },
                    { label: 'Large', value: '1.25' },
                    { label: 'X-Large', value: '1.5' }
                ],
            },
            iconSpacing: {
                key: 'iconSpacing', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Icon Horizontal Spacing (in px) - Desktop', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Icon Horizontal padding in px', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.iconSpacing', //property path within the value object
                value: 10, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleIconSpacingChange, //onchange handler for html lightning-input tag
            },
            iconSpacingTablet: {
                key: 'iconSpacingTablet', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Icon Horizontal Spacing (in px) - Tablet', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Icon Horizontal padding in px', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.iconSpacingTablet', //property path within the value object
                value: 10, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleIconSpacingTabletChange, //onchange handler for html lightning-input tag
            },
            iconSpacingMobile: {
                key: 'iconSpacingMobile', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Icon Horizontal Spacing (in px) - Mobile', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Icon Horizontal padding in px', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.iconSpacingMobile', //property path within the value object
                value: 10, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleIconSpacingMobileChange, //onchange handler for html lightning-input tag
            },
            menuCSSClasses: {
                key: 'menuCSSClasses', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu CSS Classes', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'CSS Classes to allow targeting specific instance of menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.menuCSSClasses', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuCSSClassesChange, //onchange handler for html lightning-input tag
            },
            navContainerTextColor: {
                key: 'navContainerTextColor', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Text Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Color for menu item text in containers, like horizontal bar, hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navContainerTextColor', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerTextColorChange, //onchange handler for html lightning-input tag
            },
            navContainerAlsoApplyToSelectedState: {
                key: 'navContainerAlsoApplyToSelectedState', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Also Apply when Page URL Matches Menu Item URL', //label used for html lighting-input tag
                type: 'checkbox', //type used for html lightning-input tag
                help: 'When menu item is selected or current page url matches menu item', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navContainerAlsoApplyToSelectedState', //property path within the value object
                value: false, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerAlsoApplyToSelectedStateChange, //onchange handler for html lightning-input tag
            },
            navContainerTextColorHover: {
                key: 'navContainerTextColorHover', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Container Hover Text Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Hover color for menu item text in containers, like horizontal bar, hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navContainerTextColorHover', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerTextColorHoverChange, //onchange handler for html lightning-input tag
            },
            navContainerBackgroundColor: {
                key: 'navContainerBackgroundColor', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Background Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Background color for containers, like horizontal bar, hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navContainerBackgroundColor', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerBackgroundColorChange, //onchange handler for html lightning-input tag
            },
            navContainerBackgroundColorHover: {
                key: 'navContainerBackgroundColorHover', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Horizontal and Hamburger Top-level Menu Hover Background Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Background hover color for containers, like horizontal bar, hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navContainerBackgroundColorHover', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerBackgroundColorHoverChange, //onchange handler for html lightning-input tag
            },
            navContainerBorderStyle: {
                key: 'navContainerBorderStyle', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Style', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Border Style', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navContainerBorderStyle', //property path within the value object
                value: 'none', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerBorderStyleChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'None', value: 'none' },
                    { label: 'Dashed', value: 'dashed' },
                    { label: 'Dotted', value: 'dotted' },
                    { label: 'Double', value: 'double' },
                    { label: 'Groove', value: 'groove' },
                    { label: 'Ridge', value: 'ridge' },
                    { label: 'Solid', value: 'solid' }
                ],
            },
            navContainerBorderDirection: {
                key: 'navContainerBorderDirection', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Direction', //label used for html lighting-input tag
                type: 'checkboxgroup', //type used for html lightning-input tag
                help: 'Border Direction', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navContainerBorderDirection', //property path within the value object
                value: ['bottom'], //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerBorderDirectionChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Top', value: 'top' },
                    { label: 'Bottom', value: 'bottom' },
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' }
                ],
            },
            navContainerBorderColor: {
                key: 'navContainerBorderColor', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Border color for menu items not in containers, like horizontal bar or hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navContainerBorderColor', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerBorderColorChange, //onchange handler for html lightning-input tag
            },
            navContainerBorderWidth: {
                key: 'navContainerBorderWidth', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Width (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Border Width', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.navContainerBorderWidth', //property path within the value object
                value: 1, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavContainerBorderWidthChange, //onchange handler for html lightning-input tag
            },
            navAllLevelBorderRadius: {
                key: 'navAllLevelBorderRadius', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Radius (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Border Radius', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelBorderRadius', //property path within the value object
                value: 0, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelBorderRadiusChange, //onchange handler for html lightning-input tag
            },
            navTextColor: {
                key: 'navTextColor', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Text Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Text color for menu items not in containers, like horizontal bar, hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navTextColor', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavTextColorChange, //onchange handler for html lightning-input tag
            },
            navAlsoApplyToSelectedState: {
                key: 'navAlsoApplyToSelectedState', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Also Apply when Page URL Matches Menu Item URL', //label used for html lighting-input tag
                type: 'checkbox', //type used for html lightning-input tag
                help: 'When menu item is selected or current page url matches menu item', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navAlsoApplyToSelectedState', //property path within the value object
                value: false, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAlsoApplyToSelectedStateChange, //onchange handler for html lightning-input tag
            },
            navTextColorHover: {
                key: 'navTextColorHover', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Text Hover Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Text hover color for menu items not in containers, like horizontal bar, hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navTextColorHover', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavTextColorHoverChange, //onchange handler for html lightning-input tag
            },
            navBackgroundColor: {
                key: 'navBackgroundColor', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Background Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Background color for menu, not containers, like horizontal bar, hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navBackgroundColor', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavBackgroundColorChange, //onchange handler for html lightning-input tag
            },
            navBackgroundColorHover: {
                key: 'navBackgroundColorHover', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Background Hover Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Background hover color for menu, not containers, like horizontal bar, hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navBackgroundColorHover', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavBackgroundColorHoverChange, //onchange handler for html lightning-input tag
            },
            navBorderStyle: {
                key: 'navBorderStyle', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Style', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Border Style', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navBorderStyle', //property path within the value object
                value: 'none', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleNavBorderStyleChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'None', value: 'none' },
                    { label: 'Dashed', value: 'dashed' },
                    { label: 'Dotted', value: 'dotted' },
                    { label: 'Double', value: 'double' },
                    { label: 'Groove', value: 'groove' },
                    { label: 'Ridge', value: 'ridge' },
                    { label: 'Solid', value: 'solid' }
                ],
            },
            navBorderDirection: {
                key: 'navBorderDirection', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Direction', //label used for html lighting-input tag
                type: 'checkboxgroup', //type used for html lightning-input tag
                help: 'Border Direction', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navBorderDirection', //property path within the value object
                value: ['bottom'], //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleNavBorderDirectionChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Top', value: 'top' },
                    { label: 'Bottom', value: 'bottom' },
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' }
                ],
            },
            navBorderColor: {
                key: 'navBorderColor', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Border color for menu items not in containers, like horizontal bar or hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navBorderColor', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavBorderColorChange, //onchange handler for html lightning-input tag
            },
            navBorderWidth: {
                key: 'navBorderWidth', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Width (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Border Width', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.navBorderWidth', //property path within the value object
                value: 1, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavBorderWidthChange, //onchange handler for html lightning-input tag
            },
            navAllLevelBorderStyle: {
                key: 'navAllLevelBorderStyle', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Style', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Border Style', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelBorderStyle', //property path within the value object
                value: 'none', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelBorderStyleChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'None', value: 'none' },
                    { label: 'Dashed', value: 'dashed' },
                    { label: 'Dotted', value: 'dotted' },
                    { label: 'Double', value: 'double' },
                    { label: 'Groove', value: 'groove' },
                    { label: 'Ridge', value: 'ridge' },
                    { label: 'Solid', value: 'solid' }
                ],
            },
            navAllLevelBorderColor: {
                key: 'navAllLevelBorderColor', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Border color for menu items not in containers, like horizontal bar or hamburger menu', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelBorderColor', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelBorderColorChange, //onchange handler for html lightning-input tag
            },
            navAllLevelBorderWidth: {
                key: 'navAllLevelBorderWidth', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Border Width (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Border Width', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelBorderWidth', //property path within the value object
                value: 1, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelBorderWidthChange, //onchange handler for html lightning-input tag
            },
            navAllLevelShadowBoxType: {
                key: 'navAllLevelShadowBoxType', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Box Shadow Type', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Box Shadow Type', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelShadowBoxType', //property path within the value object
                value: 'none', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelShadowBoxTypeChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'None', value: 'none' },
                    { label: 'Outset', value: 'outset' },
                    { label: 'Inset', value: 'inset' }
                ],
            },
            navAllLevelShadowBoxColor: {
                key: 'navAllLevelShadowBoxColor', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Box Shadow Color', //label used for html lighting-input tag
                type: 'color', //type used for html lightning-input tag
                help: 'Box Shadow color', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelShadowBoxColor', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelShadowBoxColorChange, //onchange handler for html lightning-input tag
            },
            navAllLevelShadowBoxXOffset: {
                key: 'navAllLevelShadowBoxXOffset', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Box Shadow X Offset (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Box Shadow X Offset (in px)', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelShadowBoxXOffset', //property path within the value object
                value: 1, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelShadowBoxXOffsetChange, //onchange handler for html lightning-input tag
            },
            navAllLevelShadowBoxYOffset: {
                key: 'navAllLevelShadowBoxYOffset', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Box Shadow Y Offset (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Box Shadow Y Offset (in px)', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelShadowBoxYOffset', //property path within the value object
                value: 1, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelShadowBoxYOffsetChange, //onchange handler for html lightning-input tag
            },
            navAllLevelShadowBoxBlur: {
                key: 'navAllLevelShadowBoxBlur', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Box Shadow Blur Distance (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Box Shadow Blur distance (in px)', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelShadowBoxBlur', //property path within the value object
                value: 1, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelShadowBoxBlurChange, //onchange handler for html lightning-input tag
            },
            navAllLevelShadowBoxSpread: {
                key: 'navAllLevelShadowBoxSpread', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Box Shadow Spread Distance (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Box Shadow Spread distance (in px)', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.navAllLevelShadowBoxSpread', //property path within the value object
                value: 1, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleNavAllLevelShadowBoxSpreadChange, //onchange handler for html lightning-input tag
            }
            
    
    };


    @api
    get value() {
        return this._value;
    }

    set value(value) {
       
        let valuetmp = JSON.parse(value);
        let isValueUndefined = this._value === undefined;
        this._value = {};
        let hasValueChanged = false;

        for (let key in this.propInputs) {
            
            if(generalUtils.objectHasProperty(this.propInputs, key) && this.propInputs[key].doSetDefaultValue === true)
            {
                let tmpVal = generalUtils.getObjPropValue(valuetmp, this.propInputs[key].valuePath);
                if(generalUtils.isObjectEmpty(tmpVal))
                {
                    tmpVal = this.propInputs[key].value;
                    if(((this.propInputs[key].type === 'text' || this.propInputs[key].type === 'select' ||  this.propInputs[key].type === 'search') 
                        && !generalUtils.isStringEmpty(tmpVal)) 
                        ||
                        ((this.propInputs[key].type === 'toggle' || this.propInputs[key].type === 'checkbox' || this.propInputs[key].type === 'number' ) && !generalUtils.isObjectEmpty(tmpVal)))
                    {
                        valuetmp = generalUtils.setObjPropValue(valuetmp, this.propInputs[key].valuePath, tmpVal);
                        value = JSON.stringify(valuetmp);
                        hasValueChanged = true;
                    }
                    
                }
                if(this.propInputs[key].value !== tmpVal)
                {
                    if(this.propInputs[key].type === 'arrayObject' && key === 'urlSubMap')
                    {
                        this.urlSubMapTmp = generalUtils.cloneObjectWithJSON(tmpVal);
                        for(let i=0; i<this.urlSubMapTmp.length; i++)
                        {
                            this.urlSubMapTmp[i].id = generalUtils.generateUniqueIdentifier();
                        }
                        
                        if(!generalUtils.isObjectEmpty(this.urlSubMapTmp))
                        {
                            this.propInputs[key].buttonLabel = 'Edit';                
                        } 
                    }
                    this.propInputs[key].value = tmpVal;
                }
            }
        }

        this._value = value;
        if(hasValueChanged === true)
        {
            this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: value}}));
        }
    }

    get isHorizontalFirstLevelDesktop() {
        return this.propInputs?.menuModeDesktop?.value === 'horizontalFirstLevel';
    }

    get isHorizontalFirstLevelTablet() {
        return this.propInputs?.menuModeTablet?.value === 'horizontalFirstLevel';
    }

    get isHorizontalFirstLevelMobile() {
        return this.propInputs?.menuModeMobile?.value === 'horizontalFirstLevel';
    }

    get modalClass() {
        let classNames = 'slds-modal slds-modal_large slds-fade-in-open';
        return classNames;
    }

    get displayBackdrop() {
        return this.showModal;
    }

    getValueObj()
    {
        let tmpvalueObj = (generalUtils.isStringEmpty(this.value)) ? {} : JSON.parse(this.value);
        tmpvalueObj.general = (generalUtils.isObjectEmpty(tmpvalueObj.general) ) ? {} : tmpvalueObj.general;
        tmpvalueObj.styles = (generalUtils.isObjectEmpty(tmpvalueObj.styles) ) ? {} : tmpvalueObj.styles;
        tmpvalueObj.labels = (generalUtils.isObjectEmpty(tmpvalueObj.labels) ) ? {} : tmpvalueObj.labels;
        return tmpvalueObj;
    }

    displayInputErrorByDataKey(identifier, text)
    {
        componentUtils.displayLightningInputError(this, '[data-key="'+identifier+'"]', text);
    }
    
    connectedCallback() {

        this.loadMenus('');
        let styleEl = document.createElement('style');
        styleEl.classList.add('ccnavmenus-' + this.uuid);
        styleEl.innerHTML = propertyEditorWidthStyle;
        document.body.appendChild(styleEl);


    }

    disconnectedCallback() {
        let styleEl = document.body.querySelector('style.ccnavmenus-' + this.uuid);
        if(generalUtils.isObjectEmpty(styleEl) === false)
        {
            styleEl.remove();
        }
    }

    async loadMenus(searchTerm, forceShowMenuOptions = false) {
        try {

                // metrics for server call
                let params = {};
                params.searchTerm = searchTerm;
                const menus = await searchMenus(params);
                if (menus) {
                    let menuList = JSON.parse(menus);
                    if(menuList.menuList)
                    {
                        this.menuOptions = new Array();
                        for(let i=0; i<menuList.menuList.length;i++)
                        {
                            let tmpMenuOption = {};
                            tmpMenuOption.label = menuList.menuList[i].Name;
                            tmpMenuOption.value = menuList.menuList[i].Name;
                            this.menuOptions.push(tmpMenuOption);
                        }
                        //this.error = undefined;
                        this.propInputs.menuName.label = this.propInputs.menuName.label.replace(' - [searching...]','');
                        if(forceShowMenuOptions === true)
                        {
                            this.showMenuOptions = true;
                        }
                    }
                    else if(menuList.error)
                    {
                        
                    }
                }  

        } catch (e) {
            console.log(e+'');
        }
    
    }


    handleMenuNameChange(e) {

        window.clearTimeout(this.propInputs.menuName.textDelayTimeout);

        this.propInputs.menuName.label = this.propInputs.menuName.label.replace(' - [searching...]','');
        if(this.propInputs.menuName.label.indexOf(' - [searching...]') < 0)
        {
            this.propInputs.menuName.label += ' - [searching...]';
        }
        
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.menuName.textDelayTimeout = setTimeout(() => {
            
            let inputvalue = e.detail.value.trim();
            
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                this.displayInputErrorByDataKey('menuName', '');
            }

            
            this.loadMenus(inputvalue);


            /*let tmpvalueObj = this.getValueObj();
            tmpvalueObj.general.menuName = inputvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));*/
            

        }, typeDelay);

    }


    handleMenuNameFocus(e) {
        this.displayInputErrorByDataKey('menuName', '');
        let inputvalue = e.currentTarget.value.trim();
        this.loadMenus(inputvalue, true);
        
    }

    handleMenuNameBlur(e) {
        this.showMenuOptions = false;
        let inputvalue = e.currentTarget.value.trim();
        this.displayInputErrorByDataKey('menuName', '');
        if(generalUtils.isStringEmpty(inputvalue))
        {
            this.displayInputErrorByDataKey('menuName','Please enter a value for the Menu Name.');
        }
        else 
        {
            this.propInputs.menuName.value = inputvalue;
            let tmpvalueObj = this.getValueObj();
            tmpvalueObj.general.menuName = inputvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        }
        
    }

    handleMenuOptionClick(e) {
        let selectedValue = e.currentTarget.dataset.value;
        let tmpvalueObj = this.getValueObj();
        this.propInputs.menuName.value = selectedValue;
        let menuNameEl = this.template.querySelector('[data-key="menuName"]');
        if(!generalUtils.isObjectEmpty(menuNameEl))
        {
            menuNameEl.focus();
        }
        
        this.showMenuOptions = false;
    }

    handleCloseIconClick(e) {
        this.showMenuOptions = false;
    }

    handleLanguageFilterChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.languageFilter.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.languageFilter = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleMenuTypeDesktopChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuTypeDesktop.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.menuTypeDesktop = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleMenuModeDesktopChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuModeDesktop.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.menuModeDesktop = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleMenuTypeTabletChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuTypeTablet.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.menuTypeTablet = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleMenuModeTabletChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuModeTablet.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.menuModeTablet = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleMenuTypeMobileChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuTypeMobile.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.menuTypeMobile = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleMenuModeMobileChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuModeMobile.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.menuModeMobile = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleCacheNameChange(e) {

        window.clearTimeout(this.propInputs.cacheName.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.cacheName.textDelayTimeout = setTimeout(() => {
            
            let inputvalue = e.detail.value.trim();
            this.propInputs.cacheName.value = inputvalue;
            this.validateCacheValues();


        }, typeDelay);
        
    }

    handleCacheKeyChange(e) {

        window.clearTimeout(this.propInputs.cacheKey.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.cacheKey.textDelayTimeout = setTimeout(() => {

            let inputvalue = e.detail.value.trim();
            this.propInputs.cacheKey.value = inputvalue;
            this.validateCacheValues();


        }, typeDelay);
        
    }

    handleCacheEnabledChange(e) {
        this.propInputs.cacheEnabled.value = e.detail.checked;
        this.validateCacheValues();
    }

    validateCacheValues() {

        this.displayInputErrorByDataKey('cacheName', '');
        this.displayInputErrorByDataKey('cacheKey', '');

        let isCacheNameValid = true, isCacheKeyValid = true, isCacheEnabledValid = true;
        let cacheNameError = '';
        let cacheKeyError = '';
        let cacheEnabledError = '';

        let cacheEnabled = this.propInputs.cacheEnabled.value;
        let cacheName = this.propInputs.cacheName.value;
        let cacheKey = this.propInputs.cacheKey.value;

        if(cacheEnabled === true)
        {
            if(generalUtils.isStringEmpty(cacheName) === true)
            {
                cacheNameError = 'Cache Name is required.';
                isCacheNameValid = false;
                isCacheEnabledValid = false;
            }

            if(generalUtils.isStringEmpty(cacheKey) === true)
            {
                cacheKeyError = 'Cache Key is required.';
                isCacheKeyValid = false;
                isCacheEnabledValid = false;
            }
        }
        else 
        {
            this.displayInputErrorByDataKey('cacheName', '');
            this.displayInputErrorByDataKey('cacheKey', '');
        }

        if(generalUtils.isStringEmpty(cacheName) === false && generalUtils.isAlphaNumeric(cacheName) === false)
        {
            cacheNameError = 'Cache Name must be alphanumeric only.';
            isCacheNameValid = false;
        }

        if(generalUtils.isStringEmpty(cacheKey) === false && generalUtils.isAlphaNumeric(cacheKey) === false)
        {
            cacheKeyError = 'Cache Key must be alphanumeric only.';
            isCacheKeyValid = false;
        }

        console.log('isCacheNameValid: ',isCacheNameValid);
        console.log('isCacheKeyValid: ',isCacheKeyValid);
        console.log('isCacheEnabledValid: ',isCacheEnabledValid);

        if(isCacheNameValid === true && isCacheKeyValid === true && isCacheEnabledValid === true)
        {

            let tmpvalueObj = this.getValueObj();
            tmpvalueObj.general.cacheName = cacheName;
            tmpvalueObj.general.cacheKey = cacheKey;
            tmpvalueObj.general.cacheEnabled = cacheEnabled;

            this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

        }
        else 
        {
            
            if(isCacheNameValid === false)
            {
                this.displayInputErrorByDataKey('cacheName', cacheNameError);
            }

            if(isCacheKeyValid === false)
            {
                this.displayInputErrorByDataKey('cacheKey', cacheKeyError);
            }


        }

        console.log('cacheEnabled: ',cacheEnabled);
        console.log('cacheName: ',cacheName);
        console.log('cacheKey: ',cacheKey);

    }

    handleDebugModeChange(e) {
        
        this.propInputs.debugMode.value = e.detail.checked;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.debugMode = this.propInputs.debugMode.value;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

    }

    handleUrlSubMapClick(e) {
        this.showModal = true;
    }

    handleCloseModal(e) {
        this.showModal = false;
    }

    handleAddUrlSubMap(e) {

        this.urlSubMapTmp = (generalUtils.isObjectEmpty(this.urlSubMapTmp)) ? [] : this.urlSubMapTmp;
        let tmpRow = {};
            tmpRow.id = generalUtils.generateUniqueIdentifier();
            tmpRow.replaceThis = '';
            tmpRow.replaceWith = '';
    
        this.urlSubMapTmp.push(tmpRow);
    }

    handleDeleteMapping(e) {
        let id = e.currentTarget.dataset.id;

        this.urlSubMapTmp = this.urlSubMapTmp.filter( item => item.id !== id);
        this.urlSubMapTmp = (this.urlSubMapTmp.length > 0) ? this.urlSubMapTmp : undefined ;

    }

    handleClearMap(e) {
        this.urlSubMapTmp = undefined;
    }

    handleSaveUrlSubMap(e) {

        
        let subMap = {};
        let mapElList = this.template.querySelectorAll('[data-key="replaceThis"]');
        for(let i=0; i<mapElList.length; i++)
        {
            let mapEl = mapElList[i];
            if(!generalUtils.isStringEmpty(mapEl.value))
            { 
                subMap[mapEl.dataset.id] = {};
                subMap[mapEl.dataset.id].replaceThis = mapEl.value;
            }
        }

        let mapElList2 = this.template.querySelectorAll('[data-key="replaceWith"]');
        for(let i=0; i<mapElList2.length; i++)
        {
            let mapEl = mapElList2[i];
            if(Object.prototype.hasOwnProperty.call(subMap, mapEl.dataset.id) )
            {   
                subMap[mapEl.dataset.id].replaceWith = mapEl.value;
            }
        }


        let urlSubMapTmpClone;
        if(!generalUtils.isObjectEmpty(this.urlSubMapTmp))
        {
            for(let i=0; i<this.urlSubMapTmp.length; i++)
            {
                if(!generalUtils.isObjectEmpty(subMap[this.urlSubMapTmp[i].id]))
                {
                    this.urlSubMapTmp[i].replaceThis = subMap[this.urlSubMapTmp[i].id].replaceThis;
                    this.urlSubMapTmp[i].replaceWith = subMap[this.urlSubMapTmp[i].id].replaceWith;
                }
            }

            this.urlSubMapTmp = this.urlSubMapTmp.filter( item => !generalUtils.isStringEmpty(item.replaceThis));
            this.urlSubMapTmp = (this.urlSubMapTmp.length > 0) ? this.urlSubMapTmp : undefined ;
            
            urlSubMapTmpClone = generalUtils.cloneObjectWithJSON(this.urlSubMapTmp);
            for(let i=0; i<urlSubMapTmpClone.length; i++)
            {
                delete urlSubMapTmpClone[i].id;
            }

        }
        this.propInputs.urlSubMap.buttonLabel = (generalUtils.isObjectEmpty(urlSubMapTmpClone)) ? 'Create' : 'Edit';       
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.urlSubMap = urlSubMapTmpClone;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

        this.showModal = false;
        
    }

    handleOverflowLabelChange(e) {

        window.clearTimeout(this.propInputs.overflowLabel.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.overflowLabel.textDelayTimeout = setTimeout(() => {

            let inputvalue = e.detail.value.trim();
            this.propInputs.overflowLabel.value = inputvalue;

            let tmpvalueObj = this.getValueObj();
            tmpvalueObj.labels.overflowLabel = inputvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
                {detail: {value: JSON.stringify(tmpvalueObj)}}));

        }, typeDelay);
        
    }

    handleDrilldownBackLabelChange(e) {

        window.clearTimeout(this.propInputs.drilldownBackLabel.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.drilldownBackLabel.textDelayTimeout = setTimeout(() => {

            let inputvalue = e.detail.value.trim();
            this.propInputs.drilldownBackLabel.value = inputvalue;

            let tmpvalueObj = this.getValueObj();
            tmpvalueObj.labels.drilldownBackLabel = inputvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
                {detail: {value: JSON.stringify(tmpvalueObj)}}));

        }, typeDelay);
        
    }

    handleDrilldownGotoLabelChange(e) {

        window.clearTimeout(this.propInputs.drilldownGotoLabel.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.drilldownGotoLabel.textDelayTimeout = setTimeout(() => {

            let inputvalue = e.detail.value.trim();
            this.propInputs.drilldownGotoLabel.value = inputvalue;

            let tmpvalueObj = this.getValueObj();
            tmpvalueObj.labels.drilldownGotoLabel = inputvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
                {detail: {value: JSON.stringify(tmpvalueObj)}}));

        }, typeDelay);
        
    }

    handleMenuAlignmentChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuAlignment.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.menuAlignment = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleMenuAlignmentTabletChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuAlignmentTablet.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.menuAlignmentTablet = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleMenuAlignmentMobileChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.menuAlignmentMobile.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.menuAlignmentMobile = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleHideHamburgerMenuAnimationChange(e) {
        let inputValue = e.detail.checked;
        this.propInputs.hideHamburgerMenuAnimation.value = inputValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.hideHamburgerMenuAnimation = inputValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

    }
    
    handleDropdownOnHoverDesktopChange(e) {
        let inputValue = e.detail.checked;
        this.propInputs.dropdownOnHoverDesktop.value = inputValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.dropdownOnHoverDesktop = inputValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

    }

    handleDropdownOnHoverTabletChange(e) {
        let inputValue = e.detail.checked;
        this.propInputs.dropdownOnHoverTablet.value = inputValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.dropdownOnHoverTablet = inputValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

    }

    handleDropdownOnHoverMobileChange(e) {
        let inputValue = e.detail.checked;
        this.propInputs.dropdownOnHoverMobile.value = inputValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.general.dropdownOnHoverMobile = inputValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

    }

    handleOverrideTextCaseChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.overrideTextCase.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.overrideTextCase = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }
    
    handleSldsIconSizeChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.sldsIconSize.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.sldsIconSize = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleSldsIconSizeTabletChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.sldsIconSizeTablet.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.sldsIconSizeTablet = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleSldsIconSizeMobileChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.sldsIconSizeMobile.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.sldsIconSizeMobile = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleOverrideFontFamilyChange(e) {

        window.clearTimeout(this.propInputs.overrideFontFamily.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.overrideFontFamily.textDelayTimeout = setTimeout(() => {

            let inputvalue = e.detail.value.trim();
            this.propInputs.overrideFontFamily.value = inputvalue;

            let tmpvalueObj = this.getValueObj();
            tmpvalueObj.styles.overrideFontFamily = inputvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
                {detail: {value: JSON.stringify(tmpvalueObj)}}));

        }, typeDelay);
        
    }

    handleMenuCSSClassesChange(e) {

        window.clearTimeout(this.propInputs.menuCSSClasses.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.menuCSSClasses.textDelayTimeout = setTimeout(() => {

            let inputvalue = e.detail.value.trim();
            this.propInputs.menuCSSClasses.value = inputvalue;

            let tmpvalueObj = this.getValueObj();
            tmpvalueObj.styles.menuCSSClasses = inputvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
                {detail: {value: JSON.stringify(tmpvalueObj)}}));

        }, typeDelay);
        
    }

    handleMenuItemVerticalPaddingChange(e) {

        window.clearTimeout(this.propInputs.menuItemVerticalPadding.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.menuItemVerticalPadding.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('menuItemVerticalPadding', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.menuItemVerticalPadding.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.menuItemVerticalPadding = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('menuItemVerticalPadding', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('menuItemVerticalPadding', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleMenuItemVerticalPaddingTabletChange(e) {

        window.clearTimeout(this.propInputs.menuItemVerticalPaddingTablet.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.menuItemVerticalPaddingTablet.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('menuItemVerticalPaddingTablet', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.menuItemVerticalPaddingTablet.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.menuItemVerticalPaddingTablet = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('menuItemVerticalPaddingTablet', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('menuItemVerticalPaddingTablet', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleMenuItemVerticalPaddingMobileChange(e) {

        window.clearTimeout(this.propInputs.menuItemVerticalPaddingMobile.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.menuItemVerticalPaddingMobile.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('menuItemVerticalPaddingMobile', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.menuItemVerticalPaddingMobile.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.menuItemVerticalPaddingMobile = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('menuItemVerticalPaddingMobile', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('menuItemVerticalPaddingMobile', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleOverrideFontSizeChange(e) {

        window.clearTimeout(this.propInputs.overrideFontSize.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.overrideFontSize.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('overrideFontSize', '');
            let inputvalue = e.detail.value;
           
            try {

                inputvalue = (generalUtils.isStringEmpty(inputvalue) === true) ? undefined : parseInt(inputvalue);
                this.propInputs.overrideFontSize.value = inputvalue;

                let tmpvalueObj = this.getValueObj();
                tmpvalueObj.styles.overrideFontSize = inputvalue;

                this.dispatchEvent(new CustomEvent("valuechange", 
                    {detail: {value: JSON.stringify(tmpvalueObj)}}));

            } catch(e) {
                this.displayInputErrorByDataKey('overrideFontSize', 'Invalid number provided.');
            }
            


        }, typeDelay);
        
    }

    handleOverrideFontSizeTabletChange(e) {

        window.clearTimeout(this.propInputs.overrideFontSizeTablet.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.overrideFontSizeTablet.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('overrideFontSizeTablet', '');
            let inputvalue = e.detail.value;
           
            try {

                inputvalue = (generalUtils.isStringEmpty(inputvalue) === true) ? undefined : parseInt(inputvalue);
                this.propInputs.overrideFontSizeTablet.value = inputvalue;

                let tmpvalueObj = this.getValueObj();
                tmpvalueObj.styles.overrideFontSizeTablet = inputvalue;

                this.dispatchEvent(new CustomEvent("valuechange", 
                    {detail: {value: JSON.stringify(tmpvalueObj)}}));

            } catch(e) {
                this.displayInputErrorByDataKey('overrideFontSizeTablet', 'Invalid number provided.');
            }
            


        }, typeDelay);
        
    }

    handleOverrideFontSizeMobileChange(e) {

        window.clearTimeout(this.propInputs.overrideFontSizeMobile.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.overrideFontSizeMobile.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('overrideFontSizeMobile', '');
            let inputvalue = e.detail.value;
           
            try {

                inputvalue = (generalUtils.isStringEmpty(inputvalue) === true) ? undefined : parseInt(inputvalue);
                this.propInputs.overrideFontSizeMobile.value = inputvalue;

                let tmpvalueObj = this.getValueObj();
                tmpvalueObj.styles.overrideFontSizeMobile = inputvalue;

                this.dispatchEvent(new CustomEvent("valuechange", 
                    {detail: {value: JSON.stringify(tmpvalueObj)}}));

            } catch(e) {
                this.displayInputErrorByDataKey('overrideFontSizeMobile', 'Invalid number provided.');
            }
            


        }, typeDelay);
        
    }

    handleTopLevelItemSpacingChange(e) {

        window.clearTimeout(this.propInputs.topLevelItemSpacing.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.topLevelItemSpacing.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('topLevelItemSpacing', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.topLevelItemSpacing.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.topLevelItemSpacing = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('topLevelItemSpacing', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('topLevelItemSpacing', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconSpacingChange(e) {

        window.clearTimeout(this.propInputs.iconSpacing.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconSpacing.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconSpacing', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconSpacing.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.iconSpacing = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconSpacing', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconSpacing', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconSpacingTabletChange(e) {

        window.clearTimeout(this.propInputs.iconSpacingTablet.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconSpacingTablet.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconSpacingTablet', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconSpacingTablet.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.iconSpacingTablet = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconSpacingTablet', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconSpacingTablet', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconSpacingMobileChange(e) {

        window.clearTimeout(this.propInputs.iconSpacingMobile.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconSpacingMobile.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconSpacingMobile', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconSpacingMobile.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.iconSpacingMobile = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconSpacingMobile', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconSpacingMobile', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavContainerTextColorChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navContainerTextColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavContainerTextColorHoverChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navContainerTextColorHover = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavContainerBackgroundColorChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navContainerBackgroundColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavContainerBackgroundColorHoverChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navContainerBackgroundColorHover = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavTextColorChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navTextColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavTextColorHoverChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navTextColorHover = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavBackgroundColorChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navBackgroundColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavBackgroundColorHoverChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navBackgroundColorHover = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavContainerAlsoApplyToSelectedStateChange(e) {

        let inputvalue = e.detail.checked;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navContainerAlsoApplyToSelectedState = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleNavAlsoApplyToSelectedStateChange(e) {

        let inputvalue = e.detail.checked;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navAlsoApplyToSelectedState = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

    }

    handleNavContainerBorderStyleChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.navContainerBorderStyle.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navContainerBorderStyle = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleNavContainerBorderColorChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navContainerBorderColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavContainerBorderWidthChange(e) {

        window.clearTimeout(this.propInputs.navContainerBorderWidth.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navContainerBorderWidth.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('navContainerBorderWidth', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navContainerBorderWidth.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navContainerBorderWidth = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('navContainerBorderWidth', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('navContainerBorderWidth', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavAllLevelBorderRadiusChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelBorderRadius.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelBorderRadius.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('navAllLevelBorderRadius', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelBorderRadius.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelBorderRadius = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('navAllLevelBorderRadius', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('navAllLevelBorderRadius', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavContainerBorderDirectionChange(e) {

        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navContainerBorderDirection = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

    }


    handleNavBorderStyleChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.navBorderStyle.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navBorderStyle = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleNavBorderColorChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navBorderColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavBorderWidthChange(e) {

        window.clearTimeout(this.propInputs.navBorderWidth.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navBorderWidth.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('navBorderWidth', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navBorderWidth.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navBorderWidth = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('navBorderWidth', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('navBorderWidth', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavBorderDirectionChange(e) {

        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navBorderDirection = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));

    }

    handleNavAllLevelBorderStyleChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.navAllLevelBorderStyle.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navAllLevelBorderStyle = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleNavAllLevelBorderColorChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navAllLevelBorderColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavAllLevelBorderWidthChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelBorderWidth.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelBorderWidth.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('navAllLevelBorderWidth', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelBorderWidth.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelBorderWidth = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('navAllLevelBorderWidth', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('navAllLevelBorderWidth', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavAllLevelShadowBoxTypeChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.navAllLevelShadowBoxType.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navAllLevelShadowBoxType = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleNavAllLevelShadowBoxColorChange(e) {
        
        let inputvalue = e.detail.value;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.navAllLevelShadowBoxColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleNavAllLevelShadowBoxXOffsetChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelShadowBoxXOffset.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelShadowBoxXOffset.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('navAllLevelShadowBoxXOffset', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelShadowBoxXOffset.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelShadowBoxXOffset = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('navAllLevelShadowBoxXOffset', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('navAllLevelShadowBoxXOffset', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavAllLevelShadowBoxYOffsetChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelShadowBoxYOffset.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelShadowBoxYOffset.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('navAllLevelShadowBoxYOffset', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelShadowBoxYOffset.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelShadowBoxYOffset = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('navAllLevelShadowBoxYOffset', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('navAllLevelShadowBoxYOffset', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavAllLevelShadowBoxBlurChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelShadowBoxBlur.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelShadowBoxBlur.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('navAllLevelShadowBoxBlur', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelShadowBoxBlur.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelShadowBoxBlur = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('navAllLevelShadowBoxBlur', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('navAllLevelShadowBoxBlur', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavAllLevelShadowBoxSpreadChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelShadowBoxSpread.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelShadowBoxSpread.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('navAllLevelShadowBoxSpread', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelShadowBoxSpread.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelShadowBoxSpread = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('navAllLevelShadowBoxSpread', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('navAllLevelShadowBoxSpread', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleExportConfig(e)
    {
        this.exportError = undefined;
        let tmpvalueObj = this.getValueObj();
        if(!generalUtils.isStringEmpty(tmpvalueObj?.general?.menuName))
        {
            generalUtils.downloadTextFile(tmpvalueObj.general.menuName + '-config.json', JSON.stringify(tmpvalueObj, undefined, 4));
        }
        else
        {
            this.exportError = 'Menu Name is required.';
        }
    }

    openImportModal() 
    {
        this.importModalOpen = true;
    }
    
    closeImportModal() 
    {
        this.importModalOpen = false;
    }


    handleImportConfig(e)
    {
        this.importError = undefined;
        let fileElement = componentUtils.getElement(this, 'input[data-name="importConfigFile"]');

        generalUtils.readTextFile(fileElement).then(
            (result) => {
                let JSONConfigImportString = result;
                console.log(JSONConfigImportString);
                let JSONConfigImport;
                try {
                    JSONConfigImport = JSON.parse(JSONConfigImportString);
                } catch(err) {
                    this.importError = 'Error parsing JSON: ' + err;
                }

                try {

                    if(!generalUtils.isObjectEmpty(JSONConfigImport))
                    {
                        let tmpvalueObj = this.getValueObj();
                        let hasValueChanged = false;
                        for (let key in this.propInputs) 
                        {
                            if(generalUtils.objectHasProperty(this.propInputs, key))
                            {
                                let tmpVal = generalUtils.getObjPropValue(JSONConfigImport, this.propInputs[key].valuePath);
                                if(!generalUtils.isObjectEmpty(tmpVal))
                                {
                                    tmpvalueObj = generalUtils.setObjPropValue(tmpvalueObj, this.propInputs[key].valuePath, tmpVal);
                                    hasValueChanged = true;
                                }
                            }
                        }

                        if(hasValueChanged)
                        {
                            this.closeImportModal();
                            
                            this.dispatchEvent(new CustomEvent("valuechange", 
                            {detail: {value: JSON.stringify(tmpvalueObj)}}));
                        }
                        else
                        {
                            this.importError = 'No values to import found. ';
                        }

                    }
                } catch(err2) {
                    this.importError = 'Error during import: ' + err2;
                }
            },
            (error) => {
                this.importError = error + '';
            }
        );
            
                
        
    }

}