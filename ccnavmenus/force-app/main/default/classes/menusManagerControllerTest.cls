/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
 
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
        String languagesJSON = menusManagerController.getLanguages();
        List<String> languageList = (List<String>)System.JSON.deserialize(languagesJSON, List<String>.class);
        System.assert(languageList.size() > 0);

        String menusJSON = menusManagerController.getMenus();
        Map<String,Object> menuMapObj = (Map<String,Object>) System.JSON.deserializeUntyped(menusJSON);
        String menuListString = System.JSON.serialize(menuMapObj.get('menuList'));
        List<ccnavmenus__Menu__c> menuList = (List<ccnavmenus__Menu__c>) System.JSON.deserialize(menuListString,List<ccnavmenus__Menu__c>.class);
        System.assert(menuList.size() > 0);

        String menuId = menuList[0].Id;

        String menuJSON = menusManagerController.getMenu(menuId, null);
        Map<String,Object> menuMap = (Map<String,Object>)System.JSON.deserializeUntyped(menuJSON);
        String menuItemListJSONString = System.JSON.serialize(menuMap.get('itemsList'));
        List<menusManagerController.treeItem> menuItemList = (List<menusManagerController.treeItem>)System.JSON.deserialize(menuItemListJSONString,List<menusManagerController.treeItem>.class);
        System.assert(menuItemList.size() > 0);

        List<ccnavmenus__Menu_Item__c> miList = [SELECT Id FROM ccnavmenus__Menu_Item__c WHERE Name = 'MI 6'];
        String menuItemId = miList[0].Id;
        

        String resultMI = menusManagerController.deleteMenuItem(menuItemId);
        System.assertEquals('success', resultMI);

        String resultM = menusManagerController.deleteMenu(menuId);
        System.assertEquals('success', resultM);

    }

    @IsTest
    public static void test_success_importMenu(){
        
        String menuJSON = '{"name":"Menu A - test 1","_children":[{"position":"1","openInNewWindow":"No","level":1,"language":null,"label":"MI 1.1","_children":[{"position":"1","openInNewWindow":"No","level":2,"language":null,"label":"MI 1.1.1","_children":[{"position":"1","openInNewWindow":"No","level":3,"language":null,"label":"MI 1.1.1.1","_children":[{"position":"1","openInNewWindow":"No","level":4,"language":null,"label":"MI 1.1.1.1.1","_children":[{"position":"1","openInNewWindow":"Yes","level":5,"language":null,"label":"MI 1.1.1.1.1.1","_children":[{"position":"1","openInNewWindow":"No","level":6,"language":null,"label":"MI 1.1.1.1.1.1.1","_children":null,"isPublic":"Yes","iconPosition":"left","icon":null,"href":"/s/"},{"position":"2","openInNewWindow":"No","level":6,"language":"fr","label":"MI 1.1.1.1.1.1.2 - French","_children":null,"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"}],"isPublic":"Yes","iconPosition":null,"icon":null,"href":"https://www.google.com"}],"isPublic":"Yes","iconPosition":null,"icon":null,"href":"https://ccnavmenus-dev-ed.preview.salesforce-communities.com/ccnavmenus"}],"isPublic":"Yes","iconPosition":null,"icon":null,"href":"javascript:void(0);"},{"position":"2","openInNewWindow":"No","level":3,"language":null,"label":"MI 1.1.1.2","_children":[],"isPublic":"Yes","iconPosition":"left","icon":null,"href":"javascript:void(0);"}],"isPublic":"Yes","iconPosition":"right","icon":"utility:groups","href":"javascript:void(0);"},{"position":"2","openInNewWindow":"No","level":2,"language":null,"label":"MI 1.1.2","_children":[],"isPublic":"Yes","iconPosition":"left","icon":null,"href":"javascript:void(0);"}],"isPublic":"Yes","iconPosition":"right","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"2","openInNewWindow":"No","level":1,"language":null,"label":"MI 1.2","_children":[{"position":"1","openInNewWindow":"No","level":2,"language":null,"label":"MI 1.2.1","_children":[],"isPublic":"Yes","iconPosition":"left","icon":null,"href":"javascript:void(0);"}],"isPublic":"Yes","iconPosition":"left","icon":null,"href":"javascript:void(0);"},{"position":"3","openInNewWindow":"No","level":1,"language":null,"label":"MI 1.3 sdfsd sdf dsf sdf sdfsdfsd","_children":[{"position":"1","openInNewWindow":"No","level":2,"language":null,"label":"MI 1.3.1","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"2","openInNewWindow":"No","level":2,"language":null,"label":"MI 1.3.2","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"}],"isPublic":"Yes","iconPosition":"left","icon":null,"href":"javascript:void(0);"},{"position":"4","openInNewWindow":"No","level":1,"language":null,"label":"MI 1.4","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"5","openInNewWindow":"No","level":1,"language":"fr;fr_FR","label":"MI 1.5 - French","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"6","openInNewWindow":"No","level":1,"language":null,"label":"MI 1.6","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"7","openInNewWindow":"No","level":1,"language":null,"label":"MI 1.7","_children":[{"position":"1","openInNewWindow":"Yes","level":2,"language":null,"label":"MI 1.7.1","_children":[],"isPublic":"Yes","iconPosition":"right","icon":"utility:connected_apps","href":"https://www.google.com"}],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"8","openInNewWindow":"No","level":1,"language":"es","label":"MI 1.8","_children":[{"position":"1","openInNewWindow":"No","level":2,"language":"fr","label":"MI 1.8.1 - French","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"2","openInNewWindow":"No","level":2,"language":null,"label":"MI 1.8.2","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"}],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"9","openInNewWindow":"Yes","level":1,"language":"fr","label":"MI 1.9 - French","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"},{"position":"10","openInNewWindow":"No","level":1,"language":"fr","label":"MI 1.10 - French","_children":[],"isPublic":"Yes","iconPosition":"left","icon":"utility:connected_apps","href":"javascript:void(0);"}]}';
        String importMenuJSON = menusManagerController.importMenu(menuJSON);
        Map<String,Object> importMenu = (Map<String,Object>)System.JSON.deserializeUntyped(importMenuJSON);
        String menuId = (String)importMenu.get('menuId');
        System.assertNotEquals(null, menuId);
        System.assertNotEquals('', menuId);

        String menuJSON2 = menusManagerController.getMenu(menuId, 'fr');
        Map<String,Object> menuMap = (Map<String,Object>)System.JSON.deserializeUntyped(menuJSON2);
        String menuItemListJSONString = System.JSON.serialize(menuMap.get('itemsList'));
        List<menusManagerController.treeItem> menuItemList = (List<menusManagerController.treeItem>)System.JSON.deserialize(menuItemListJSONString,List<menusManagerController.treeItem>.class);
        System.assert(menuItemList.size() > 0);

    }

}