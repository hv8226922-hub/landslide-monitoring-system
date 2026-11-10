const safetySteps = [
  {
    title: 'Before a landslide',
    points: [
      'Keep emergency contacts and essential supplies ready.',
      'Avoid building or parking near unstable slopes.',
      'Watch for cracks in walls, roads, and nearby ground.',
    ],
  },
  {
    title: 'During a landslide',
    points: [
      'Move away from the slide path immediately.',
      'Avoid river channels and damaged roads.',
      'Follow local authority evacuation instructions.',
    ],
  },
  {
    title: 'After a landslide',
    points: [
      'Stay away from the affected area until declared safe.',
      'Report blocked roads or damaged infrastructure.',
      'Check official alerts before travelling.',
    ],
  },
]

function Safety() {
  return (
    <div className="citizen-page">
      <h1>Landslide Safety Guide</h1>
      <p>Simple actions that can reduce risk before, during, and after a landslide.</p>

      <div className="safety-grid">
        {safetySteps.map((step) => (
          <article className="safety-card" key={step.title}>
            <h2>{step.title}</h2>

            <ul>
              {step.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Safety