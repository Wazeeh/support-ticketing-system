import { Button } from '../shared/Button';

interface MarkCompleteButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function MarkCompleteButton({ visible, onClick }: MarkCompleteButtonProps) {
  if (!visible) return null;
  return <Button variant="secondary" onClick={onClick}>Mark Complete</Button>;
}