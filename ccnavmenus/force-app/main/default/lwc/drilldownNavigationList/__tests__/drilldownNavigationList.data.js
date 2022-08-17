export const menuItems = [
    {
        id: '0',
        label: 'Drinks',
        href: '/ernie/s/category/drinks/0ZGRM0000004LIH',
        type: 'SubMenuButton',
        active: false,
        subMenu: [
            {
                id: '1',
                label: 'Energy Drinks',
                href: '/ernie/s/category/drinks/energy-drinks/0ZGRM0000004LIH',
                type: 'InternalLink',
                active: false
            },
            {
                id: '2',
                label: 'Coffee',
                href: '/ernie/s/category/drinks/coffee-2/0ZGRM0000004LLw',
                type: 'SubMenuButton',
                active: false,
                subMenu: [
                    {
                        id: '3',
                        label: 'Coffee 2.1',
                        active: false,
                        href: '/ernie/s/category/drinks/coffee-2/coffee-21/0ZGRM0000004LLw',
                        type: 'InternalLink'
                    }
                ]
            }
        ]
    },
    {
        id: '4',
        label: 'Energy',
        active: false,
        href: undefined,
        type: 'SubMenuButton',
        subMenu: [
            {
                id: '5',
                type: 'InternalLink',
                href: '/ernie/s/category/energy/energy-bars/0ZGRM0000004LIG',
                label: 'Energy Bars',
                active: false
            },
            {
                id: '6',
                type: 'InternalLink',
                href: '/ernie/s/category/energy/energy-gels/0ZGRM0000004LII',
                label: 'Energy Gels',
                active: false
            }
        ]
    },
    {
        id: '7',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/0ZGRM0000000CA3',
        label: 'Products 1'
    }
];

export const parentItem = {
    id: '0.0',
    label: 'Top Level',
    href: '/ernie/s/category/top',
    active: false,
    subMenu: menuItems
};