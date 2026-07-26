import { IosShell } from '../components/ios/IosShell'
import { DevicePreviewSwitcher } from '../components/web/DevicePreviewSwitcher'

export function IosPage() {
  return (
    <>
      <IosShell />
      <DevicePreviewSwitcher />
    </>
  )
}
