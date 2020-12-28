import type { ReactNode } from 'react';

export const ExternalLink = ({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);
