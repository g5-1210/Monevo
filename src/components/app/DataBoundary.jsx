import { useData } from '../../context/DataContext';
import { ErrorState } from './ui';

/* Shows `skeleton` while data loads and a retryable error state if it fails. */
export default function DataBoundary({ skeleton, children }) {
  const { status, retry } = useData();
  if (status.loading) return skeleton;
  if (status.error) {
    return (
      <div className="card">
        <ErrorState title="Couldn't load your data" text={status.error} onRetry={retry} />
      </div>
    );
  }
  return children;
}
