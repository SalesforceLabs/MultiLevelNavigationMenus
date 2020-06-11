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

        String languagesJSON = menusManagerController.getLanguages();
        List<String> languageList = (List<String>)System.JSON.deserialize(languagesJSON, List<String>.class);

        VisualEditor.DynamicPickListRows  myValues = new VisualEditor.DynamicPickListRows();
        
        VisualEditor.DataRow value1 = new VisualEditor.DataRow('{!language}','{!language}');
        myValues.addRow(value1);

        for(String language : languageList)
        {
            VisualEditor.DataRow value = new VisualEditor.DataRow(language,language);
            myValues.addRow(value);
        }
        
        return myValues;

    }

}