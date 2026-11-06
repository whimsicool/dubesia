import { motion, useReducedMotion } from 'motion/react';
import { MapPin } from 'lucide-react';

import { MOTION_DURATION, MOTION_EASE } from './motion';

const ARC_RADIUS = 94;
const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

const BADGES = [
    {
        key: 'city',
        className:
            'left-0 top-[16%] flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 shadow-[0_18px_35px_-24px_rgba(11,28,48,0.5)]',
        icon: MapPin,
        label: 'Pekanbaru',
        delay: 0.6,
    },
    {
        key: 'since',
        className:
            'right-0 bottom-[14%] flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 shadow-[0_18px_35px_-24px_rgba(11,28,48,0.5)]',
        dot: true,
        label: 'Sejak 2009',
        delay: 0.75,
    },
];

/**
 * Brand mark for the hero. The crest is the only image the course owns, so the
 * composition draws attention to it with a gold arc instead of invented data.
 */
export default function HeroMark() {
    const reduceMotion = useReducedMotion();

    return (
        <div className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-[23rem] lg:max-w-[28rem]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-8 rounded-full bg-gradient-to-br from-secondary/10 via-surface-container/60 to-dubesia-gold/25 blur-2xl"
            />

            <svg
                viewBox="0 0 200 200"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full -rotate-90"
            >
                <circle
                    cx="100"
                    cy="100"
                    r="99"
                    strokeWidth="0.6"
                    className="fill-surface-container-lowest/70 stroke-outline-variant/40"
                />
                <motion.circle
                    cx="100"
                    cy="100"
                    r={ARC_RADIUS}
                    fill="none"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    strokeDasharray={ARC_CIRCUMFERENCE}
                    className="text-dubesia-gold"
                    initial={
                        reduceMotion
                            ? false
                            : { strokeDashoffset: ARC_CIRCUMFERENCE }
                    }
                    animate={{ strokeDashoffset: ARC_CIRCUMFERENCE * 0.18 }}
                    transition={{
                        duration: 1.8,
                        delay: 0.2,
                        ease: MOTION_EASE,
                    }}
                />
            </svg>

            <motion.div
                aria-hidden="true"
                className="absolute inset-[10%] rounded-full border border-dashed border-dubesia-gold/40"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
            />

            {/* The logo file ships with a #f7f7f7 background and wide padding, so the disc matches that colour and the image is scaled past the disc to crop the padding away. */}
            <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: MOTION_DURATION + 0.25,
                    delay: 0.15,
                    ease: MOTION_EASE,
                }}
                className="absolute inset-[22%] flex items-center justify-center overflow-hidden rounded-full bg-[#f7f7f7] shadow-[0_30px_60px_-35px_rgba(11,28,48,0.55)]"
            >
                <img
                    src="/images/dubesia-logo.png"
                    alt="Lambang DUBES Communications"
                    className="h-[135%] w-[135%] max-w-none -translate-y-[6.5%] object-contain"
                />
            </motion.div>

            {BADGES.map((badge) => {
                const Icon = badge.icon;

                return (
                    <motion.div
                        key={badge.key}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: MOTION_DURATION,
                            delay: badge.delay,
                            ease: MOTION_EASE,
                        }}
                        className={`absolute ${badge.className}`}
                    >
                        {Icon ? (
                            <Icon className="h-3.5 w-3.5 text-secondary" />
                        ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-dubesia-gold" />
                        )}
                        <span className="font-label-md text-label-md text-on-surface">
                            {badge.label}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
}
