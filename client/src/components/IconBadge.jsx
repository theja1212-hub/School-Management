export default function IconBadge({ icon: Icon, tone = 'indigo', size = 48 }) {
  return (
    <div className={`ibadge ${tone}`} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.48)} strokeWidth={2.2} />
    </div>
  );
}