const { local } = require('d3-selection');

const layoutLocal = local();


/**
 * Specify a layout function to be called on a D3 selection when child nodes
 * invalidate the layout.
 *
 * Example usage:
 *
 * elem.call(layout(function (data) {
 *     // This function will be called when children call `invalidate`
 *     // data == {graph: {width: 200, height: 200}}
 * });
 * elem.append('div')
 *     .call(invalidate({graph: {width: 200, height: 200}}));
 *
 * @param  {Function} layoutFunction
 * @return {Function}
 */
export function layout(layoutFunction) {
    return function (selection) {
        selection.each(function () {
            layoutLocal.set(this, {
                invalidate: layoutFunction.bind(this),
                data: {}
            });
        });
    };
}


/**
 * Invalidates the layout, calling the previously defined `layout` function.
 * @param  {Object} data Layout data to accumulate for the `layout` function.
 * @return {Function}
 */
export const invalidate = function (data) {
    return function (selection) {
        selection.each(function () {
            const localLayout = layoutLocal.get(this);
            if (localLayout) {
                localLayout.data = {
                    ...localLayout.data,
                    ...data
                };
                localLayout.invalidate(localLayout.data);
            }
        });
    };
};

