export default function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const cls = size === 'lg'
    ? 'font-serif text-2xl font-medium tracking-wide'
    : 'font-serif text-xl font-medium tracking-wide';
  return (
    <span className={cls}>
      <span style={{ color: '#f0ede8' }}>Date</span><span style={{ color: '#e8556a' }}>OS</span>
    </span>
  );
}
