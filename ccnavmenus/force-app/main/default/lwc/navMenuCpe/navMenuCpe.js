import { LightningElement, track, api, wire } from 'lwc';
import searchMenus from '@salesforce/apex/menusManagerController.searchMenus';

const typeDelay = 1000;
const defaultCSSClasses = 'slds-m-bottom_medium';

export default class NavMenuCpe extends LightningElement {

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
                    { label: 'Mega (not recommended)', value: 'mega' }
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
                    { label: 'Apply Type to All Levels', value: 'allLevels' },
                    { label: 'Behind Hamburger Toggle', value: 'hamburger' },
                    { label: 'Hidden', value: 'hidden'}
                ],
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
                label: 'Menu Alignment', //label used for html lighting-input tag
                type: 'select', //type used for html lightning-input tag
                help: 'Menu Alignment', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.menuAlignment', //property path within the value object
                value: 'center', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
                changeHandler: this.handleMenuAlignmentChange, //onchange handler for html lightning-input tag
                options:[
                    { label: 'Center', value: 'center' },
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' }
                ],
            },
            menuItemVerticalPadding: {
                key: 'menuItemVerticalPadding', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Menu Item Vertical Padding (in px)', //label used for html lighting-input tag
                type: 'number', //type used for html lightning-input tag
                help: 'Top / Bottom total padding for all menu items', //tooltip / help text used for html lightning-input tag
                required: true, //required used for html lightning-input tag
                valuePath: 'styles.menuItemVerticalPadding', //property path within the value object
                value: 16, //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleMenuItemVerticalPaddingChange, //onchange handler for html lightning-input tag
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
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
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
                label: 'Also Apply to Selected State', //label used for html lighting-input tag
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
                label: 'Also Apply to Selected State', //label used for html lighting-input tag
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
            
            if(Object.prototype.hasOwnProperty.call(this.propInputs, key) && this.propInputs[key].doSetDefaultValue === true)
            {
                let tmpVal = this.getObjPropValue(valuetmp, this.propInputs[key].valuePath);
                if(this.isObjectEmpty(tmpVal))
                {
                    tmpVal = this.propInputs[key].value;
                    if(((this.propInputs[key].type === 'text' || this.propInputs[key].type === 'select' ||  this.propInputs[key].type === 'search') 
                        && !this.isStringEmpty(tmpVal)) 
                        ||
                        ((this.propInputs[key].type === 'toggle' || this.propInputs[key].type === 'checkbox' || this.propInputs[key].type === 'number' ) && !this.isObjectEmpty(tmpVal)))
                    {
                        valuetmp = this.setObjPropValue(valuetmp, this.propInputs[key].valuePath, tmpVal);
                        value = JSON.stringify(valuetmp);
                        hasValueChanged = true;
                    }
                    
                }
                if(this.propInputs[key].value !== tmpVal)
                {
                    if(this.propInputs[key].type === 'arrayObject' && key === 'urlSubMap')
                    {
                        this.urlSubMapTmp = JSON.parse(JSON.stringify(tmpVal));
                        for(let i=0; i<this.urlSubMapTmp.length; i++)
                        {
                            this.urlSubMapTmp[i].id = crypto.randomUUID();
                        }
                        
                        if(!this.isObjectEmpty(this.urlSubMapTmp))
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

    get modalClass() {
        let classNames = 'slds-modal slds-modal_large slds-fade-in-open';
        return classNames;
    }

    get displayBackdrop() {
        return this.showModal;
    }

    getValueObj()
    {
        let tmpvalueObj = (this.isStringEmpty(this.value)) ? {} : JSON.parse(this.value);
        tmpvalueObj.general = (this.isObjectEmpty(tmpvalueObj.general) ) ? {} : tmpvalueObj.general;
        tmpvalueObj.styles = (this.isObjectEmpty(tmpvalueObj.styles) ) ? {} : tmpvalueObj.styles;
        tmpvalueObj.labels = (this.isObjectEmpty(tmpvalueObj.labels) ) ? {} : tmpvalueObj.labels;
        return tmpvalueObj;
    }

    isObjectEmpty(param)
    {   
        return (param === undefined || param === null);
    }

    isStringEmpty(param)
    {   
        return (typeof param === 'string') ? (param === undefined || param === null || param.trim() === '') : this.isObjectEmpty(param);
    }

    displayInputError(identifier, text)
    {

        let inputCmp = this.template.querySelector('[data-key="'+identifier+'"]');
        if(inputCmp !== undefined && inputCmp !== null)
        {
            inputCmp.setCustomValidity('');
            inputCmp.reportValidity();

            inputCmp.setCustomValidity(text);
            inputCmp.reportValidity();
        }
    }

    getObjPropValue(data, keys) {
        // If plain string, split it to array
        if(typeof keys === 'string') {
          keys = keys.split('.')
        }
        
        // Get key
        let key = keys.shift();
        
        // Get data for that key
        let keyData = data[key];
        
        // Check if there is data
        if(this.isObjectEmpty(keyData)) {
          return undefined;
        }
         
        // Check if we reached the end of query string
        if(keys.length === 0){
          return keyData;
        }
        
        // recusrive call!
        return this.getObjPropValue(Object.assign({}, keyData), keys);
    }

    setObjPropValue(data, path, value) {
        let schema = data;
        let pList = path.split('.');
        let len = pList.length;
        for(let i = 0; i < len-1; i++) {
            let elem = pList[i];
            if( !schema[elem] ) schema[elem] = {}
            schema = schema[elem];
        }

        schema[pList[len-1]] = value;
        return data;
    }
    
    connectedCallback() {

        this.loadMenus('');

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
            
            if(!this.isStringEmpty(inputvalue))
            {
                this.displayInputError('menuName', '');
            }

            
            this.loadMenus(inputvalue);


            /*let tmpvalueObj = this.getValueObj();
            tmpvalueObj.general.menuName = inputvalue;

            this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));*/
            

        }, typeDelay);

    }


    handleMenuNameFocus(e) {
        this.displayInputError('menuName', '');
        let inputvalue = e.currentTarget.value.trim();
        this.loadMenus(inputvalue, true);
        
    }

    handleMenuNameBlur(e) {
        this.showMenuOptions = false;
        let inputvalue = e.currentTarget.value.trim();
        this.displayInputError('menuName', '');
        if(this.isStringEmpty(inputvalue))
        {
            this.displayInputError('menuName','Please enter a value for the Menu Name.');
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
        if(!this.isObjectEmpty(menuNameEl))
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

        this.displayInputError('cacheName', '');
        this.displayInputError('cacheKey', '');

        let isCacheNameValid = true, isCacheKeyValid = true, isCacheEnabledValid = true;
        let cacheNameError = '';
        let cacheKeyError = '';
        let cacheEnabledError = '';

        let cacheEnabled = this.propInputs.cacheEnabled.value;
        let cacheName = this.propInputs.cacheName.value;
        let cacheKey = this.propInputs.cacheKey.value;

        let alphanumericExp = /^([0-9]|[a-z])+([0-9a-z]*)$/i;

        if(cacheEnabled === true)
        {
            if((cacheName !== undefined && cacheName !== null && cacheName.trim() !== '') === false)
            {
                cacheNameError = 'Cache Name is required.';
                isCacheNameValid = false;
                isCacheEnabledValid = false;
            }

            if((cacheKey !== undefined && cacheKey !== null && cacheKey.trim() !== '') === false)
            {
                cacheKeyError = 'Cache Key is required.';
                isCacheKeyValid = false;
                isCacheEnabledValid = false;
            }
        }
        else 
        {
            this.displayInputError('cacheName', '');
            this.displayInputError('cacheKey', '');
        }

        if(cacheName !== undefined && cacheName !== null && cacheName.trim() !== '' && cacheName.match(alphanumericExp) === null)
        {
            cacheNameError = 'Cache Name must be alphanumeric only.';
            isCacheNameValid = false;
        }

        if(cacheKey !== undefined && cacheKey !== null && cacheKey.trim() !== '' && cacheKey.match(alphanumericExp) === null)
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
                this.displayInputError('cacheName', cacheNameError);
            }

            if(isCacheKeyValid === false)
            {
                this.displayInputError('cacheKey', cacheKeyError);
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

        this.urlSubMapTmp = (this.isObjectEmpty(this.urlSubMapTmp)) ? [] : this.urlSubMapTmp;
        let tmpRow = {};
            tmpRow.id = crypto.randomUUID();
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
            if(!this.isStringEmpty(mapEl.value))
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
        if(!this.isObjectEmpty(this.urlSubMapTmp))
        {
            for(let i=0; i<this.urlSubMapTmp.length; i++)
            {
                if(!this.isObjectEmpty(subMap[this.urlSubMapTmp[i].id]))
                {
                    this.urlSubMapTmp[i].replaceThis = subMap[this.urlSubMapTmp[i].id].replaceThis;
                    this.urlSubMapTmp[i].replaceWith = subMap[this.urlSubMapTmp[i].id].replaceWith;
                }
            }

            this.urlSubMapTmp = this.urlSubMapTmp.filter( item => !this.isStringEmpty(item.replaceThis));
            this.urlSubMapTmp = (this.urlSubMapTmp.length > 0) ? this.urlSubMapTmp : undefined ;
            
            urlSubMapTmpClone = JSON.parse(JSON.stringify(this.urlSubMapTmp));
            for(let i=0; i<urlSubMapTmpClone.length; i++)
            {
                delete urlSubMapTmpClone[i].id;
            }

        }
        this.propInputs.urlSubMap.buttonLabel = (this.isObjectEmpty(urlSubMapTmpClone)) ? 'Create' : 'Edit';       
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

    handleHideHamburgerMenuAnimationChange(e) {
        let inputValue = e.detail.checked;
        this.propInputs.hideHamburgerMenuAnimation.value = inputValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.styles.hideHamburgerMenuAnimation = inputValue;

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
            
            this.displayInputError('menuItemVerticalPadding', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.menuItemVerticalPadding.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.menuItemVerticalPadding = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('menuItemVerticalPadding', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('menuItemVerticalPadding', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleTopLevelItemSpacingChange(e) {

        window.clearTimeout(this.propInputs.topLevelItemSpacing.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.topLevelItemSpacing.textDelayTimeout = setTimeout(() => {
            
            this.displayInputError('topLevelItemSpacing', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.topLevelItemSpacing.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.topLevelItemSpacing = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('topLevelItemSpacing', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('topLevelItemSpacing', 'Invalid number provided.');
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
            
            this.displayInputError('navContainerBorderWidth', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navContainerBorderWidth.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navContainerBorderWidth = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('navContainerBorderWidth', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('navContainerBorderWidth', 'Invalid number provided.');
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
            
            this.displayInputError('navBorderWidth', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navBorderWidth.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navBorderWidth = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('navBorderWidth', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('navBorderWidth', 'Invalid number provided.');
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
            
            this.displayInputError('navAllLevelBorderWidth', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelBorderWidth.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelBorderWidth = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('navAllLevelBorderWidth', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('navAllLevelBorderWidth', 'Invalid number provided.');
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
            
            this.displayInputError('navAllLevelShadowBoxXOffset', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelShadowBoxXOffset.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelShadowBoxXOffset = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('navAllLevelShadowBoxXOffset', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('navAllLevelShadowBoxXOffset', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavAllLevelShadowBoxYOffsetChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelShadowBoxYOffset.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelShadowBoxYOffset.textDelayTimeout = setTimeout(() => {
            
            this.displayInputError('navAllLevelShadowBoxYOffset', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelShadowBoxYOffset.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelShadowBoxYOffset = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('navAllLevelShadowBoxYOffset', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('navAllLevelShadowBoxYOffset', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavAllLevelShadowBoxBlurChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelShadowBoxBlur.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelShadowBoxBlur.textDelayTimeout = setTimeout(() => {
            
            this.displayInputError('navAllLevelShadowBoxBlur', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelShadowBoxBlur.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelShadowBoxBlur = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('navAllLevelShadowBoxBlur', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('navAllLevelShadowBoxBlur', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleNavAllLevelShadowBoxSpreadChange(e) {

        window.clearTimeout(this.propInputs.navAllLevelShadowBoxSpread.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.navAllLevelShadowBoxSpread.textDelayTimeout = setTimeout(() => {
            
            this.displayInputError('navAllLevelShadowBoxSpread', '');
            let inputvalue = e.detail.value;
            if(!this.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.navAllLevelShadowBoxSpread.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.styles.navAllLevelShadowBoxSpread = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputError('navAllLevelShadowBoxSpread', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputError('navAllLevelShadowBoxSpread', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleExportConfig(e)
    {
        this.exportError = undefined;
        let tmpvalueObj = this.getValueObj();
        if(!this.isStringEmpty(tmpvalueObj?.general?.menuName))
        {
            this.download(tmpvalueObj.general.menuName + '.json', JSON.stringify(tmpvalueObj, undefined, 4));
        }
        else
        {
            this.exportError = 'Menu Name is required.';
        }
    }

    download(filename, text) {
        var element = this.template.querySelector('a[data-name="exportMenu"]');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
            
        element.click();
      
        element.setAttribute('href','');
        element.setAttribute('download', '');
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
        let fileElement = this.template.querySelector('input[data-name="importConfigFile"]');
        let file = fileElement.files.item(0);
        if(file === undefined || file === null)
        {
            this.importError = 'No file selected.';
        }
        else 
        {
            const reader = new FileReader();
            reader.onload = (ev) => {
                let JSONConfigImportString = ev.target.result;
                let JSONConfigImport;
                try {
                    JSONConfigImport = JSON.parse(JSONConfigImportString);
                } catch(err) {
                    this.importError = 'Error parsing JSON: ' + err;
                }

                try {

                    if(!this.isObjectEmpty(JSONConfigImport))
                    {
                        let tmpvalueObj = this.getValueObj();
                        let hasValueChanged = false;
                        for (let key in this.propInputs) 
                        {
                            if(Object.prototype.hasOwnProperty.call(this.propInputs, key))
                            {
                                let tmpVal = this.getObjPropValue(JSONConfigImport, this.propInputs[key].valuePath);
                                if(!this.isObjectEmpty(tmpVal))
                                {
                                    tmpvalueObj = this.setObjPropValue(tmpvalueObj, this.propInputs[key].valuePath, tmpVal);
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
                

            };
            reader.readAsText(file);
        }
    }

}