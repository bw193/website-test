import React from 'react';

export type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'blur';

type RevealProps = {
  /** Element tag to render. Defaults to a div. */
  as?: React.ElementType;
  /** Stagger delay in milliseconds, applied as animation-delay. */
  delay?: number;
  /** Entry direction/style. Defaults to 'up' (fade + rise). */
  variant?: RevealVariant;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Renders content visibly on initial mount (`opacity: 1`, `reveal-in` active)
 * so Googlebot WRS and below-the-fold snapshots never encounter `opacity: 0`
 * scroll-gated sections.
 */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  variant = 'up',
  className = '',
  children,
  style,
  ...rest
}: RevealProps) {
  const variantClass = variant === 'up' ? '' : ` reveal-${variant}`;
  const mergedStyle: React.CSSProperties = {
    opacity: 1,
    ...(delay ? { animationDelay: `${delay}ms` } : {}),
    ...style,
  };

  return (
    <Tag
      className={`reveal${variantClass} reveal-in ${className}`.trim()}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
}
