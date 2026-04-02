import { PermissionGate } from './components/common/PermissionGate';
import { TunerScreen } from './components/tuner/TunerScreen';

export function App() {
  return (
    <PermissionGate>
      <TunerScreen />
    </PermissionGate>
  );
}
