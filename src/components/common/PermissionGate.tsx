import { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import styles from './PermissionGate.module.css';

interface Props {
  children: ReactNode;
}

export function PermissionGate({ children }: Props) {
  const { micPermission, requestMicPermission } = usePermissions();

  if (micPermission === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00FFB2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </div>
        <h1 className={styles.title}>Tuner</h1>
        <p className={styles.subtitle}>by 0utlawStudios</p>

        {micPermission === 'undetermined' && (
          <>
            <p className={styles.description}>
              This tuner needs access to your microphone to detect pitch in real-time.
            </p>
            <button className={styles.button} onClick={requestMicPermission}>
              Enable Microphone
            </button>
          </>
        )}

        {(micPermission === 'denied' || micPermission === 'blocked') && (
          <>
            <p className={styles.description}>
              Microphone access was denied. Please enable it in your browser settings and reload the page.
            </p>
            <button className={styles.button} onClick={() => window.location.reload()}>
              Reload
            </button>
          </>
        )}
      </div>
    </div>
  );
}
