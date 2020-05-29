import { LightningElement, track, wire } from 'lwc';
import fetchMenus from '@salesforce/apex/menusManagerController.getMenus';
import deleteMenu from '@salesforce/apex/menusManagerController.deleteMenu';
import fetchMenu from '@salesforce/apex/menusManagerController.getMenu';
import deleteMenuItem from '@salesforce/apex/menusManagerController.deleteMenuItem';
import { refreshApex } from '@salesforce/apex';
import {loadStyle} from 'lightning/platformResourceLoader';
import menusManagerCSS from '@salesforce/resourceUrl/menusManager';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const MENU_ITEM_ACTIONS = [
    { label: 'Create Child Menu Item', name: 'createMenuItem' },
    { label: 'Edit Menu Item', name: 'editMenuItem' },
    { label: 'Delete Menu Item', name: 'deleteMenuItem' }
];


const MENU_ITEM_COLUMNS_DEFINITION = [
    {
        type: 'text',
        fieldName: 'label',
        label: 'Name',
        initialWidth: 300,
    },
    {
        type: 'text',
        fieldName: 'href',
        label: 'URL',
        initialWidth: 300,
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
        type: 'action', 
        typeAttributes: 
        { 
            rowActions: MENU_ITEM_ACTIONS, 
            menuAlignment: 'left' 
        } 
    }
];

export default class MenusManager extends LightningElement {

    @track createModalOpen = false;
    @track editModalOpen = false;
    @track deleteModalOpen = false;
    @track deleteMIModalOpen = false;
    @track createEditModalOpen = false;
    @track menuList;
    @track menuListResult;
    @track menuOptions;
    @track menuItemList;
    @track menuItemListResult;
    @track menuId = null;
    @track menuName;
    @track selectedMenuItemIdForCreate;
    @track selectedMenuItemIdForEdit;
    @track selectedMenuItemLabelForEdit;
    @track selectedMenuItemIdForDelete;
    @track selectedMenuItemLabelForDelete;
    @track error;

    MENU_ITEM_COLUMNS_DEFINITION = MENU_ITEM_COLUMNS_DEFINITION;


    //wire functions
    wireFetchMenu;
    @wire(fetchMenu,{menuId: '$menuId'})
    fetchMenuImperativeWiring(result) 
    {
        if (result.data) {
            try {
                this.menuItemListResult = result;
                this.menuItemList = JSON.parse(result.data);
                this.error = undefined;
            }catch(e){}
        } else if (result.error) {
            this.menuItemListResult = result;
            this.error = result.error;
            this.menuItemList = undefined;
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

    
    

    connectedCallback() 
    {
        loadStyle(this, menusManagerCSS);
    }

    renderedCallback()
    {
        try{
            let grid =  this.template.querySelector( ".menuItemstreegrid" );
            grid.expandAll();
        }catch(e){}
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

}