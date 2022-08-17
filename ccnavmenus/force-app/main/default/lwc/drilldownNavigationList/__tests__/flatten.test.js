import { flattenItems } from '../flatten';

describe('flatten', () => {
    it('should flatten a nested object with submenus into a flat list of objects', () => {
        const data = [
            { id: 'a', subMenu: [{ id: 'aa' }, { id: 'ab' }] },
            { id: 'b' },
            {
                id: 'c',
                subMenu: [
                    {
                        id: 'ca',
                        subMenu: [{ id: 'caa', subMenu: [{ id: 'caaa' }] }]
                    }
                ]
            },
            { id: 'd' }
        ];
        const result = {
            a: {
                id: 'a',
                subMenu: [{ id: 'aa' }, { id: 'ab' }]
            },
            aa: { id: 'aa' },
            ab: { id: 'ab' },
            b: { id: 'b' },
            c: {
                id: 'c',
                subMenu: [
                    {
                        id: 'ca',
                        subMenu: [{ id: 'caa', subMenu: [{ id: 'caaa' }] }]
                    }
                ]
            },
            ca: {
                id: 'ca',
                subMenu: [{ id: 'caa', subMenu: [{ id: 'caaa' }] }]
            },
            caa: { id: 'caa', subMenu: [{ id: 'caaa' }] },
            caaa: { id: 'caaa' },
            d: { id: 'd' }
        };

        expect(flattenItems(data)).toEqual(result);
    });
});