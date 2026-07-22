import {
  useEffect,
  useState,
} from 'react';

import { piuTiService } from '../../services/piuTiService';

interface PiuOption {
  id: number;
  name: string;
  code: string;
}

interface TiOption {
  id: number;
  name: string;
  code: string;
}

interface PiuTiSelectorProps {
  piuId: number | null;
  tiId: number | null;
  onPiuChange: (id: number | null) => void;
  onTiChange: (id: number | null) => void;
}

type ListResponse<T> =
  | T[]
  | {
      data?: T[];
      items?: T[];
      results?: T[];
    };

function extractList<T>(
  responseData: ListResponse<T>,
): T[] {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (
    responseData &&
    Array.isArray(responseData.data)
  ) {
    return responseData.data;
  }

  if (
    responseData &&
    Array.isArray(responseData.items)
  ) {
    return responseData.items;
  }

  if (
    responseData &&
    Array.isArray(responseData.results)
  ) {
    return responseData.results;
  }

  return [];
}

export function PiuTiSelector({
  piuId,
  tiId,
  onPiuChange,
  onTiChange,
}: PiuTiSelectorProps) {
  const [piuOptions, setPiuOptions] =
    useState<PiuOption[]>([]);

  const [tiOptions, setTiOptions] =
    useState<TiOption[]>([]);

  const [loadingPiu, setLoadingPiu] =
    useState(true);

  const [loadingTi, setLoadingTi] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadPiuOptions = async () => {
      setLoadingPiu(true);
      setLoadError(null);

      try {
        const response =
          await piuTiService.listPiu();

        const options = extractList<PiuOption>(
          response.data,
        );

        if (active) {
          setPiuOptions(options);
        }
      } catch {
        if (active) {
          setPiuOptions([]);
          setLoadError(
            'Could not load PIU options.',
          );
        }
      } finally {
        if (active) {
          setLoadingPiu(false);
        }
      }
    };

    void loadPiuOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (piuId === null) {
      setTiOptions([]);
      setLoadingTi(false);

      return () => {
        active = false;
      };
    }

    const loadTiOptions = async () => {
      setLoadingTi(true);
      setLoadError(null);

      try {
        const response =
          await piuTiService.listTiForPiu(
            piuId,
          );

        const options = extractList<TiOption>(
          response.data,
        );

        if (active) {
          setTiOptions(options);
        }
      } catch {
        if (active) {
          setTiOptions([]);
          setLoadError(
            'Could not load TI options.',
          );
        }
      } finally {
        if (active) {
          setLoadingTi(false);
        }
      }
    };

    void loadTiOptions();

    return () => {
      active = false;
    };
  }, [piuId]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: '1 1 240px',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: 4,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            PIU
          </label>

          <select
            value={piuId ?? ''}
            disabled={loadingPiu}
            onChange={(event) => {
              const value =
                event.target.value;

              const selectedId = value
                ? Number(value)
                : null;

              onPiuChange(selectedId);
              onTiChange(null);
              setTiOptions([]);
            }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px',
              borderRadius: '6px',
              border:
                '1px solid #d1d5db',
            }}
          >
            <option value="">
              {loadingPiu
                ? 'Loading PIU...'
                : 'Select PIU'}
            </option>

            {piuOptions.map((piu) => (
              <option
                key={piu.id}
                value={piu.id}
              >
                {piu.name}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            flex: '1 1 240px',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: 4,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            TI
          </label>

          <select
            value={tiId ?? ''}
            disabled={
              piuId === null ||
              loadingTi
            }
            onChange={(event) => {
              const value =
                event.target.value;

              onTiChange(
                value
                  ? Number(value)
                  : null,
              );
            }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px',
              borderRadius: '6px',
              border:
                '1px solid #d1d5db',
            }}
          >
            <option value="">
              {loadingTi
                ? 'Loading TI...'
                : 'Select TI'}
            </option>

            {tiOptions.map((ti) => (
              <option
                key={ti.id}
                value={ti.id}
              >
                {ti.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadError && (
        <p
          style={{
            marginTop: '8px',
            marginBottom: 0,
            color: '#dc2626',
            fontSize: '0.875rem',
          }}
        >
          {loadError}
        </p>
      )}
    </div>
  );
}