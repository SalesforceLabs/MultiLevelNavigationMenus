@isTest
public class languagePicklistTest {
    
    public static testMethod void test_success_languagePicklist()
    {
        languagePicklist conp = new languagePicklist(null);
        VisualEditor.DataRow dr = conp.getDefaultValue();
        System.assertNotEquals(null, dr);
        
        VisualEditor.DynamicPickListRows dpr = conp.getValues();
        System.assert(dpr.size() > 0);
    }

}
