/* eslint-disable prettier/prettier */
import { createElement } from 'lwc';
import DrilldownNavigationBar from '../drilldownNavigationBar';
import { querySelector, querySelectorAll } from 'kagekiri';
import {
    additionalItemWithChild,
    menuItems
} from './drilldownNavigationBar.data';
import barStylesStringGenerator from '../barStylesStringGenerator';

jest.mock('community_runtime/utils', () => {
    return {
        debounce: jest.fn().mockImplementation((fn) => {
            return fn;
        })
    };
});

describe('community_navigation/drilldownNavigationBar', () => {
    let element;
    beforeEach(() => {
        element = createElement(
            'community_navigation-drilldown-navigation-bar',
            { is: DrilldownNavigationBar }
        );

        element.menuItems = menuItems;
        document.body.appendChild(element);
        return element;
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('@api', () => {
        describe('menuItems', () => {
            [null, undefined, NaN, {}, 1, 2.0, 'invalid'].forEach((value) => {
                it(`should not allow invalid value '${value}'`, () => {
                    element.menuItems = value;
                    expect(element.menuItems).toEqual([]);
                });
            });
            it('should set array to private variable', () => {
                const menuItem = [{ id: 1 }];
                element.menuItems = menuItem;
                expect(element.menuItems).toEqual(menuItem);
            });
        });
        describe('backButton', () => {
            it(`should allow string values`, () => {
                element.backButtonLabel = 'Parent Category';

                expect(element.backButtonLabel).toEqual('Parent Category');
            });
        });
        describe('menuAlignment', () => {
            [null, undefined, NaN, 1, 2.0, 'invalid'].forEach((value) => {
                it(`should not allow '${value}' as value`, () => {
                    element.menuAlignment = value;

                    expect(element.menuAlignment).toEqual('left');
                });
            });
            ['left', 'right', 'center'].forEach((value) => {
                it(`should allow alignment value '${value}'`, () => {
                    element.menuAlignment = value;

                    expect(element.menuAlignment).toEqual(value);
                });
            });
        });
        describe('showAppLauncher', () => {
            [true, false].forEach((value) => {
                it(`should allow boolean values`, () => {
                    element.showAppLauncher = value;

                    expect(element.showAppLauncher).toEqual(value);
                });
            });
        });
    });

    describe('menuAlignment classes', () => {
        it('should set slds-grid_align-center on the parent ul for alignment center', async () => {
            element.menuAlignment = 'center';

            await Promise.resolve();
            const ul = querySelector('ul');

            expect(ul).toBeDefined();

            expect(ul.classList.contains('slds-grid_align-center')).toBeTrue();
        });

        it('should set slds-grid_align-end on the parent ul for alignment right', async () => {
            element.menuAlignment = 'right';

            await Promise.resolve();
            const ul = querySelector('ul');

            expect(ul).toBeDefined();

            expect(ul.classList.contains('slds-grid_align-end')).toBeTrue();
        });

        it('should set no additional class on the parent ul for alignment left', async () => {
            element.menuAlignment = 'left';

            await Promise.resolve();
            const ul = querySelector('ul');

            expect(ul).toBeDefined();

            expect(ul.classList.length === 3).toBeTrue();

            expect(ul.classList.contains('slds-grid_align-end')).toBeFalse();
        });

        it('should should allow switching between alignments', async () => {
            element.menuAlignment = 'right';

            await Promise.resolve();
            const ul = querySelector('ul');

            expect(ul).toBeDefined();

            expect(ul.classList.contains('slds-grid_align-end')).toBeTrue();

            element.menuAlignment = 'center';

            await Promise.resolve();

            expect(ul.classList.contains('slds-grid_align-center')).toBeTrue();
        });
    });

    describe('custom styles', () => {
        let navigationBarStyleSpy;
        beforeEach(() => {
            navigationBarStyleSpy = jest.spyOn(
                barStylesStringGenerator,
                'createForStyles'
            );
        });

        it('should not apply any styles when custom styles are not provided', () => {
            return Promise.resolve().then(() => {
                expect(navigationBarStyleSpy).not.toHaveBeenCalled();
            });
        });

        it('sets the item style when custom styles are provided', () => {
            const customThemeStyles = { background: 'red' };
            element.customThemeStylesBar = customThemeStyles;

            return Promise.resolve().then(() => {
                expect(navigationBarStyleSpy).toHaveBeenLastCalledWith(
                    expect.objectContaining(customThemeStyles),
                    expect.anything(),
                    expect.anything()
                );
            });
        });

        it(`should apply and remove the hover styles when mouse over and off the menu item`, async () => {
            const customThemeStyles = {
                'background-color': 'rgb(0, 36, 169)',
                'background-hover': 'rgb(255, 99, 71)'
            };
            element.customThemeStylesBar = customThemeStyles;

            // Fire the "mouseenter" event to simulate the mouse moving over the menu item.
            let menuItem = querySelector('.slds-list__item button');
            menuItem.dispatchEvent(new CustomEvent('mouseover'));

            expect(menuItem.style.getPropertyValue('background-color')).toBe(
                customThemeStyles['background-hover']
            );

            menuItem.dispatchEvent(new CustomEvent('mouseout'));

            expect(menuItem.style.getPropertyValue('background-color')).toBe(
                customThemeStyles['background-color']
            );
        });

        it(`should not apply any hover styles when there are no customThemeStyles`, async () => {
            let menuItem = querySelector('.slds-list__item button');

            menuItem.dispatchEvent(new CustomEvent('mouseover'));
            expect(menuItem.style.getPropertyValue('background-color')).toBe(
                ''
            );

            menuItem.dispatchEvent(new CustomEvent('mouseout'));
            expect(menuItem.style.getPropertyValue('background-color')).toBe(
                ''
            );
        });
    });

    describe('handleParentClick', () => {
        it('should toggle the submenu', async () => {
            const parent = querySelector('.slds-list__item button');

            parent?.click();

            await Promise.resolve();

            const submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list li'
            );

            expect(submenu.length).toEqual(3);

            parent?.click();

            await Promise.resolve();

            const emptySubMenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list li'
            );

            expect(emptySubMenu).toBeEmpty();
        });
    });

    describe('handleLeafClick', () => {
        let navigateListener;
        beforeEach(() => {
            navigateListener = jest.fn();
            element.addEventListener('navigatetopage', navigateListener);
        });
        it('should dispatch navigatetopage event', async () => {
            const leaf = querySelector('.slds-list__item a');

            leaf?.click();

            await Promise.resolve();
            expect(navigateListener).toHaveBeenCalledOnce();
        });
        it('should close menu when parent was clicked before', async () => {
            const leaf = querySelector('.slds-list__item a');
            const parent = querySelector('.slds-list__item button');

            parent?.click();

            await Promise.resolve();

            const submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list li'
            );

            expect(submenu.length).toEqual(3);

            leaf?.click();

            await Promise.resolve();
            const emptySubMenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list li'
            );

            expect(emptySubMenu).toBeEmpty();
        });
    });

    describe('handleNavClick', () => {
        it('should close subMenus', async () => {
            const bar = querySelector('[role=menubar]');
            const parent = querySelector('.slds-list__item button');

            parent?.click();

            await Promise.resolve();
            const submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list li'
            );
            expect(submenu.length).toEqual(3);

            bar?.click();

            await Promise.resolve();
            const emptySubMenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list li'
            );
            expect(emptySubMenu).toBeEmpty();
        });
    });

    describe('closeSubMenus', () => {
        it('should close subMenus', async () => {
            element.menuItems = menuItems;

            await Promise.resolve();
            const parent = querySelector('.slds-list__item button');

            parent?.click();

            await Promise.resolve();

            const submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list'
            );

            const event = new CustomEvent('closesubmenus', {
                detail: { parentItemId: '0' }
            });

            submenu[0].dispatchEvent(event);

            await Promise.resolve();

            const emptySubMenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list li'
            );

            expect(emptySubMenu).toBeEmpty();
        });
    });

    describe('showAppLauncher', () => {
        let appLauncherListener;
        beforeEach(() => {
            appLauncherListener = jest.fn();
            element.addEventListener('showapplauncher', appLauncherListener);
        });

        it('be hidden by default', async () => {
            await Promise.resolve();

            const icon = querySelector('lightning-dynamic-icon');

            expect(icon).toBeNull();
        });
        it('be visible when set to true', async () => {
            element.showAppLauncher = 'true';

            await Promise.resolve();
            const appLauncher = querySelector('lightning-dynamic-icon');

            expect(appLauncher).not.toBeNull();
        });
        it('should dispatch showapplauncher event on click', async () => {
            element.showAppLauncher = 'true';

            await Promise.resolve();
            const appIcon = querySelector('lightning-dynamic-icon');

            appIcon?.click();

            expect(appLauncherListener).toHaveBeenCalledOnce();
        });
    });

    // describe('overflowMenu', () => {
    //     beforeEach(async() => {
    //         element.menuItems = [...menuItems, ...moreMenuItems];
    //         await Promise.resolve();
    //     });
    //
    //     it('should show the more menu', async() => {
    //         /*
    //          We need to mock out all the methods and props that we use to determine the width because
    //          jsdom doesn't do that for us.
    //         */
    //         // const querySelectorSpy = jest.spyOn(element.template, 'querySelector');
    //         // querySelectorSpy.mockImplementation(() => ({
    //         //     getBoundingClientRect: () => ({ width: 15 })
    //         // }));
    //
    //         // eslint-disable-next-line @lwc/lwc/no-document-query
    //         const getBoundClientRectSpy = jest.spyOn(LightningElement.prototype, 'getBoundingClientRect');
    //         getBoundClientRectSpy.mockReturnValue({width: 15});
    //
    //
    //
    //         const buttons = querySelectorAll('.slds-list__item a');
    //
    //         const lis = querySelectorAll('nav ul > li');
    //
    //
    //         expect(lis.length).toBeLessThan(element.menuItems.length);
    //     })
    // });

    describe('keyboardControls', () => {
        let navigateListener;
        beforeEach(() => {
            navigateListener = jest.fn();
            element.addEventListener('navigatetopage', navigateListener);
        });
        ['Enter', ' ', 'ArrowDown', 'ArrowUp'].forEach((value) => {
            it(`should open submenu on "${value}"`, async () => {
                await Promise.resolve();
                const parent = querySelector('.slds-list__item button');
                const lastItem = querySelectorAll(
                    '.slds-list__item [role="menuitem"]'
                )[2];

                lastItem.focus();

                const event = new KeyboardEvent('keydown', { key: value });
                parent.dispatchEvent(event);

                await Promise.resolve();

                const submenu = querySelectorAll(
                    'community_navigation-drilldown-navigation-list li'
                );

                expect(submenu.length).toEqual(3);
            });
        });
        ['Enter', ' ', 'ArrowDown', 'ArrowUp'].forEach((value) => {
            it(`should do nothing on "${value}" when item is leaf`, async () => {
                await Promise.resolve();
                const leaf = querySelector('.slds-list__item a');
                const lastItem = querySelectorAll(
                    '.slds-list__item [role="menuitem"]'
                )[2];

                lastItem.focus();

                const event = new KeyboardEvent('keydown', { key: value });
                leaf.dispatchEvent(event);

                await Promise.resolve();

                const submenu = querySelectorAll(
                    'community_navigation-drilldown-navigation-list li'
                );

                expect(submenu.length).toEqual(0);
            });
        });
        ['Enter', ' '].forEach((value) => {
            it(`should navigate to category on "${value}"`, async () => {
                await Promise.resolve();
                const parent = querySelector('.slds-list__item a');

                const event = new KeyboardEvent('keydown', { key: value });
                parent.dispatchEvent(event);

                await Promise.resolve();

                const submenu = querySelectorAll(
                    'community_navigation-drilldown-navigation-list li'
                );

                expect(submenu.length).toEqual(0);
                expect(navigateListener).toHaveBeenCalledOnce();
            });
        });
        [
            { key: 'ArrowRight', current: 0, next: 1 },
            { key: 'ArrowRight', current: 1, next: 2 },
            {
                key: 'ArrowRight',
                current: 2,
                next: 0
            },
            { key: 'ArrowLeft', current: 0, next: 2 },
            { key: 'ArrowLeft', current: 1, next: 0 },
            {
                key: 'ArrowLeft',
                current: 2,
                next: 1
            }
        ].forEach(({ key, current, next }) => {
            it(`should set focus to item nr ${next} on ${key}`, async () => {
                const parents = querySelectorAll(
                    '.slds-list__item [role="menuitem"]'
                );
                const focusCurrentSpy = jest.spyOn(parents[current], 'focus');
                const focusNextSpy = jest.spyOn(parents[next], 'focus');

                parents[current].focus();

                focusCurrentSpy.mockClear();

                const event = new KeyboardEvent('keydown', { key: key });
                parents[current].dispatchEvent(event);

                await Promise.resolve();

                expect(focusCurrentSpy).not.toHaveBeenCalled();
                expect(focusNextSpy).toHaveBeenCalled();
            });
            it(`should set focus to item nr ${next} on ${key} when it was clicked before`, async () => {
                const parents = querySelectorAll(
                    '.slds-list__item [role="menuitem"]'
                );
                const focusCurrentSpy = jest.spyOn(parents[current], 'focus');
                const focusNextSpy = jest.spyOn(parents[next], 'focus');

                // only button items have a child submenu that can be open and closed
                if (parents[current].nodeName === 'BUTTON') {
                    parents[current].click();
                    await Promise.resolve();
                    parents[current].click();
                    await Promise.resolve();
                } else {
                    parents[current].focus();
                }

                focusCurrentSpy.mockClear();

                const event = new KeyboardEvent('keydown', { key: key });
                parents[current].dispatchEvent(event);

                await Promise.resolve();

                expect(focusCurrentSpy).not.toHaveBeenCalled();
                expect(focusNextSpy).toHaveBeenCalled();
            });
        });

        [
            { key: 'ArrowRight', current: 0, next: 1 },
            { key: 'ArrowRight', current: 1, next: 2 },
            {
                key: 'ArrowRight',
                current: 3,
                next: 0
            },
            { key: 'ArrowLeft', current: 0, next: 3 },
            { key: 'ArrowLeft', current: 3, next: 2 }
        ].forEach(({ key, current, next }) => {
            it(`should focus next parent item on ${key} when submenu ${current} is open and focussed`, async () => {
                element.menuItems = [...menuItems, additionalItemWithChild];

                await Promise.resolve();
                const parents = querySelectorAll(
                    '.slds-list__item [role="menuitem"]'
                );

                parents[current].click();

                await Promise.resolve();

                const submenu = querySelector(
                    'community_navigation-drilldown-navigation-list'
                );

                expect(submenu).not.toBeNull();

                const focusCurrentSpy = jest.spyOn(parents[current], 'focus');
                const focusNextSpy = jest.spyOn(parents[next], 'focus');

                const event = new CustomEvent('leftrightarrowkeysubmenu', {
                    detail: {
                        parentItemId: element.menuItems[current].id,
                        key: key
                    }
                });
                submenu.dispatchEvent(event);

                expect(focusCurrentSpy).not.toHaveBeenCalled();
                expect(focusNextSpy).toHaveBeenCalled();
            });
        });

        ['Home', 'PageUp'].forEach((value) => {
            it(`should focus first item on "${value}"`, async () => {
                const parents = querySelectorAll(
                    '.slds-list__item [role="menuitem"]'
                );

                parents[2].focus();

                await Promise.resolve();

                const focusFirstSpy = jest.spyOn(parents[0], 'focus');
                const focusSecondSpy = jest.spyOn(parents[1], 'focus');
                const focusThirdSpy = jest.spyOn(parents[2], 'focus');

                const event = new KeyboardEvent('keydown', { key: value });
                parents[0].dispatchEvent(event);

                await Promise.resolve();

                expect(focusFirstSpy).toHaveBeenCalled();
                expect(focusSecondSpy).not.toHaveBeenCalled();
                expect(focusThirdSpy).not.toHaveBeenCalled();
            });
        });
        ['End', 'PageDown'].forEach((value) => {
            it(`should focus last item on "${value}"`, async () => {
                const parents = querySelectorAll(
                    '.slds-list__item [role="menuitem"]'
                );

                parents[1].focus();

                await Promise.resolve();

                const focusFirstSpy = jest.spyOn(parents[0], 'focus');
                const focusSecondSpy = jest.spyOn(parents[1], 'focus');
                const focusThirdSpy = jest.spyOn(parents[2], 'focus');

                const event = new KeyboardEvent('keydown', { key: value });
                parents[0].dispatchEvent(event);

                await Promise.resolve();

                expect(focusFirstSpy).not.toHaveBeenCalled();
                expect(focusSecondSpy).not.toHaveBeenCalled();
                expect(focusThirdSpy).toHaveBeenCalled();
            });
        });
        ['Esc', 'Escape'].forEach((value) => {
            it(`should close submenus on "${value}"`, async () => {
                const parents = querySelectorAll(
                    '.slds-list__item [role="menuitem"]'
                );

                parents[1].click();

                await Promise.resolve();

                const submenu = querySelectorAll(
                    'community_navigation-drilldown-navigation-list'
                );

                expect(submenu.length).not.toBeNull();

                const event = new KeyboardEvent('keydown', { key: value });
                parents[0].dispatchEvent(event);

                await Promise.resolve();

                const emptySubMenu = querySelectorAll(
                    'community_navigation-drilldown-navigation-list li'
                );

                expect(emptySubMenu).toBeEmpty();
            });
        });
        it('should do nothing for other key events', async () => {
            const parents = querySelectorAll(
                '.slds-list__item [role="menuitem"]'
            );

            parents[1].click();

            await Promise.resolve();

            const submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list'
            );

            expect(submenu.length).not.toBeNull();

            const event = new KeyboardEvent('keydown', { key: 'ctrl' });
            parents[1].dispatchEvent(event);

            await Promise.resolve();

            const emptySubMenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list li'
            );

            expect(emptySubMenu).not.toBeEmpty();
        });
    });

    describe('focus', () => {
        it('should focus parent item when submenu is closed', async () => {
            const parent = querySelector('.slds-list__item button');

            parent?.click();

            const focusSpy = jest.spyOn(parent, 'focus');

            await Promise.resolve();

            const submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list'
            );

            const event = new CustomEvent('closesubmenus', {
                detail: { parentItemId: '0' }
            });

            submenu[0].dispatchEvent(event);

            await Promise.resolve();

            expect(focusSpy).toHaveBeenCalled();
        });
    });

    describe('overflow', () => {
        let getBoundingClientRect;
        const mockWindowWidth = (width) => {
            window.innerWidth = width;
        };
        beforeAll(() => {
            getBoundingClientRect = Element.prototype.getBoundingClientRect;
            Element.prototype.getBoundingClientRect = jest
                .fn()
                .mockReturnValue({
                    width: 50
                });
            mockWindowWidth(300);
        });

        afterAll(() => {
            Element.prototype.getBoundingClientRect = getBoundingClientRect;
        });

        it('should calculate overflow items', () => {
            const parents = querySelectorAll(
                '.slds-list__item [role="menuitem"]'
            );

            expect(parents.length).toBe(1);
        });

        it('should recalculate overflow on resize', async () => {
            mockWindowWidth(500);
            Element.prototype.getBoundingClientRect = jest
                .fn()
                .mockReturnValueOnce({
                    width: 300
                })
                .mockReturnValue({
                    width: 50
                });
            window.dispatchEvent(new CustomEvent('resize'));

            await Promise.resolve();
            const parents = querySelectorAll(
                '.slds-list__item [role="menuitem"]'
            );

            expect(parents.length).toBe(3);
        });

        it('should recalculate overflow on resize using window width', async () => {
            mockWindowWidth(40);
            window.dispatchEvent(new CustomEvent('resize'));

            await Promise.resolve();
            const parents = querySelectorAll(
                '.slds-list__item [role="menuitem"]'
            );

            expect(parents.length).toBe(1);
        });

        it('should not recalculate overflow on resize when size has not changed', async () => {
            window.dispatchEvent(new CustomEvent('resize'));

            await Promise.resolve();
            const parents = querySelectorAll(
                '.slds-list__item [role="menuitem"]'
            );

            expect(parents.length).toBe(1);
        });
    });

    describe('outsideClickListener', () => {
        it('should close sub menu when click event was dispatched outside of the component', async () => {
            const parent = querySelectorAll('.slds-list__item button')[1];

            parent?.click();
            await Promise.resolve();

            let submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list'
            );

            expect(parent.getAttribute('tabindex')).toBe('0');
            expect(submenu.length).not.toBe(0);
            document.dispatchEvent(new CustomEvent('click'));
            await Promise.resolve();

            submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list'
            );

            expect(parent.getAttribute('tabindex')).toBe('-1');
            expect(submenu.length).toBe(0);
        });

        it('should do nothing when click event was dispatched inside the component template', async () => {
            const parent = querySelector('.slds-list__item button');
            const navParent = querySelector('nav').parentNode;
            const button = document.createElement(`BUTTON`);
            navParent.appendChild(button);

            parent?.click();
            await Promise.resolve();

            let submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list'
            );

            expect(submenu.length).not.toBe(0);
            button.click();
            await Promise.resolve();

            submenu = querySelectorAll(
                'community_navigation-drilldown-navigation-list'
            );

            expect(submenu.length).toBe(1);
        });
    });
});