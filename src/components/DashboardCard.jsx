export default function DashboardCard({ title, value, detail, icon: Icon, tone = 'blue' }) {
  return (
    <div className="dash-card">
      <div className={`dash-card__icon dash-card__icon--${tone}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="dash-card__value">{value}</div>
      <div className="dash-card__label">{title}</div>
      <div className="dash-card__detail">{detail}</div>
    </div>
  )
}
