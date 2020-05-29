import { LightningElement, track, wire } from 'lwc';
import fetchMenus from '@salesforce/apex/menusManagerController.getMenus';
import deleteMenu from '@salesforce/apex/menusManagerController.deleteMenu';
import fetchMenu from '@salesforce/apex/menusManagerController.getMenu';
import { refreshApex } from '@salesforce/apex';
import {loadStyle} from 'lightning/platformResourceLoader';
import menusManagerCSS from '@salesforce/resourceUrl/menusManager';

const MENU_ITEM_ACTIONS = [
    { label: 'Create Child Menu Item', name: 'createMenuItem' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
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
    @track menuList;
    @track menuListResult;
    @track menuOptions;
    @track menuItemList;
    @track menuId;
    @track menuName;
    @track error;

    MENU_ITEM_COLUMNS_DEFINITION = MENU_ITEM_COLUMNS_DEFINITION;


    //wire functions
    wireFetchMenus;
    @wire(fetchMenus)
    imperativeWiring(result) 
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
            this.error = result.error;
            this.menuList = undefined;
        }
    }

    connectedCallback() 
    {
        loadStyle(this, menusManagerCSS);
    }

    openCreateModal() 
    {
        this.createModalOpen = true
    }
    
    closeCreateModal() 
    {
        this.createModalOpen = false
    } 
    
    createMenuSuccess() 
    {
        refreshApex(this.menuListResult);
        this.closeCreateModal();
    }

    openEditModal() 
    {
        this.editModalOpen = true
    }
    
    closeEditModal() 
    {
        this.editModalOpen = false
    } 
    
    editMenuSuccess() 
    {
        refreshApex(this.menuListResult);
        this.closeEditModal();
    }

    openDeleteModal() 
    {
        this.deleteModalOpen = true
    }
    
    closeDeleteModal() 
    {
        this.deleteModalOpen = false
    } 
    
    handleDeleteMenu() 
    {

        deleteMenu({
            menuId: this.menuId
        })
        .then(() => {
            
            this.closeDeleteModal();
            return refreshApex(this.menuListResult);
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
        
        fetchMenu({
            menuId: this.menuId
        })
        .then((result) => {
            
            this.menuItemList = JSON.parse(JSON.stringify(JSON.parse(result)).split('_children').join('_children'));
            
            
        })
        .catch((error) => {
            this.message = 'Error received: code' + error.errorCode + ', ' +
                'message ' + error.body.message;
        })
        .finally(() => {
            const grid =  this.template.querySelector( ".menuItemstreegrid" );
            grid.expandAll();
        });

    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        switch (action.name) {
            case 'createMenuItem':
                alert('Showing Details: ' + JSON.stringify(row));
                break;
            case 'delete':
                const rows = this.data;
                const rowIndex = rows.indexOf(row);
                rows.splice(rowIndex, 1);
                this.data = rows;
                break;
        }
    }

}