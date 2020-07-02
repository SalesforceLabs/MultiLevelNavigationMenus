import { LightningElement, track, wire } from 'lwc';
import fetchMenus from '@salesforce/apex/menusManagerController.getMenus';
import fetchLanguages from '@salesforce/apex/menusManagerController.getLanguages';
import deleteMenu from '@salesforce/apex/menusManagerController.deleteMenu';
import fetchMenu from '@salesforce/apex/menusManagerController.getMenu';
import deleteMenuItem from '@salesforce/apex/menusManagerController.deleteMenuItem';
import doImportMenu from '@salesforce/apex/menusManagerController.importMenu';
import { refreshApex } from '@salesforce/apex';
import {loadStyle} from 'lightning/platformResourceLoader';
import menusManagerCSS from '@salesforce/resourceUrl/menusManager';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const MENU_ITEM_ACTIONS = [
    { label: 'Edit Menu Item', name: 'editMenuItem' },
    { label: 'Delete Menu Item', name: 'deleteMenuItem' }
];


const MENU_ITEM_COLUMNS_DEFINITION = [
    {
        type: 'text',
        fieldName: 'label',
        label: 'Name',
        initialWidth: 300
    },
    {
        type: 'text',
        fieldName: 'label',
        label: 'Label',
        initialWidth: 300,
        cellAttributes:
        { 
            iconName: 
            { 
                fieldName: 'icon' 
            }, 
            iconPosition: 
            {
                fieldName: 'iconPosition'
            }
        }
    },
    {
        type: 'text',
        fieldName: 'href',
        label: 'URL',
        initialWidth: 300        
    },
    {
        type: 'text',
        fieldName: 'position',
        label: 'Position',
        initialWidth: 100,
    },
    {
        type: 'text',
        fieldName: 'openInNewWindow',
        label: 'Opens in New Window',
        initialWidth: 100,
    },
    {
        type: 'text',
        fieldName: 'isPublic',
        label: 'Public',
        initialWidth: 100,
    },
    {
        type: 'text',
        fieldName: 'language',
        label: 'Language',
        initialWidth: 100,
    }
];

const cleanMenuItemFields = ['position','openInNewWindow','level','language','label','_children','isPublic','iconPosition','icon','href'];


export default class MenusManager extends LightningElement {

    @track importModalOpen = false;
    @track createModalOpen = false;
    @track editModalOpen = false;
    @track deleteModalOpen = false;
    @track deleteMIModalOpen = false;
    @track createEditModalOpen = false;
    @track menuList;
    @track menuListResult;
    @track menuOptions;
    @track languageList;
    @track languageListResult;
    @track languageOptions;
    @track menuItemList;
    @track menuItemMap;
    @track menuItemListResult;
    @track menuId = '';
    @track languageFilter = '';
    @track menuName;
    @track selectedMenuItemIdForCreate;
    @track selectedMenuItemIdForEdit;
    @track selectedMenuItemLabelForEdit;
    @track selectedMenuItemIdForDelete;
    @track selectedMenuItemLabelForDelete;
    @track error;
    @track activeLanguageSections = [];

    @track MENU_ITEM_COLUMNS_DEFINITION = JSON.parse(JSON.stringify(MENU_ITEM_COLUMNS_DEFINITION));
    @track MENU_ITEM_ACTIONS = JSON.parse(JSON.stringify(MENU_ITEM_ACTIONS));


    //wire functions
    wireFetchMenu;
    @wire(fetchMenu,{menuId: '$menuId', language: '$languageFilter'})
    fetchMenuImperativeWiring(result) 
    {
        if (result.data) {
            try {
                this.menuItemListResult = result;
                let menuItemResult = JSON.parse(result.data);
                this.menuItemList = menuItemResult.itemsList;
                this.menuItemMap = menuItemResult.itemsMap;
                this.error = undefined;
            }catch(e){}
        } else if (result.error) {
            this.menuItemListResult = result;
            this.error = result.error;
            this.menuItemList = undefined;
            this.menuItemMap = undefined;
        }

    }

    wireFetchMenus;
    @wire(fetchMenus)
    fetchMenusImperativeWiring(result) 
    {
        if (result.data) {
            this.menuListResult = result;
            this.menuList = JSON.parse(result.data);
            this.menuOptions = new Array();
            for(let i=0; i<this.menuList.length;i++)
            {
                let tmpMenuOption = {};
                tmpMenuOption.label = this.menuList[i].Name;
                tmpMenuOption.value = this.menuList[i].Id;
                this.menuOptions.push(tmpMenuOption);
            }
            this.error = undefined;
        } else if (result.error) {
            this.menuListResult = result;
            this.error = result.error;
            this.menuList = undefined;
        }
    }

