import { useState } from 'react'

function Offline() {
  const [synced, setSynced] = useState(false)

  return (
    <div className="officer-page">
      <h1>Offline Reports</h1>
      <p>Reports can remain on the device until an internet connection is available.</p>

      <section className="offline-card">
        <span className="offline-count">{synced ? '0' : '3'}</span>
        <h2>Reports waiting to sync</h2>
        <p>
          {synced
            ? 'All field reports have been synchronised.'
            : 'Three reports with photos and location details are ready to upload.'}
        </p>

        <button type="button" onClick={() => setSynced(true)}>
          {synced ? 'Synced successfully' : 'Sync now'}
        </button>
      </section>
    </div>
  )
}

export default Offline