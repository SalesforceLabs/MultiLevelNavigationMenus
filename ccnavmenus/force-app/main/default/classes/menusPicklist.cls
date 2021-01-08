/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
 
global class menusPicklist extends VisualEditor.DynamicPickList {
    VisualEditor.DesignTimePageContext context;
    
    global menusPicklist(VisualEditor.DesignTimePageContext context) {
        this.context = context;
    }
    
    global override VisualEditor.DataRow getDefaultValue(){
        VisualEditor.DynamicPickListRows rowList =  getPicklistRows();
        if(rowList.size() > 0) 
        {
            return rowList.get(0);
        }

        return null;
    }
    
    global override VisualEditor.DynamicPickListRows getValues() {
        return getPicklistRows();
    }

    private static VisualEditor.DynamicPickListRows getPicklistRows() {

        VisualEditor.DynamicPickListRows  myValues = new VisualEditor.DynamicPickListRows();
        VisualEditor.DataRow value2 = new VisualEditor.DataRow('[Name Filter]','nameFilter');
        myValues.addRow(value2);
        
        for(ccnavmenus__Menu__c menu : [SELECT Id, Name FROM ccnavmenus__Menu__c ORDER BY Name LIMIT 100])
        {
            VisualEditor.DataRow value = new VisualEditor.DataRow(menu.Name, menu.Id + '');
            myValues.addRow(value);
        }
        
        return myValues;

    }

}