    wireFetchLanguages;
    @wire(fetchLanguages)
    fetchLanguagesImperativeWiring(result) 
    {
        if (result.data) {
            this.languageListResult = result;
            this.languageList = JSON.parse(result.data);
            this.languageOptions = new Array();
            for(let i=0; i<this.languageList.length;i++)
            {
                let tmpLanguageOption = {};
                tmpLanguageOption.label = this.languageList[i];
                tmpLanguageOption.value = this.languageList[i];
                tmpLanguageOption.value = (tmpLanguageOption.value === 'none') ? '' : tmpLanguageOption.value ;
                this.languageOptions.push(tmpLanguageOption);
            }
            this.error = undefined;
        } else if (result.error) {
            this.languageListResult = result;
            this.error = result.error;
            this.languageList = undefined;
        }
    }
    
    

    connectedCallback() 
    {
        this.MENU_ITEM_COLUMNS_DEFINITION = JSON.parse(JSON.stringify(MENU_ITEM_COLUMNS_DEFINITION));
        
        this.MENU_ITEM_COLUMNS_DEFINITION.push({
            'type': 'action', 
            'typeAttributes': 
            { 
                'rowActions': this.getRowActions.bind(this),
                'menuAlignment': 'right' 
            } 
        });
        

        loadStyle(this, menusManagerCSS);
    }

    renderedCallback()
    {
        try{
            let grid =  this.template.querySelector( ".menuItemstreegrid" );
            grid.expandAll();
        }catch(e){}
    }

    openImportModal() 
    {
        this.importModalOpen = true;
    }
    
    closeImportModal() 
    {
        this.importModalOpen = false;
    }

    openCreateModal() 
    {
        this.createModalOpen = true;
    }
    
    closeCreateModal() 
    {
        this.createModalOpen = false;
    } 
    
    createMenuSuccess() 
    {
        refreshApex(this.menuListResult);
        this.closeCreateModal();
    }

    openEditModal() 
    {
        this.editModalOpen = true;
    }
    
    closeEditModal() 
    {
        this.editModalOpen = false;
    } 
    
    editMenuSuccess() 
    {
        refreshApex(this.menuListResult);
        this.closeEditModal();
    }

    openDeleteModal() 
    {
        this.deleteModalOpen = true;
    }
    
    closeDeleteModal() 
    {
        this.deleteModalOpen = false;
    } 
    
    handleDeleteMenu() 
    {

        deleteMenu({
            menuId: this.menuId
        })
        .then((result) => {
            if(result === 'success')
            {
                this.closeDeleteModal();
                this.menuItemList = undefined;
                this.menuId = null;
                return refreshApex(this.menuListResult);
            }
            else 
            {
                this.showNotification('Error Deleting Menu!', result+'','error');
            }
        })
        .catch((error) => {
            this.message = 'Error received: code' + error.errorCode + ', ' +
                'message ' + error.body.message;
        });

        
    }

    openCreateEditModal() 
    {
        if(this.selectedMenuItemIdForEdit !== undefined && this.selectedMenuItemIdForEdit !== null && this.selectedMenuItemIdForEdit.trim() !== '')
        {
            this.activeLanguageSections = [];
            let mi = this.menuItemMap[this.selectedMenuItemIdForEdit];
            if(mi !== undefined && mi !== null && mi.ccnavmenus__Language__c !== undefined && mi.ccnavmenus__Language__c !== null &&
                mi.ccnavmenus__Language__c.trim() !== '')
            {
                this.activeLanguageSections.push('language');
            }
            else
            {
                this.activeLanguageSections = [];
            }
        }
        else
        {
            this.activeLanguageSections = [];
        }
        this.createEditModalOpen = true;
    }
    
    closeCreateEditModal() 
    {
        this.createEditModalOpen = false;
        this.selectedMenuItemIdForCreate = undefined;
        this.selectedMenuItemIdForEdit = undefined;
        this.selectedMenuItemLabelForEdit = undefined;
    } 

    handleCreateEditSuccess(e)
    {

        refreshApex(this.menuItemListResult);

        this.selectedMenuItemIdForCreate = undefined;
        this.selectedMenuItemIdForEdit = undefined;
        this.selectedMenuItemLabelForEdit = undefined;
        this.closeCreateEditModal();

    }

    openDeleteMIModal() 
    {
        this.deleteMIModalOpen = true;
    }
    
    closeDeleteMIModal() 
    {
        this.selectedMenuItemIdForDelete = undefined;
        this.selectedMenuItemLabelForDelete = undefined;
        this.deleteMIModalOpen = false;
    } 
    
    handleDeleteMIMenu() 
    {

        deleteMenuItem({
            menuItemId: this.selectedMenuItemIdForDelete
        })
        .then(() => {
            
            this.closeDeleteMIModal();
            return refreshApex(this.menuItemListResult);
        })
        .catch((error) => {
            this.message = 'Error received: code' + error.errorCode + ', ' +
                'message ' + error.body.message;
        });

        
    }

