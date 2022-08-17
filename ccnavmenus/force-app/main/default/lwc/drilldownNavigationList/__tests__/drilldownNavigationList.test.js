import { createElement } from 'lwc';
import { menuItems, parentItem } from './drilldownNavigationList.data';
import DrilldownNavigationList from '../drilldownNavigationList';
import { querySelector, querySelectorAll } from 'kagekiri';
import listStylesStringGenerator from '../listStylesStringGenerator';

describe('community_navigation/drilldownNavigationList', () => {
    let element;
    beforeEach(() => {
        element = createElement(
            'community_navigation-drilldown-navigation-list',
            { is: DrilldownNavigationList }
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
            it('should set items', () => {
                expect(element.menuItems).toEqual(menuItems);
                element.menuItems = [];
                expect(element.menuItems).toEqual([]);
            });
        });
        describe('parentItem', () => {
            it('should set parent item', () => {
                expect(element.parentItem).toEqual({});
                element.parentItem = menuItems[0];
                expect(element.parentItem).toEqual(menuItems[0]);
            });
        });
        describe('focusOnFirstItem', () => {
            it('should set boolean value', () => {
                expect(element.focusOnFirstItem).toBeFalsy();
                element.focusOnFirstItem = true;
                expect(element.focusOnFirstItem).toBeTruthy();
            });
        });
        describe('focusOnLastItem', () => {
            it('should set boolean value', () => {
                expect(element.focusOnLastItem).toBeFalsy();
                element.focusOnLastItem = true;
                expect(element.focusOnLastItem).toBeTruthy();
            });
        });
        describe('isMobileView', () => {
            it('should set boolean value', () => {
                expect(element.isMobileView).toBeFalsy();
                element.isMobileView = true;
                expect(element.isMobileView).toBeTruthy();
            });
        });
        describe('showBackLabel', () => {
            it('should set boolean value', () => {
                expect(element.showBackLabel).toBeFalsy();
                element.showBackLabel = true;
                expect(element.showBackLabel).toBeTruthy();
            });
        });
    });

    describe('custom styles', () => {
        let navigationListStyleSpy;
        beforeEach(() => {
            navigationListStyleSpy = jest.spyOn(
                listStylesStringGenerator,
                'createForStyles'
            );
        });

        it('should not apply any styles when custom styles are not provided', () => {
            return Promise.resolve().then(() => {
                expect(navigationListStyleSpy).not.toHaveBeenCalled();
            });
        });

        it('sets the item style when custom styles are provided', () => {
            const customThemeStyles = { color: 'red' };
            element.customThemeStyles = customThemeStyles;

            return Promise.resolve().then(() => {
                expect(navigationListStyleSpy).toHaveBeenCalledWith(
                    expect.objectContaining(customThemeStyles),
                    expect.anything()
                );
            });
        });

        it(`should apply and remove the hover styles when mouse over and off the menu item`, async () => {
            const customThemeStyles = {
                'background-color': 'rgb(0, 36, 169)',
                'background-hover': 'rgb(255, 99, 71)'
            };
            element.customThemeStyles = customThemeStyles;

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

    describe('handleFocusOut', () => {
        let closeSubmenuListener;
        beforeEach(() => {
            closeSubmenuListener = jest.fn();
            element.addEventListener('closesubmenus', closeSubmenuListener);
        });

        it(`should not close when focus out to the top level menu item`, () => {
            return Promise.resolve()
                .then(() => {
                    querySelector('.slds-list__item button').click();
                })
                .then(() => {
                    querySelector('ul').dispatchEvent(
                        new CustomEvent('focusout', {})
                    );
                })
                .then(() => {
                    expect(closeSubmenuListener).not.toHaveBeenCalledOnce();
                });
        });

        it(`should close when focus out of the menu item`, () => {
            return Promise.resolve()
                .then(() => {
                    querySelector('.slds-list__item button').click();
                })
                .then(() => {
                    const event = new FocusEvent('focusout', {
                        relatedTarget: document.body
                    });
                    querySelector('ul').dispatchEvent(event);
                })
                .then(() => {
                    expect(closeSubmenuListener).toHaveBeenCalledOnce();
                });
        });
    });

    describe('handleCloseClick', () => {
        let closeSubmenuListener;
        beforeEach(() => {
            closeSubmenuListener = jest.fn();
            element.addEventListener('closesubmenus', closeSubmenuListener);
        });
        it('should dispatch navigatetopage event', async () => {
            element.isMobileView = true;
            await Promise.resolve();
            const closeButton = querySelector(
                '.comm-drilldown-navigation__close-button'
            );

            closeButton?.click();

            await Promise.resolve();
            expect(closeSubmenuListener).toHaveBeenCalledOnce();
        });
    });

    describe('handleParentClick', () => {
        it('should drill down to submenu and remove animation styling', async () => {
            element.parentItem = menuItems[0];
            const parent = querySelector('.slds-list__item button');

            parent?.click();

            await Promise.resolve();

            let animation = querySelector(
                '.comm-drilldown-navigation__slideRightToLeft'
            );
            expect(animation).toBeTruthy();
            animation.dispatchEvent(new CustomEvent('animationend'));
            expect(animation.classList).not.toContain(
                '.comm-drilldown-navigation__slideRightToLeft'
            );

            const listItems = querySelectorAll('.slds-list__item');
            expect(listItems.length).toBe(2);
        });
    });
    describe('handleBack', () => {
        it('should drill down to submenu and go back and remove animation styling', async () => {
            element.showBackLabel = true;
            let parent = querySelector('.slds-list__item button');
            parent?.click();
            await Promise.resolve();

            const back = querySelectorAll('li button');
            parent = querySelectorAll('.slds-list__item');

            expect(parent.length).toBe(2);
            back[0].click();

            await Promise.resolve();

            let animation = querySelector(
                '.comm-drilldown-navigation__slideLeftToRight'
            );
            expect(animation).toBeTruthy();
            animation.dispatchEvent(new CustomEvent('animationend'));
            expect(animation.classList).not.toContain(
                '.comm-drilldown-navigation__slideLeftToRight'
            );

            parent = querySelectorAll('.slds-list__item');
            expect(parent.length).toBe(3);
        });
    });
    describe('handleAllClick', () => {
        it('should fire navigation event', async () => {
            const navigateListener = jest.fn();
            const closeListener = jest.fn();
            element.addEventListener('navigatetopage', navigateListener);
            element.addEventListener('closesubmenus', closeListener);
            const parent = querySelector('.slds-list__item button');

            parent?.click();

            await Promise.resolve();
            const all = querySelector('li:not(.slds-list__item) a');
            all?.click();
            await Promise.resolve();

            expect(navigateListener).toHaveBeenCalledOnce();
            expect(closeListener).toHaveBeenCalledOnce();
        });
    });
    describe('handleLeafClick', () => {
        let navigateListener;
        let closeListener;
        beforeEach(() => {
            navigateListener = jest.fn();
            closeListener = jest.fn();
            element.addEventListener('navigatetopage', navigateListener);
            element.addEventListener('closesubmenus', closeListener);
        });
        it('should dispatch navigatetopage event', async () => {
            element.parentItem = parentItem;
            const leaf = querySelector('.slds-list__item a');

            leaf?.click();

            await Promise.resolve();
            expect(navigateListener).toHaveBeenCalledOnce();
            expect(closeListener).toHaveBeenCalledOnce();
        });
    });

    describe('key events', () => {
        describe('handleBackKeyDown', () => {
            let parent;
            let closeListener;
            beforeEach(async () => {
                closeListener = jest.fn();
                element.addEventListener('closesubmenus', closeListener);
                parent = querySelector('.slds-list__item button');
                parent?.click();
                await Promise.resolve();
            });
            ['Enter', ' ', 'ArrowLeft', 'Esc', 'Escape'].forEach((key) => {
                it('should go back', async () => {
                    const back = querySelector('li button');
                    const event = new KeyboardEvent('keydown', { key });

                    back.dispatchEvent(event);
                    await Promise.resolve();

                    parent = querySelectorAll('.slds-list__item');
                    expect(parent.length).toBe(3);
                });
            });

            it('should close submenu and fire event', async () => {
                const keyListener = jest.fn();
                element.addEventListener(
                    'leftrightarrowkeysubmenu',
                    keyListener
                );

                const back = querySelector('li button');
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowRight'
                });

                back.dispatchEvent(event);
                await Promise.resolve();

                expect(keyListener).toHaveBeenCalled();
            });
        });
        describe('handleAllKeyDown', () => {
            let parent;
            let navigateListener;
            let keyListener;
            let closeListener;
            beforeEach(async () => {
                navigateListener = jest.fn();
                keyListener = jest.fn();
                closeListener = jest.fn();
                element.addEventListener(
                    'leftrightarrowkeysubmenu',
                    keyListener
                );
                element.addEventListener('navigatetopage', navigateListener);
                element.addEventListener('closesubmenus', closeListener);
                parent = querySelector('.slds-list__item button');
                parent?.click();
                await Promise.resolve();
            });
            ['Enter', ' '].forEach((key) => {
                it('should navigate', async () => {
                    const all = querySelector('li a');
                    const event = new KeyboardEvent('keydown', { key });

                    all.dispatchEvent(event);
                    await Promise.resolve();

                    expect(navigateListener).toHaveBeenCalled();
                    expect(closeListener).toHaveBeenCalled();
                });
            });
            it('should close list and fire event on ArrowRight', async () => {
                const all = querySelector('li:not(.slds-list__item) a');
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowRight'
                });

                all.dispatchEvent(event);
                await Promise.resolve();

                expect(keyListener).toHaveBeenCalled();
            });
            it('should close list and fire event on ArrowLeft', async () => {
                element.parentItem = parentItem;
                let all = querySelector('li:not(.slds-list__item) a');
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowLeft'
                });

                all.dispatchEvent(event);
                await Promise.resolve();

                parent = querySelectorAll('.slds-list__item');
                expect(parent.length).toBe(2);

                all = querySelector('li:not(.slds-list__item) a');
                all.dispatchEvent(event);
                await Promise.resolve();

                expect(keyListener).toHaveBeenCalled();
            });
            ['Esc', 'Escape'].forEach((key) => {
                it(`should close list and fire event on "${key}"`, async () => {
                    element.parentItem = parentItem;
                    let all = querySelector('li:not(.slds-list__item) a');
                    const event = new KeyboardEvent('keydown', {
                        key
                    });

                    all.dispatchEvent(event);
                    await Promise.resolve();

                    parent = querySelectorAll('.slds-list__item');
                    expect(parent.length).toBe(2);

                    all = querySelector('li:not(.slds-list__item) a');
                    all.dispatchEvent(event);
                    await Promise.resolve();

                    expect(closeListener).toHaveBeenCalled();
                });
            });
        });
        describe('handleParentKeyDown', () => {
            let parent;
            let keyListener;
            let closeListener;
            beforeEach(async () => {
                keyListener = jest.fn();
                closeListener = jest.fn();
                element.addEventListener(
                    'leftrightarrowkeysubmenu',
                    keyListener
                );
                element.addEventListener('closesubmenus', closeListener);
                parent = querySelector('.slds-list__item button');
            });
            ['Enter', ' ', 'ArrowRight'].forEach((key) => {
                it('should drill down to next list', async () => {
                    const event = new KeyboardEvent('keydown', { key });

                    parent.dispatchEvent(event);

                    await Promise.resolve();

                    const listItems = querySelectorAll('.slds-list__item');
                    expect(listItems.length).toBe(2);
                });
            });
            it('should go back to previous menu on ArrowLeft', async () => {
                element.parentItem = parentItem;
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowLeft'
                });
                parent.click();

                await Promise.resolve();

                parent = querySelector('.slds-list__item button');
                parent.dispatchEvent(event);

                await Promise.resolve();

                parent = querySelectorAll('.slds-list__item');
                expect(parent.length).toBe(3);

                parent = querySelector('.slds-list__item button');
                parent.dispatchEvent(event);
                await Promise.resolve();

                expect(keyListener).toHaveBeenCalled();
            });
            ['Esc', 'Escape'].forEach((key) => {
                it(`should go back close menu or go back on ${key}`, async () => {
                    element.parentItem = parentItem;
                    const event = new KeyboardEvent('keydown', {
                        key
                    });
                    parent.click();

                    await Promise.resolve();

                    parent = querySelector('.slds-list__item button');
                    parent.dispatchEvent(event);

                    await Promise.resolve();

                    parent = querySelectorAll('.slds-list__item');
                    expect(parent.length).toBe(3);

                    parent = querySelector('.slds-list__item button');
                    parent.dispatchEvent(event);
                    await Promise.resolve();

                    expect(closeListener).toHaveBeenCalled();
                });
            });
        });
        describe('handleLeafKeyDown', () => {
            let parent;
            let keyListener;
            let navigateListener;
            let closeListener;
            beforeEach(async () => {
                keyListener = jest.fn();
                closeListener = jest.fn();
                navigateListener = jest.fn();
                element.addEventListener(
                    'leftrightarrowkeysubmenu',
                    keyListener
                );
                element.addEventListener('closesubmenus', closeListener);
                element.addEventListener('navigatetopage', navigateListener);
                parent = querySelector('.slds-list__item button');
            });
            ['Enter', ' '].forEach((key) => {
                it('should dispatch navigatetopage event', async () => {
                    element.parentItem = parentItem;
                    const event = new KeyboardEvent('keydown', { key });
                    const leaf = querySelector('.slds-list__item a');

                    leaf.dispatchEvent(event);

                    await Promise.resolve();
                    expect(navigateListener).toHaveBeenCalledOnce();
                });
            });

            it('should go back to previous menu on ArrowLeft', async () => {
                element.parentItem = parentItem;
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowLeft'
                });
                parent.click();

                await Promise.resolve();

                let leaf = querySelector('.slds-list__item a');
                leaf.dispatchEvent(event);

                await Promise.resolve();

                parent = querySelectorAll('.slds-list__item');
                expect(parent.length).toBe(3);

                leaf = querySelector('.slds-list__item a');
                leaf.dispatchEvent(event);
                await Promise.resolve();

                expect(keyListener).toHaveBeenCalled();
            });

            it('should fire event on ArrowRight', async () => {
                element.parentItem = parentItem;
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowRight'
                });
                parent.click();

                await Promise.resolve();

                let leaf = querySelector('.slds-list__item a');
                leaf.dispatchEvent(event);

                await Promise.resolve();

                expect(keyListener).toHaveBeenCalled();
            });
            ['Esc', 'Escape'].forEach((key) => {
                it('should go back or close list', async () => {
                    element.parentItem = parentItem;
                    const event = new KeyboardEvent('keydown', {
                        key
                    });
                    parent.click();

                    await Promise.resolve();

                    let leaf = querySelector('.slds-list__item a');
                    leaf.dispatchEvent(event);

                    await Promise.resolve();

                    parent = querySelectorAll('.slds-list__item');
                    expect(parent.length).toBe(3);

                    leaf = querySelector('.slds-list__item a');
                    leaf.dispatchEvent(event);
                    await Promise.resolve();

                    expect(closeListener).toHaveBeenCalled();
                });
            });

            it('should fire close event on Tab', async () => {
                element.parentItem = parentItem;
                const event = new KeyboardEvent('keydown', {
                    key: 'Tab'
                });

                let leaf = querySelector('.slds-list__item a');
                leaf.dispatchEvent(event);

                await Promise.resolve();

                expect(closeListener).toHaveBeenCalled();
            });
        });

        describe('handleCommonKeyDown', () => {
            let parent;
            let navigateListener;
            let keyListener;
            beforeEach(async () => {
                navigateListener = jest.fn();
                keyListener = jest.fn();
                element.addEventListener(
                    'leftrightarrowkeysubmenu',
                    keyListener
                );
                element.addEventListener('navigatetopage', navigateListener);
                parent = querySelector('.slds-list__item button');
                parent?.click();
                await Promise.resolve();
            });
            it('should focus next item', async () => {
                let listItems = querySelectorAll('[role=menuitem]');
                const length = listItems.length;
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowDown'
                });

                for (const item of listItems) {
                    const index = listItems.indexOf(item);
                    let spy;
                    let next;
                    if (index + 1 < length) {
                        next = index + 1;
                        spy = jest.spyOn(listItems[index + 1], 'focus');
                    } else {
                        next = 0;
                        spy = jest.spyOn(listItems[0], 'focus');
                    }

                    listItems[index].dispatchEvent(event);
                    // eslint-disable-next-line no-await-in-loop
                    await Promise.resolve();
                    expect(listItems[index].getAttribute('tabindex')).toBe(
                        '-1'
                    );
                    expect(listItems[next].getAttribute('tabindex')).toBe('0');
                    expect(spy).toHaveBeenCalled();
                }
            });
            it('should focus previous item', async () => {
                let listItems = querySelectorAll('[role=menuitem]');
                const length = listItems.length;
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowUp'
                });

                //reorder to ensure it focuses in the right order
                listItems = [
                    listItems[0],
                    listItems[3],
                    listItems[2],
                    listItems[1]
                ];

                for (const item of listItems) {
                    const index = listItems.indexOf(item);
                    let spy;
                    let next;
                    if (index + 1 < length) {
                        next = index + 1;
                        spy = jest.spyOn(listItems[next], 'focus');
                    } else {
                        next = 0;
                        spy = jest.spyOn(listItems[next], 'focus');
                    }

                    listItems[index].dispatchEvent(event);
                    // eslint-disable-next-line no-await-in-loop
                    await Promise.resolve();
                    expect(listItems[index].getAttribute('tabindex')).toBe(
                        '-1'
                    );
                    expect(listItems[next].getAttribute('tabindex')).toBe('0');
                    expect(spy).toHaveBeenCalled();
                }
            });
            ['Home', 'PageUp'].forEach((key) => {
                it('should focus first item', async () => {
                    let listItems = querySelectorAll('[role=menuitem]');
                    const event = new KeyboardEvent('keydown', {
                        key
                    });

                    for (const item of listItems) {
                        const index = listItems.indexOf(item);

                        const firstItemSpy = jest.spyOn(listItems[0], 'focus');

                        listItems[index].dispatchEvent(event);
                        // eslint-disable-next-line no-await-in-loop
                        await Promise.resolve();

                        expect(listItems[0].getAttribute('tabindex')).toBe('0');
                        expect(firstItemSpy).toHaveBeenCalled();
                    }
                });
            });
            ['End', 'PageDown'].forEach((key) => {
                it('should focus last item', async () => {
                    let listItems = querySelectorAll('[role=menuitem]');
                    const event = new KeyboardEvent('keydown', {
                        key
                    });

                    for (const item of listItems) {
                        const index = listItems.indexOf(item);

                        const firstItemSpy = jest.spyOn(
                            listItems[listItems.length - 1],
                            'focus'
                        );

                        listItems[index].dispatchEvent(event);
                        // eslint-disable-next-line no-await-in-loop
                        await Promise.resolve();
                        expect(
                            listItems[listItems.length - 1].getAttribute(
                                'tabindex'
                            )
                        ).toBe('0');
                        expect(firstItemSpy).toHaveBeenCalled();
                    }
                });
            });
            ['ctrl', 'cmd'].forEach((key) => {
                it('should do nothing for other key events', async () => {
                    let listItems = querySelectorAll('[role=menuitem]');
                    const event = new KeyboardEvent('keydown', {
                        key
                    });

                    for (const item of listItems) {
                        const index = listItems.indexOf(item);

                        listItems[index].dispatchEvent(event);
                        // eslint-disable-next-line no-await-in-loop
                        await Promise.resolve();
                        expect(keyListener).not.toHaveBeenCalled();
                        expect(navigateListener).not.toHaveBeenCalled();
                    }
                });
            });
        });
    });
});