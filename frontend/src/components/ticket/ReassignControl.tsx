import { useQuery } from '@tanstack/react-query';
import { developerService } from '../../services/developerService';
import { useAuth } from '../../hooks/useAuth';

interface ReassignControlProps {
  disabled?: boolean;
  onReassign: (developerId: number, note?: string) => void;
}

export function ReassignControl({ disabled, onReassign }: ReassignControlProps) {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['developers'],
    queryFn: () => developerService.listDevelopers().then((res) => res.data),
  });

  const otherDevelopers = data?.filter((d) => d.id !== user?.id) ?? [];

  return (
    <select
      disabled={disabled}
      defaultValue=""
      onChange={(e) => { if (e.target.value) onReassign(Number(e.target.value)); }}
      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
    >
      <option value="" disabled>Reassign to...</option>
      {otherDevelopers.map((d) => (
        <option key={d.id} value={d.id}>{d.full_name}</option>
      ))}
    </select>
  );
}