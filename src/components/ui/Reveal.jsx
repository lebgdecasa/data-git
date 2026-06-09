import useReveal from '../../hooks/useReveal'

/**
 * Wraps children in a subtle fade-up that triggers when scrolled into view.
 * `as` lets the caller choose the element/landmark; `delay` staggers items.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, visible] = useReveal()

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={[
        'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
