import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-sm text-sm text-text-subtle" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-sm">
          {i > 0 && <span className="text-text-subtle">/</span>}
          {item.to ? (
            <Link to={item.to} className="text-text-subtle hover:text-primary hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-main font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
