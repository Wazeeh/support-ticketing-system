import { useQuery } from '@tanstack/react-query';
import { developerService } from '../../services/developerService';

interface AssignDeveloperControlProps {
  disabled?: boolean;
  onAssign: (developerId: number) => void;
}

export function AssignDeveloperControl({ disabled, onAssign }: AssignDeveloperControlProps) {
  const { data } = useQuery({
    queryKey: ['developers'],
    queryFn: () => developerService.listDevelopers().then((res) => res.data),
  });

  return (
    <select
      disabled={disabled}
      defaultValue=""
      onChange={(e) => { if (e.target.value) onAssign(Number(e.target.value)); }}
      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
    >
      <option value="" disabled>Assign developer</option>
      {data?.map((d) => (
        <option key={d.id} value={d.id}>{d.full_name} ({d.open_ticket_count} open)</option>
      ))}
    </select>
  );
}