    handleMenuChange(e) 
    {
        this.menuId = e.detail.value;
        for(let i=0;i<this.menuOptions.length;i++)
        {
            if(this.menuOptions[i].value === this.menuId)
            {
                this.menuName = this.menuOptions[i].label;
            }
        }
        
        refreshApex(this.menuItemListResult);  
        
        try{
            this.template.querySelector('[data-name="menus"]').blur();
        } catch(e){}

    }

    handleExportMenu(e)
    {
        let menu = {name: this.menuName, _children: this.menuItemList};
        menu = this.cleanExport(menu);
        this.download(this.menuName + '.json', JSON.stringify(menu, undefined, 4));
    }

    handleLanguageChange(e) 
    {
        this.languageFilter = e.detail.value;
        this.languageFilter = (this.languageFilter === 'none') ? '' : this.languageFilter ;
        
        setTimeout(() => {
            refreshApex(this.menuItemListResult);
        }, 500);
        
        try {
            this.template.querySelector('[data-name="languages"]').blur();
        } catch(e){}

    }

    handleRefreshMenuItems(e)
    {
        refreshApex(this.menuItemListResult);
    }

    handleImportMenu(e)
    {
        let fileElement = this.template.querySelector('input[data-name="importMenuFile"]');
        let file = fileElement.files.item(0);
        if(file === undefined || file === null)
        {
            this.showNotification('Import Menu Error', 'No file selected.', 'error');
        }
        else 
        {
            const reader = new FileReader();
            reader.onload = (e) => {
                let JSONMenuImportString = e.target.result;
                let JSONMenuImport;
                try {
                    JSONMenuImport = JSON.parse(JSONMenuImportString);
                } catch(e) {
                    this.showNotification('Import Menu Error', 'Error parsing JSON: ' + e, 'error');
                }

                doImportMenu({
                    menuJSON: JSONMenuImportString
                })
                .then((result) => {
                    let res = JSON.parse(result);
                    if(res.menuId !== undefined && res.menuId !== null)
                    {
                        
                        this.menuItemList = undefined;
                        refreshApex(this.menuListResult);
                        this.menuId = res.menuId;
                        this.menuName = (JSONMenuImport.name !== undefined && JSONMenuImport.name !== null && JSONMenuImport.name.trim() !== '') ? JSONMenuImport.name : this.menuName;
                        this.showNotification('Import Menu Success', 'Menu Imported Successfully!','success');
                        this.closeImportModal();
                    }
                    else 
                    {
                        this.showNotification('Import Menu Error', res.error,'error');
                    }
                })
                .catch((error) => {
                    let message = 'Error received: code' + error.errorCode + ', ' +
                        'message ' + error.body.message;
                    this.showNotification('Import Menu Error', message, 'error');
                });

            };
            reader.readAsText(file);
        }
    }

    getRowActions(row, doneCallback)
    {
        let actions = [];
        if(row.level !== 6)
        {
            actions.push({
                'label': 'Create Child Menu Item', 
                'name': 'createMenuItem'
            });
        }
        actions = actions.concat(this.MENU_ITEM_ACTIONS);

        setTimeout(() => {
            doneCallback(actions);
        }, 200);
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        switch (action.name) {
            case 'createMenuItem':
                this.selectedMenuItemIdForCreate = row.id;
                this.selectedMenuItemIdForEdit = undefined;
                this.selectedMenuItemLabelForEdit = undefined;
                this.openCreateEditModal();
                break;
            case 'editMenuItem':
                this.selectedMenuItemIdForCreate = undefined;
                this.selectedMenuItemIdForEdit = row.id;
                this.selectedMenuItemLabelForEdit = row.label;
                this.openCreateEditModal();
                break;
            case 'deleteMenuItem':
                this.selectedMenuItemIdForDelete = row.id;
                this.selectedMenuItemLabelForDelete = row.label;
                this.openDeleteMIModal();
                break;
        }
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    download(filename, text) {
        var element = this.template.querySelector('a[data-name="exportMenu"]');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
            
        element.click();
      
        element.setAttribute('href','');
        element.setAttribute('download', '');
    }

    cleanExport(menu)
    {   
        if(menu !== undefined && menu !== null && menu._children !== undefined && menu._children !== null && menu._children.length > 0)
        {
            for(let i = 0; i < menu._children.length;i++)
            {
                menu._children[i] = this.cleanMenuItem(menu._children[i]);
                if(menu._children[i]._children !== undefined && menu._children[i]._children !== null)
                {
                    menu._children[i] = this.cleanExport(menu._children[i]);
                }
            }
        }

        return menu;
    }

    cleanMenuItem(menuItem)
    {
        var menuItemClean = new Object();

        for(let i=0;i<cleanMenuItemFields.length;i++)
        {
            menuItemClean[cleanMenuItemFields[i]] = (menuItem[cleanMenuItemFields[i]] !== undefined && cleanMenuItemFields[i] !== null) ? menuItem[cleanMenuItemFields[i]] : null;
        }
        

        return menuItemClean;
    }

}