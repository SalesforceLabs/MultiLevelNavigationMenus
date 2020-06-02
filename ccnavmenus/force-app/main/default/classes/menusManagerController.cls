public with sharing class menusManagerController {
    
    @AuraEnabled(cacheable=true)
    public static String getMenus()
    {
       List<ccnavmenus__Menu__c> menuList = [SELECT Id, Name FROM ccnavmenus__Menu__c ORDER BY Name LIMIT 100];
       return System.JSON.serialize(menuList);
    }

    @AuraEnabled
    public static String deleteMenu(Id menuId)
    {
        String result = 'success';
        try {
        List<ccnavmenus__Menu_Item__c> menuItemList = [SELECT Id FROM ccnavmenus__Menu_Item__c WHERE ccnavmenus__Menu__c = :menuId];
        delete menuItemList;
        ccnavmenus__Menu__c menu = new ccnavmenus__Menu__c(Id=menuId);
        delete menu;
        } catch(Exception e) {
            result = e+'';
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static String getMenu(Id menuId)
    {
        List<treeItem> listTOCLevel1 = new List<treeItem>();

        try {
            Boolean expanded = false;
            Map<Id,ccnavmenus__Menu_Item__c>  tocMap = queryMenu(menuId);

            listTOCLevel1 = populateTreeItemsByParent(tocMap, expanded);

        } catch(Exception e){}

        return System.JSON.serialize(listTOCLevel1).replaceAll('"items"','"_children"');
    }

    @AuraEnabled
    public static String deleteMenuItem(Id menuItemId)
    {
        String result = 'success';
        try {
            List<ccnavmenus__Menu_Item__c> menuItemList = [SELECT Id FROM ccnavmenus__Menu_Item__c WHERE 
            Id =: menuItemId OR ccnavmenus__Menu_Item__c = :menuItemId OR ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c = :menuItemId
            OR ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c  = :menuItemId 
            OR ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c = :menuItemId
            OR ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c = :menuItemId 
            OR ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c  = :menuItemId];
            delete menuItemList;
        } catch(Exception e) {
            result = e+'';
        }
        return result;
    }

    private static Map<Id,ccnavmenus__Menu_Item__c> queryMenu(Id menuId)
    {
        return new Map<Id, ccnavmenus__Menu_Item__c>([SELECT Id, Name, ccnavmenus__URL__c, ccnavmenus__Menu_Path__c, ccnavmenus__Open_in_New_Window__c, ccnavmenus__Position__c,
        ccnavmenus__Public__c,ccnavmenus__SLDS_Icon__c,ccnavmenus__SLDS_Icon_Position__c,ccnavmenus__Menu_Item__c, ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, 
        ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c,
        ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, 
        ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c,
        (SELECT Id FROM ccnavmenus__Menu_Items__r)
        FROM ccnavmenus__Menu_Item__c WHERE 
        ccnavmenus__Menu__c = :menuId 
        ORDER BY ccnavmenus__Menu_Path__c ASC]);
    }

    private static List<treeItem> populateTreeItemsByParent(Map<Id,ccnavmenus__Menu_Item__c> tocMap, Boolean expanded)
    {
        
        Map<String,treeItem> treeItemMapTop = new Map<String,treeItem>();
        Map<String,treeItem2> treeItemMapLevel2 = new Map<String,treeItem2>();
        Map<String,treeItem3> treeItemMapLevel3 = new Map<String,treeItem3>();
        Map<String,treeItem4> treeItemMapLevel4 = new Map<String,treeItem4>();
        Map<String,treeItem5> treeItemMapLevel5 = new Map<String,treeItem5>();
        Map<String,treeItem6> treeItemMapLevel6 = new Map<String,treeItem6>();

        for(ccnavmenus__Menu_Item__c toc : tocMap.values())
        {

            if(toc.ccnavmenus__Menu_Item__c == null) //toplevel
            {
                treeItem ti = createTreeItem(toc, expanded);
                treeItemMapTop.put(toc.Id, ti);
                
            }
            else if(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c == null) //1 level down
            {
                treeItem2 ti2 = createTreeItem2(toc, expanded);
                
                treeItem ti = treeItemMapTop.get(toc.ccnavmenus__Menu_Item__c);
                ti = (ti == null) ? createTreeItem(tocMap.get(toc.ccnavmenus__Menu_Item__c), expanded) : ti;
                ti.itemsMap.put(ti2.id, ti2);
                ti.items = ti.itemsMap.values();
                

                treeItemMapTop.put(toc.ccnavmenus__Menu_Item__c, ti);
                treeItemMapLevel2.put(toc.Id,ti2);
            }
            else if(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c == null) //2 levels down
            {
                treeItem3 ti3 = createTreeItem3(toc, expanded);
                
                treeItem2 ti2 = treeItemMapLevel2.get(toc.ccnavmenus__Menu_Item__c);
                ti2 = (ti2 == null) ? createTreeItem2(tocMap.get(toc.ccnavmenus__Menu_Item__c), expanded) : ti2;
                ti2.itemsMap.put(ti3.id, ti3);
                ti2.items = ti2.itemsMap.values();

                treeItem ti = treeItemMapTop.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti = (ti == null) ? createTreeItem(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti;
                ti.itemsMap.put(ti2.id, ti2);
                ti.items = ti.itemsMap.values();

                treeItemMapTop.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti);
                treeItemMapLevel2.put(toc.ccnavmenus__Menu_Item__c,ti2);
                treeItemMapLevel3.put(toc.Id,ti3);
            }
            else if(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c == null) //3 levels down
            {
                treeItem4 ti4 = createTreeItem4(toc, expanded);
                
                treeItem3 ti3 = treeItemMapLevel3.get(toc.ccnavmenus__Menu_Item__c);
                ti3 = (ti3 == null) ? createTreeItem3(tocMap.get(toc.ccnavmenus__Menu_Item__c), expanded) : ti3;
                ti3.itemsMap.put(ti4.id, ti4);
                ti3.items = ti3.itemsMap.values();

                treeItem2 ti2 = treeItemMapLevel2.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti2 = (ti2 == null) ? createTreeItem2(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti2;
                ti2.itemsMap.put(ti3.id, ti3);
                ti2.items = ti2.itemsMap.values();

                treeItem ti = treeItemMapTop.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti = (ti == null) ? createTreeItem(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti;
                ti.itemsMap.put(ti2.id, ti2);
                ti.items = ti.itemsMap.values();

                treeItemMapTop.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti);
                treeItemMapLevel2.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti2);
                treeItemMapLevel3.put(toc.ccnavmenus__Menu_Item__c,ti3);
                treeItemMapLevel4.put(toc.Id,ti4);
            }
            else if(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c == null) //4 levels down
            {
                treeItem5 ti5 = createTreeItem5(toc, expanded);
                
                treeItem4 ti4 = treeItemMapLevel4.get(toc.ccnavmenus__Menu_Item__c);
                ti4 = (ti4 == null) ? createTreeItem4(tocMap.get(toc.ccnavmenus__Menu_Item__c), expanded) : ti4;
                ti4.itemsMap.put(ti5.id, ti5);
                ti4.items = ti4.itemsMap.values();

                treeItem3 ti3 = treeItemMapLevel3.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti3 = (ti3 == null) ? createTreeItem3(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti3;
                ti3.itemsMap.put(ti4.id, ti4);
                ti3.items = ti3.itemsMap.values();

                treeItem2 ti2 = treeItemMapLevel2.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti2 = (ti2 == null) ? createTreeItem2(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti2;
                ti2.itemsMap.put(ti3.id, ti3);
                ti2.items = ti2.itemsMap.values();

                treeItem ti = treeItemMapTop.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti = (ti == null) ? createTreeItem(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti;
                ti.itemsMap.put(ti2.id, ti2);
                ti.items = ti.itemsMap.values();

                treeItemMapTop.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti);
                treeItemMapLevel2.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti2);
                treeItemMapLevel3.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti3);
                treeItemMapLevel4.put(toc.ccnavmenus__Menu_Item__c,ti4);
                treeItemMapLevel5.put(toc.Id,ti5);
            }
            else if(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c == null) //5 levels down
            {
                treeItem6 ti6 = createTreeItem6(toc, expanded);
                
                treeItem5 ti5 = treeItemMapLevel5.get(toc.ccnavmenus__Menu_Item__c);
                ti5 = (ti5 == null) ? createTreeItem5(tocMap.get(toc.ccnavmenus__Menu_Item__c), expanded) : ti5;
                ti5.itemsMap.put(ti6.id, ti6);
                ti5.items = ti5.itemsMap.values();

                treeItem4 ti4 = treeItemMapLevel4.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti4 = (ti4 == null) ? createTreeItem4(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti4;
                ti4.itemsMap.put(ti5.id, ti5);
                ti4.items = ti4.itemsMap.values();

                treeItem3 ti3 = treeItemMapLevel3.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti3 = (ti3 == null) ? createTreeItem3(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti3;
                ti3.itemsMap.put(ti4.id, ti4);
                ti3.items = ti3.itemsMap.values();

                treeItem2 ti2 = treeItemMapLevel2.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti2 = (ti2 == null) ? createTreeItem2(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti2;
                ti2.itemsMap.put(ti3.id, ti3);
                ti2.items = ti2.itemsMap.values();

                treeItem ti = treeItemMapTop.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c);
                ti = (ti == null) ? createTreeItem(tocMap.get(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c), expanded) : ti;
                ti.itemsMap.put(ti2.id, ti2);
                ti.items = ti.itemsMap.values();

                treeItemMapTop.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti);
                treeItemMapLevel2.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti2);
                treeItemMapLevel3.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti3);
                treeItemMapLevel4.put(toc.ccnavmenus__Menu_Item__r.ccnavmenus__Menu_Item__c, ti4);
                treeItemMapLevel5.put(toc.ccnavmenus__Menu_Item__c,ti5);
                treeItemMapLevel6.put(toc.Id,ti6);
            }

        }


        return treeItemMapTop.values();

    }

    private static treeItem createTreeItem(ccnavmenus__Menu_Item__c toc, Boolean expanded)
    {
        treeItem ti = new treeItem();
        ti.id = toc.Id;
        ti.label = toc.Name;
        ti.name = toc.ccnavmenus__URL__c;
        ti.icon = toc.ccnavmenus__SLDS_Icon__c;
        ti.iconPosition = toc.ccnavmenus__SLDS_Icon_Position__c;
        ti.href = toc.ccnavmenus__URL__c;
        ti.position = toc.ccnavmenus__Position__c;
        ti.miId = toc.ccnavmenus__Menu_Item__c;
        ti.openInNewWindow = (toc.ccnavmenus__Open_in_New_Window__c) ? 'Yes' : 'No';
        ti.isPublic = (toc.ccnavmenus__Public__c) ? 'Yes' : 'No' ;
        ti.expanded = expanded;
        ti.items = new List<treeItem2>();
        ti.itemsMap = new Map<String, treeItem2>();
        
        return ti;
    }

    private static treeItem2 createTreeItem2(ccnavmenus__Menu_Item__c toc, Boolean expanded)
    {
        treeItem2 ti = new treeItem2();
        ti.id = toc.Id;
        ti.label = toc.Name;
        ti.name = toc.ccnavmenus__URL__c;
        ti.icon = toc.ccnavmenus__SLDS_Icon__c;
        ti.iconPosition = toc.ccnavmenus__SLDS_Icon_Position__c;
        ti.href = toc.ccnavmenus__URL__c;
        ti.position = toc.ccnavmenus__Position__c;
        ti.miId = toc.ccnavmenus__Menu_Item__c;
        ti.openInNewWindow = (toc.ccnavmenus__Open_in_New_Window__c) ? 'Yes' : 'No';
        ti.isPublic = (toc.ccnavmenus__Public__c) ? 'Yes' : 'No' ;
        ti.expanded = expanded;
        ti.items = new List<treeItem3>();
        ti.itemsMap = new Map<String, treeItem3>();
        
        return ti;
    }

    private static treeItem3 createTreeItem3(ccnavmenus__Menu_Item__c toc, Boolean expanded)
    {
        treeItem3 ti = new treeItem3();
        ti.id = toc.Id;
        ti.label = toc.Name;
        ti.name = toc.ccnavmenus__URL__c;
        ti.icon = toc.ccnavmenus__SLDS_Icon__c;
        ti.iconPosition = toc.ccnavmenus__SLDS_Icon_Position__c;
        ti.href = toc.ccnavmenus__URL__c;
        ti.position = toc.ccnavmenus__Position__c;
        ti.miId = toc.ccnavmenus__Menu_Item__c;
        ti.openInNewWindow = (toc.ccnavmenus__Open_in_New_Window__c) ? 'Yes' : 'No';
        ti.isPublic = (toc.ccnavmenus__Public__c) ? 'Yes' : 'No' ;
        ti.expanded = expanded;
        ti.items = new List<treeItem4>();
        ti.itemsMap = new Map<String, treeItem4>();
        
        return ti;
    }

    private static treeItem4 createTreeItem4(ccnavmenus__Menu_Item__c toc, Boolean expanded)
    {
        treeItem4 ti = new treeItem4();
        ti.id = toc.Id;
        ti.label = toc.Name;
        ti.name = toc.ccnavmenus__URL__c;
        ti.icon = toc.ccnavmenus__SLDS_Icon__c;
        ti.iconPosition = toc.ccnavmenus__SLDS_Icon_Position__c;
        ti.href = toc.ccnavmenus__URL__c;
        ti.position = toc.ccnavmenus__Position__c;
        ti.miId = toc.ccnavmenus__Menu_Item__c;
        ti.openInNewWindow = (toc.ccnavmenus__Open_in_New_Window__c) ? 'Yes' : 'No';
        ti.isPublic = (toc.ccnavmenus__Public__c) ? 'Yes' : 'No' ;
        ti.expanded = expanded;
        ti.items = new List<treeItem5>();
        ti.itemsMap = new Map<String, treeItem5>();
        
        return ti;
    }

    private static treeItem5 createTreeItem5(ccnavmenus__Menu_Item__c toc, Boolean expanded)
    {
        treeItem5 ti = new treeItem5();
        ti.id = toc.Id;
        ti.label = toc.Name;
        ti.name = toc.ccnavmenus__URL__c;
        ti.icon = toc.ccnavmenus__SLDS_Icon__c;
        ti.iconPosition = toc.ccnavmenus__SLDS_Icon_Position__c;
        ti.href = toc.ccnavmenus__URL__c;
        ti.position = toc.ccnavmenus__Position__c;
        ti.miId = toc.ccnavmenus__Menu_Item__c;
        ti.openInNewWindow = (toc.ccnavmenus__Open_in_New_Window__c) ? 'Yes' : 'No';
        ti.isPublic = (toc.ccnavmenus__Public__c) ? 'Yes' : 'No' ;
        ti.expanded = expanded;
        ti.items = new List<treeItem6>();
        ti.itemsMap = new Map<String, treeItem6>();
        
        return ti;
    }

    private static treeItem6 createTreeItem6(ccnavmenus__Menu_Item__c toc, Boolean expanded)
    {
        treeItem6 ti = new treeItem6();
        ti.id = toc.Id;
        ti.label = toc.Name;
        ti.name = toc.ccnavmenus__URL__c;
        ti.icon = toc.ccnavmenus__SLDS_Icon__c;
        ti.iconPosition = toc.ccnavmenus__SLDS_Icon_Position__c;
        ti.href = toc.ccnavmenus__URL__c;
        ti.position = toc.ccnavmenus__Position__c;
        ti.miId = toc.ccnavmenus__Menu_Item__c;
        ti.openInNewWindow = (toc.ccnavmenus__Open_in_New_Window__c) ? 'Yes' : 'No';
        ti.isPublic = (toc.ccnavmenus__Public__c) ? 'Yes' : 'No' ;
        ti.expanded = expanded;
        
        return ti;
    }


public class treeItem
{
    public string id;
    
    public string label;

    public string name;

    public string icon;

    public string iconPosition;

    public string href;

    public string position;

    public string miId;

    public string openInNewWindow;

    public string isPublic;

    public boolean expanded;

    public List<treeItem2> items;

    public Map<String, treeItem2> itemsMap;
}

public class treeItem2
{
    public string id;
    
    public string label;

    public string name;

    public string icon;

    public string iconPosition;

    public string href;

    public string position;

    public string miId;

    public string openInNewWindow;

    public string isPublic;

    public boolean expanded;

    public List<treeItem3> items;

    public Map<String, treeItem3> itemsMap;
}

public class treeItem3
{
    public string id;
    
    public string label;

    public string name;

    public string icon;

    public string iconPosition;

    public string href;

    public string position;

    public string miId;

    public string openInNewWindow;

    public string isPublic;

    public boolean expanded;

    public List<treeItem4> items;

    public Map<String, treeItem4> itemsMap;
}

public class treeItem4
{
    public string id;
    
    public string label;

    public string name;

    public string icon;

    public string iconPosition;

    public string href;

    public string position;

    public string miId;

    public string openInNewWindow;

    public string isPublic;

    public boolean expanded;

    public List<treeItem5> items;

    public Map<String, treeItem5> itemsMap;

}

public class treeItem5
{
    public string id;
    
    public string label;

    public string name;

    public string icon;

    public string iconPosition;

    public string href;

    public string position;

    public string miId;

    public string openInNewWindow;

    public string isPublic;

    public boolean expanded;

    public List<treeItem6> items;

    public Map<String, treeItem6> itemsMap;

}

public class treeItem6
{
    public string id;
    
    public string label;

    public string name;

    public string icon;

    public string iconPosition;

    public string href;

    public string position;

    public string miId;

    public string openInNewWindow;

    public string isPublic;

    public boolean expanded;

}


}