import React from 'react';
import {PermissionGate} from '../components/common/PermissionGate';
import {TunerScreen} from '../components/tuner/TunerScreen';

export default function App() {
  return (
    <PermissionGate>
      <TunerScreen />
    </PermissionGate>
  );
}
