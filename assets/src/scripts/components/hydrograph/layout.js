// Define width, height and margin for the SVG.
// Use a fixed size, and scale to device width using CSS.
export let WIDTH = 800;
export let HEIGHT = WIDTH / 2;
export let ASPECT_RATIO_PERCENT = `${100 * HEIGHT / WIDTH}%`;

export function updateLayoutVariables(width) {
    WIDTH = width;
    HEIGHT = WIDTH / 2;
    ASPECT_RATIO_PERCENT = `${100 * HEIGHT / WIDTH}%`;
    return {
        width: WIDTH,
        height: HEIGHT,
        aspect_ratio_percent: ASPECT_RATIO_PERCENT
    };
}
export function getWidth() {
    return WIDTH;
}
export function getHeight() {
    return HEIGHT;
}

export const MARGIN = {
    top: 20,
    right: 75,
    bottom: 45,
    left: 50
};
