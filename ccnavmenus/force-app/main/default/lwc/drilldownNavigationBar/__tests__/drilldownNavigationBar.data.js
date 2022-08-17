export const menuItems = [
    {
        id: '0',
        label: 'Drinks',
        href: undefined,
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
                href: undefined,
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
        label: 'Products'
    }
];

export const additionalItemWithChild = {
    id: '8',
    label: 'Milk',
    active: false,
    href: undefined,
    type: 'SubMenuButton',
    subMenu: [
        {
            id: '9',
            type: 'InternalLink',
            href: '/ernie/s/milk/soy/0ZGRM0000004LIG',
            label: 'Soy Milk',
            active: false
        },
        {
            id: '10',
            type: 'InternalLink',
            href: '/ernie/s/milk/oat/0ZGRM0000004LII',
            label: 'Oat Milk',
            active: false
        }
    ]
};

export const moreMenuItems = [
    {
        id: '8',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/8',
        label: 'Products'
    },
    {
        id: '9',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/9',
        label: 'Products'
    },
    {
        id: '10',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/10',
        label: 'Products'
    },
    {
        id: '11',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/11',
        label: 'Products'
    },
    {
        id: '12',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/12',
        label: 'Products'
    },
    {
        id: '13',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/13',
        label: 'Products'
    },
    {
        id: '14',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/14',
        label: 'Products'
    },
    {
        id: '15',
        type: 'InternalLink',
        active: false,
        href: '/ernie/s/category/products/15',
        label: 'Products'
    }
];