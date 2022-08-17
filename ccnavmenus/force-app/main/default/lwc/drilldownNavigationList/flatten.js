/**
 * @param items
 * @returns {*}
 */
 export function flattenItems(items) {
    return items.reduce((list, item) => {
        list[item.id] = item;

        if (item?.items) {
            list = { ...list, ...flattenItems(item.items) };
        }
        return list;
    }, {});
}