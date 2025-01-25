import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import _ from 'lodash';

import cn from '~/libs/className';

interface NavProps {
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    href: string;
    variant: 'default' | 'ghost';
  }[];
}

export function Nav({ links }: NavProps) {
  return (
    <div className="flex-1">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {_.map(links, (link) => (
          <Link
            key={link.title}
            to={link.href}
            className="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <link.icon className="h-4 w-4" />
            {link.title}
            {link.label && (
              <span
                className={cn(
                  'ml-auto',
                  link.variant === 'default' &&
                    'text-background dark:text-white',
                )}
              >
                {link.label}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
