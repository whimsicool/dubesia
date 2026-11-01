import { motion, useReducedMotion } from 'motion/react';

import { fadeUp, revealViewport } from './motion';

const ELEMENTS = {
    div: motion.div,
    article: motion.article,
};

/**
 * Reveals its content once when it scrolls into view.
 *
 * With reduced motion enabled the element renders in its final state without
 * any transition, so the page never depends on animation to become readable.
 * `hover` adds a small lift for cards.
 */
export default function Reveal({
    as = 'div',
    delay = 0,
    hover = false,
    className,
    children,
    ...rest
}) {
    const reduceMotion = useReducedMotion();
    const MotionElement = ELEMENTS[as] ?? motion.div;

    return (
        <MotionElement
            className={className}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={revealViewport}
            whileHover={hover && !reduceMotion ? { y: -5 } : undefined}
            variants={{
                hidden: fadeUp.hidden,
                visible: {
                    ...fadeUp.visible,
                    transition: { ...fadeUp.visible.transition, delay },
                },
            }}
            {...rest}
        >
            {children}
        </MotionElement>
    );
}
