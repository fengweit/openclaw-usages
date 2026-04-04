import './CostChart.css'

function CostChart({ costs, currentProvider, maxCost }) {
  // Use the most expensive cost for scaling, with a minimum to avoid division issues
  const scaleMax = Math.max(maxCost, 1)

  return (
    <div className="cost-chart">
      {costs.map((cost) => {
        const widthPercent = Math.max((cost.monthlyCost / scaleMax) * 100, 2)
        const isCurrent = cost.modelKey === currentProvider
        
        // Color based on cost relative to max
        const costRatio = cost.monthlyCost / scaleMax
        let colorClass = 'bar-green'
        if (costRatio > 0.6) colorClass = 'bar-red'
        else if (costRatio > 0.2) colorClass = 'bar-yellow'

        return (
          <div 
            key={cost.modelKey} 
            className={`chart-row ${isCurrent ? 'current' : ''}`}
          >
            <div className="chart-label">
              <span className="chart-model">{cost.model}</span>
              <span className="chart-provider">{cost.provider}</span>
            </div>
            <div className="chart-bar-container">
              <div 
                className={`chart-bar ${colorClass}`}
                style={{ width: `${widthPercent}%` }}
              >
                <span className="chart-value">${cost.monthlyCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )
      })}
      
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-dot bar-green"></span> Low cost
        </span>
        <span className="legend-item">
          <span className="legend-dot bar-yellow"></span> Medium
        </span>
        <span className="legend-item">
          <span className="legend-dot bar-red"></span> High cost
        </span>
      </div>
    </div>
  )
}

export default CostChart
