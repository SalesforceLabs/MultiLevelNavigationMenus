@isTest
public class menusManagerControllerTest {
    
    @testSetup static void testSetupMethod()
    {
        ccnavmenus__Menu__c menu = new ccnavmenus__Menu__c(
            Name='test menu'
        );

        insert menu;

        ccnavmenus__Menu_Item__c mi1 = new ccnavmenus__Menu_Item__c(
            Name='MI 1', ccnavmenus__URL__c='test-mi1', ccnavmenus__Position__c='1', ccnavmenus__SLDS_Icon_Position__c='left', ccnavmenus__Menu__c=menu.Id
        );

        insert mi1;

        ccnavmenus__Menu_Item__c mi2 = new ccnavmenus__Menu_Item__c(
            Name='MI 2', ccnavmenus__URL__c='test-mi2', ccnavmenus__Position__c='1', ccnavmenus__SLDS_Icon_Position__c='left', ccnavmenus__Menu__c=menu.Id,
            ccnavmenus__Menu_Item__c=mi1.Id
        );

        insert mi2;

        ccnavmenus__Menu_Item__c mi3 = new ccnavmenus__Menu_Item__c(
            Name='MI 3', ccnavmenus__URL__c='test-mi3', ccnavmenus__Position__c='1', ccnavmenus__SLDS_Icon_Position__c='left', ccnavmenus__Menu__c=menu.Id,
            ccnavmenus__Menu_Item__c=mi2.Id
        );

        insert mi3;

        ccnavmenus__Menu_Item__c mi4 = new ccnavmenus__Menu_Item__c(
            Name='MI 4', ccnavmenus__URL__c='test-mi4', ccnavmenus__Position__c='1', ccnavmenus__SLDS_Icon_Position__c='left', ccnavmenus__Menu__c=menu.Id,
            ccnavmenus__Menu_Item__c=mi3.Id
        );

        insert mi4;

        ccnavmenus__Menu_Item__c mi5 = new ccnavmenus__Menu_Item__c(
            Name='MI 5', ccnavmenus__URL__c='test-mi5', ccnavmenus__Position__c='1', ccnavmenus__SLDS_Icon_Position__c='left', ccnavmenus__Menu__c=menu.Id,
            ccnavmenus__Menu_Item__c=mi4.Id
        );

        insert mi5;

        ccnavmenus__Menu_Item__c mi6 = new ccnavmenus__Menu_Item__c(
            Name='MI 6', ccnavmenus__URL__c='test-mi6', ccnavmenus__Position__c='1', ccnavmenus__SLDS_Icon_Position__c='left', ccnavmenus__Menu__c=menu.Id,
            ccnavmenus__Menu_Item__c=mi5.Id
        );

        insert mi6;
    }

    public static testMethod void test_success_menusManagerController()
    {
        
        String menusJSON = menusManagerController.getMenus();
        List<ccnavmenus__Menu__c> menuList = (List<ccnavmenus__Menu__c>) System.JSON.deserialize(menusJSON,List<ccnavmenus__Menu__c>.class);
        System.assert(menuList.size() > 0);

        String menuId = menuList[0].Id;

        String menuJSON = menusManagerController.getMenu(menuId);
        List<menusManagerController.treeItem> menuItemList = (List<menusManagerController.treeItem>)System.JSON.deserialize(menuJSON,List<menusManagerController.treeItem>.class);
        System.assert(menuItemList.size() > 0);

        List<ccnavmenus__Menu_Item__c> miList = [SELECT Id FROM ccnavmenus__Menu_Item__c WHERE Name = 'MI 6'];
        String menuItemId = miList[0].Id;
        

        String resultMI = menusManagerController.deleteMenuItem(menuItemId);
        System.assertEquals('success', resultMI);

        String resultM = menusManagerController.deleteMenu(menuId);
        System.assertEquals('success', resultM);

    }

}
