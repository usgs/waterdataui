import config from 'ui/config';

import {mediaQuery} from 'ui/utils';

export const attachToNode = function(_, node) {
    const videos = Array.from(node.getElementsByClassName('camera-video'));
    const videoSupported = videos.length ? videos[0].canPlayType('video/webm') !== '' : false;
    if (videoSupported) {
        const onDesktop = mediaQuery(config.USWDS_LARGE_SCREEN);
        const videos = Array.from(node.getElementsByClassName('camera-video'));
            videos.forEach((video) => {
                if (onDesktop && video.classList.contains('med-video') ||
                    !onDesktop && video.classList.contains('small-video')) {
                    video.removeAttribute('hidden');
                }
            });
    } else {
        const images = Array.from(node.getElementsByClassName('camera-most-recent-image'));
        images.forEach((image) => {
            image.removeAttribute('hidden');
        });
    }
};