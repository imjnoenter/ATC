export default function Spinner({ size = 'md', className = '' }) {
  const s = size === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-2'
  return (
    <div className={`${s} ${className} rounded-full border-accent border-t-transparent animate-spin`} />
  )
}
