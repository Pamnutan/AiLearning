function StatCard({
  title,
  value,
  icon,
  color,
  description,
}) {
  return (
    <div className="stat-card">

      <div className="stat-card-top">

        <div>
          <p className="stat-title">
            {title}
          </p>

          <h2 className="stat-value">
            {value}
          </h2>
        </div>

        <div
          className="stat-icon"
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </div>

      </div>

      {description && (
        <p className="stat-description">
          {description}
        </p>
      )}

    </div>
  );
}

export default StatCard;



// function StatCard({
//   title,
//   value
// }) {

//   return (
//     <div className="stat-card">

//       <p>{title}</p>

//       <h2>{value}</h2>

//     </div>
//   );
// }

// export default StatCard;
