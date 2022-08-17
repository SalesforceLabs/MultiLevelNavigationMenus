import { addOverflowMenu } from '../overflow';

describe('overflow module', () => {
    describe('overflowItems', () => {
        it('should push menu items on to the overflow item as soon as the sum of the widths becomes greater than the available width', () => {
            const of1 = { label: 'of1' };
            const of2 = { label: 'of2' };
            const mi1 = { label: 'mi1' };
            const mi2 = { label: 'mi2' };
            const menuItems = [mi1, mi2, of1, of2];
            expect(addOverflowMenu(menuItems, [5, 5, 5, 5], 10)).toEqual([
                [mi1, mi2],
                [of1, of2]
            ]);
        });

        it('should do nothing if all widths fit in the available width', () => {
            expect(addOverflowMenu([{}, {}, {}, {}], [5, 5, 5, 5], 20)).toEqual(
                [[{}, {}, {}, {}], []]
            );
        });
    });
});