import { useState, useEffect } from 'react';
import { piuTiService } from '../../services/piuTiService';

interface PiuOption { id: number; name: string; code: string }
interface TiOption { id: number; name: string; code: string }

interface PiuTiSelectorProps {
  piuId: number | null;
  tiId: number | null;
  onPiuChange: (id: number | null) => void;
  onTiChange: (id: number | null) => void;
}

export function PiuTiSelector({ piuId, tiId, onPiuChange, onTiChange }: PiuTiSelectorProps) {
  const [piuOptions, setPiuOptions] = useState<PiuOption[]>([]);
  const [tiOptions, setTiOptions] = useState<TiOption[]>([]);
  const [loadingTi, setLoadingTi] = useState(false);

  useEffect(() => {
    piuTiService.listPiu().then((res) => setPiuOptions(res.data));
  }, []);

  useEffect(() => {
    if (piuId === null) {
      setTiOptions([]);
      return;
    }
    setLoadingTi(true);
    piuTiService.listTiForPiu(piuId)
      .then((res) => setTiOptions(res.data))
      .finally(() => setLoadingTi(false));
  }, [piuId]);

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
          PIU
        </label>
        <select
          value={piuId ?? ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            onPiuChange(val);
            onTiChange(null); // reset TI when PIU changes
          }}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
          <option value="">Select PIU</option>
          {piuOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
          TI
        </label>
        <select
          value={tiId ?? ''}
          onChange={(e) => onTiChange(e.target.value ? Number(e.target.value) : null)}
          disabled={piuId === null || loadingTi}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
          <option value="">{loadingTi ? 'Loading...' : 'Select TI'}</option>
          {tiOptions.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}