export const addOverflowMenu = (menuItems, itemWidths, availableWidth) => {
    const numOverflowItems = itemWidths.reduce(
        (acc, width) => ((availableWidth -= width) < 0 ? acc + 1 : acc),
        0
    );

    if (numOverflowItems > 0) {
        return [
            menuItems.slice(0, menuItems.length - numOverflowItems),
            menuItems.slice(-numOverflowItems)
        ];
    }

    return [menuItems, []];
};