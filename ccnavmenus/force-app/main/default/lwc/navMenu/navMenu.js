import { LightningElement, api, track, wire } from 'lwc';
import fetchMenu from '@salesforce/apex/menusController.getMenu';
import {loadStyle} from 'lightning/platformResourceLoader';
import navMenuCSS from '@salesforce/resourceUrl/navMenu';

export default class NavMenu extends LightningElement {

    @api menuId;
    @api isVertical = false;

    @track items = [];
    @track url = '';

    //wire functions
    wireFetchMenu;
    @wire(fetchMenu,{menuId: '$menuId'})
    fetchMenuImperativeWiring(result) 
    {
        if (result.data) {
            let resData = JSON.parse(result.data)
            if(resData.menu)
            {
                try {
                    //this.menuItemListResult = result;
                    this.items = resData.menu;
                    this.error = undefined;
                }catch(e){}
            }
        } else if (result.error) {
           // this.menuItemListResult = result;
            this.error = result.error;
            this.items = undefined;
        }

    }

    connectedCallback()
    {
        this.url = window.location.href.split('?')[0];
        loadStyle(this, navMenuCSS);
    }

}