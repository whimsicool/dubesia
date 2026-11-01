import {
    Award,
    BookOpen,
    Building2,
    CalendarDays,
    ClipboardCheck,
    GraduationCap,
    LayoutGrid,
    ListChecks,
    MessageSquare,
    UserCheck,
    Users,
} from 'lucide-react';

/**
 * Ikon dashboard dikirim server sebagai nama string; peta ini
 * menerjemahkannya ke komponen lucide.
 */
const ICONS = {
    award: Award,
    'book-open': BookOpen,
    building: Building2,
    'calendar-days': CalendarDays,
    'clipboard-check': ClipboardCheck,
    'graduation-cap': GraduationCap,
    'layout-grid': LayoutGrid,
    'list-checks': ListChecks,
    'message-square': MessageSquare,
    'user-check': UserCheck,
    users: Users,
};

export const iconFor = (name) => ICONS[name] ?? LayoutGrid;
