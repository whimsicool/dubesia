const makeIcon = (paths) =>
  function Icon({ className = '' }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        {paths}
      </svg>
    );
  };

export const Search = makeIcon(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>);
export const Clock = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>);
export const BadgeCheck = makeIcon(<><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></>);
export const XCircle = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>);
export const ArrowLeft = makeIcon(<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>);
export const ExternalLink = makeIcon(<><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>);
export const Send = makeIcon(<><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>);
export const X = makeIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
