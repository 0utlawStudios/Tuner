import {useState, useEffect, useCallback} from 'react';
import {Platform} from 'react-native';
import {
  request,
  check,
  PERMISSIONS,
  RESULTS,
  type PermissionStatus,
} from 'react-native-permissions';

export type MicPermissionState = 'undetermined' | 'granted' | 'denied' | 'blocked';

const MICROPHONE_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.MICROPHONE,
  android: PERMISSIONS.ANDROID.RECORD_AUDIO,
})!;

function mapStatus(status: PermissionStatus): MicPermissionState {
  switch (status) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.DENIED:
      return 'undetermined'; // Can still request
    case RESULTS.BLOCKED:
    case RESULTS.UNAVAILABLE:
      return 'blocked';
    default:
      return 'undetermined';
  }
}

export function usePermissions() {
  const [micPermission, setMicPermission] = useState<MicPermissionState>('undetermined');

  useEffect(() => {
    check(MICROPHONE_PERMISSION).then(status => {
      setMicPermission(mapStatus(status));
    });
  }, []);

  const requestMicPermission = useCallback(async (): Promise<MicPermissionState> => {
    const status = await request(MICROPHONE_PERMISSION);
    const mapped = mapStatus(status);
    setMicPermission(mapped);
    return mapped;
  }, []);

  return {micPermission, requestMicPermission};
}
