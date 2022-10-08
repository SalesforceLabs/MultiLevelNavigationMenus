global class languagePicklist extends VisualEditor.DynamicPickList {
    VisualEditor.DesignTimePageContext context;
    
    global languagePicklist(VisualEditor.DesignTimePageContext context) {
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

        VisualEditor.DataRow value1 = new VisualEditor.DataRow('auto','auto');
        myValues.addRow(value1);

        VisualEditor.DataRow value = new VisualEditor.DataRow('none','none');
        myValues.addRow(value);

        
        
        return myValues;

    }

}