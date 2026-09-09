import type { AnchorHTMLAttributes, ReactNode } from 'react';

type PlainLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export default function PlainLink({ href, children, ...props }: PlainLinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
