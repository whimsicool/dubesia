/**
 * Motion vocabulary for the public landing page.
 *
 * Duration and easing mirror the kdp-* keyframes in resources/css/app.css so
 * the JavaScript and CSS animations read as one system.
 */
export const MOTION_EASE = [0.4, 0, 0.2, 1];
export const MOTION_DURATION = 0.45;

export const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: MOTION_DURATION, ease: MOTION_EASE },
    },
};

/**
 * Word-by-word entrance for the hero headline.
 */
export const wordStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.055 } },
};

export const wordUp = {
    hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: MOTION_DURATION + 0.1, ease: MOTION_EASE },
    },
};

export const revealViewport = {
    once: true,
    amount: 0.15,
    margin: '0px 0px -60px 0px',
};
