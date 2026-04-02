import { useState, useCallback } from 'react';

export type MicPermissionState = 'undetermined' | 'granted' | 'denied' | 'blocked';

export function usePermissions() {
  const [micPermission, setMicPermission] = useState<MicPermissionState>('undetermined');

  const requestMicPermission = useCallback(async (): Promise<MicPermissionState> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicPermission('granted');
      return 'granted';
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicPermission('denied');
        return 'denied';
      }
      setMicPermission('blocked');
      return 'blocked';
    }
  }, []);

  return { micPermission, requestMicPermission };
}
