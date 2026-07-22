import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff', borderRadius: '8px', padding: '24px',
          minWidth: '320px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }}
      >
        {title && <h2 style={{ marginTop: 0, marginBottom: '16px' }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}