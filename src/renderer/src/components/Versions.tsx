import { useState } from 'react'

export function Versions(): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul className="versions">
      {/* eslint-disable @typescript-eslint/no-unsafe-member-access */}
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
      {/* eslint-enable @typescript-eslint/no-unsafe-member-access */}
    </ul>
  )
}
