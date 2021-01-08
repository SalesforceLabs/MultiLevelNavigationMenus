/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
 
@isTest
public class menusPicklistTest {

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

    public static testMethod void test_success_menusPicklist()
    {
        menusPicklist conp = new menusPicklist(null);
        VisualEditor.DataRow dr = conp.getDefaultValue();
        System.assertNotEquals(null, dr);
        
        VisualEditor.DynamicPickListRows dpr = conp.getValues();
        System.assert(dpr.size() > 0);
    }
    
}