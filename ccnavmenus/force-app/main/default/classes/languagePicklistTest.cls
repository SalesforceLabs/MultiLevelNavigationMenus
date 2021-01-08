/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
 
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