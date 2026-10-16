

import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                sidebar: '#0a1530',
                ink: '#0b1220',
            },
        },
    },

    plugins: [forms],
    
    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                // DUBESIA portal type scale (used as `font-{name}` utilities).
                'label-md': ['Inter'],
                'headline-md': ['Plus Jakarta Sans'],
                'display-lg': ['Plus Jakarta Sans'],
                'headline-lg': ['Plus Jakarta Sans'],
                'title-sm': ['Inter'],
                'display-lg-mobile': ['Plus Jakarta Sans'],
                'headline-lg-mobile': ['Plus Jakarta Sans'],
                'title-md': ['Inter'],
                'body-lg': ['Inter'],
                'headline-sm': ['Plus Jakarta Sans'],
                'body-sm': ['Inter'],
                'body-md': ['Inter'],
                'label-sm': ['Inter'],
                'label-lg': ['Inter'],
            },
            fontSize: {
                // DUBESIA portal type scale (used as `text-{name}` utilities).
                'label-md': [
                    '0.75rem',
                    {
                        lineHeight: '1rem',
                        letterSpacing: '0.025em',
                        fontWeight: '600',
                    },
                ],
                'headline-md': [
                    '1.5rem',
                    {
                        lineHeight: '2rem',
                        letterSpacing: '-0.01em',
                        fontWeight: '600',
                    },
                ],
                'display-lg': [
                    '3rem',
                    {
                        lineHeight: '3.75rem',
                        letterSpacing: '-0.02em',
                        fontWeight: '700',
                    },
                ],
                'headline-lg': [
                    '2rem',
                    {
                        lineHeight: '2.5rem',
                        letterSpacing: '-0.015em',
                        fontWeight: '700',
                    },
                ],
                'title-sm': [
                    '1rem',
                    {
                        lineHeight: '1.5rem',
                        letterSpacing: '0em',
                        fontWeight: '600',
                    },
                ],
                'display-lg-mobile': [
                    '2.25rem',
                    {
                        lineHeight: '2.75rem',
                        letterSpacing: '-0.02em',
                        fontWeight: '700',
                    },
                ],
                'headline-lg-mobile': [
                    '1.5rem',
                    {
                        lineHeight: '2rem',
                        letterSpacing: '-0.01em',
                        fontWeight: '700',
                    },
                ],
                'title-md': [
                    '1.125rem',
                    {
                        lineHeight: '1.625rem',
                        letterSpacing: '-0.005em',
                        fontWeight: '600',
                    },
                ],
                'body-lg': [
                    '1.125rem',
                    {
                        lineHeight: '1.75rem',
                        letterSpacing: '0em',
                        fontWeight: '400',
                    },
                ],
                'headline-sm': [
                    '1.25rem',
                    {
                        lineHeight: '1.75rem',
                        letterSpacing: '0em',
                        fontWeight: '600',
                    },
                ],
                'body-sm': [
                    '0.8125rem',
                    {
                        lineHeight: '1.25rem',
                        letterSpacing: '0.005em',
                        fontWeight: '400',
                    },
                ],
                'body-md': [
                    '0.9375rem',
                    {
                        lineHeight: '1.5rem',
                        letterSpacing: '0em',
                        fontWeight: '400',
                    },
                ],
                'label-sm': [
                    '0.6875rem',
                    {
                        lineHeight: '0.875rem',
                        letterSpacing: '0.035em',
                        fontWeight: '500',
                    },
                ],
                'label-lg': [
                    '0.875rem',
                    {
                        lineHeight: '1.25rem',
                        letterSpacing: '0.01em',
                        fontWeight: '600',
                    },
                ],
            },
            colors: {
                // DUBESIA portal palette (used as `bg-{name}` / `text-{name}`).
                'on-tertiary-fixed-variant': '#6e3900',
                'on-surface': '#0b1c30',
                'on-surface-variant': '#44474c',
                'surface-variant': '#d3e4fe',
                'on-tertiary-container': '#c76c00',
                'inverse-primary': '#bac8dc',
                'secondary-container': '#da342d',
                'outline-variant': '#c4c6cc',
                'on-primary-fixed': '#0f1c2c',
                'on-primary-fixed-variant': '#3a4859',
                'surface-container-high': '#dce9ff',
                'on-error': '#ffffff',
                'secondary-fixed': '#ffdad5',
                outline: '#74777d',
                'on-error-container': '#93000a',
                'tertiary-fixed-dim': '#ffb77d',
                'surface-tint': '#525f71',
                'on-tertiary-fixed': '#2f1500',
                'on-secondary': '#ffffff',
                'primary-fixed': '#d6e4f9',
                'primary-container': '#0f1c2c',
                'surface-container-highest': '#d3e4fe',
                error: '#ba1a1a',
                'surface-dim': '#cbdbf5',
                'secondary-fixed-dim': '#ffb4ab',
                primary: '#000000',
                'on-secondary-fixed': '#410002',
                'on-secondary-fixed-variant': '#930009',
                'on-primary-container': '#778598',
                tertiary: '#000000',
                'inverse-surface': '#213145',
                'on-secondary-container': '#fffbff',
                'on-tertiary': '#ffffff',
                'surface-bright': '#f8f9ff',
                'surface-container-lowest': '#ffffff',
                'primary-fixed-dim': '#bac8dc',
                'tertiary-fixed': '#ffdcc3',
                'surface-container-low': '#eff4ff',
                'on-background': '#0b1c30',
                background: '#f8f9ff',
                'tertiary-container': '#2f1500',
                'surface-container': '#e5eeff',
                surface: '#f8f9ff',
                'error-container': '#ffdad6',
                secondary: '#b61718',
                'inverse-on-surface': '#eaf1ff',
                'on-primary': '#ffffff',
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px',
            },
            spacing: {
                'space-sm': '0.5rem',
                'gutter-mobile': '0.75rem',
                margin: '2rem',
                'space-lg': '1.5rem',
                'space-xs': '0.25rem',
                'space-xl': '2.5rem',
                'margin-mobile': '1rem',
                'space-md': '1rem',
                gutter: '1.5rem',
            },
        },
    },

    plugins: [forms],
};
