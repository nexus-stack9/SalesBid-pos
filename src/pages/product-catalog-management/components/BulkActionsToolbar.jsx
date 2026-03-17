import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

/* ─── tokens ─────────────────────────────────────────────────────────── */
const T = {
  accent: '#2563eb',
  accentLight: '#eff6ff',
  success: '#059669',
  successLight: '#ecfdf5',
  warn: '#d97706',
  warnLight: '#fffbeb',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  border: '#e2e8f0',
};

const actionBtn = (color, bg) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', border: `1px solid ${color}22`, borderRadius: 8,
  background: bg, color, fontSize: 12, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit', transition: 'opacity .15s',
});

const BulkActionsToolbar = ({ selectedCount, onBulkAction, onClearSelection, onExport, statusFilter }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Actions to show in normal product catalog (not in approved/pending/rejected)
  const CATALOG_ACTIONS = [
    { id: 'activate',     label: 'Activate',     icon: 'CheckCircle', color: T.success, bg: T.successLight, confirm: false },
    { id: 'deactivate',   label: 'Deactivate',   icon: 'XCircle',     color: '#64748b', bg: '#f1f5f9',      confirm: false },
    { id: 'start-auction',label: 'Start Auctions',icon: 'Play',        color: T.accent,  bg: T.accentLight,  confirm: false },
    { id: 'end-auction',  label: 'End Auctions', icon: 'Pause',       color: T.warn,    bg: T.warnLight,    confirm: true },
    { id: 'delete',       label: 'Delete',       icon: 'Trash2',      color: T.danger,  bg: T.dangerLight,  confirm: true },
  ];

  // Actions to show for rejected products - only send for approval
  const REJECTED_ACTIONS = [
    { id: 'send-for-approval', label: 'Send for Approval', icon: 'Send', color: T.accent, bg: T.accentLight, confirm: false },
  ];

  // Get actions based on statusFilter
  const ACTIONS = statusFilter === 'rejected' ? REJECTED_ACTIONS : (statusFilter ? [] : CATALOG_ACTIONS);

  const handle = (actionId) => {
    const a = ACTIONS.find(x => x.id === actionId);
    if (a?.confirm) { setConfirmAction(a); setShowConfirm(true); }
    else onBulkAction(actionId);
  };

  const confirm = () => { if (confirmAction) { onBulkAction(confirmAction.id); setShowConfirm(false); setConfirmAction(null); } };
  const cancel = () => { setShowConfirm(false); setConfirmAction(null); };

  if (selectedCount === 0) return null;

  return (
    <>
      <div style={{ background: T.accentLight, border: `1px solid ${T.accent}22`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{selectedCount}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a8a' }}>
            {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button onClick={onClearSelection} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="X" size={13} /> Clear
          </button>
        </div>

        {/* divider */}
        <div style={{ width: 1, height: 24, background: `${T.accent}30`, flexShrink: 0 }} />

        {/* action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ACTIONS.map(a => (
            <button key={a.id} onClick={() => handle(a.id)} style={actionBtn(a.color, a.bg)}>
              <Icon name={a.icon} size={14} />
              {a.label}
            </button>
          ))}
          <button onClick={onExport} style={actionBtn('#64748b', '#f1f5f9')}>
            <Icon name="Download" size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && confirmAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 30px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: confirmAction.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={confirmAction.icon} size={22} color={confirmAction.color} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Confirm {confirmAction.label}</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>This affects {selectedCount} product{selectedCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 22, lineHeight: 1.6 }}>
              This action cannot be undone. Are you sure you want to continue?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={cancel} style={{ padding: '9px 20px', border: `1px solid ${T.border}`, borderRadius: 9, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#475569', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={confirm} style={{ padding: '9px 20px', border: 'none', borderRadius: 9, background: confirmAction.color, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {confirmAction.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionsToolbar;