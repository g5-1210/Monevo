import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { EmptyState } from './ui';
import { useData } from '../../context/DataContext';
import { relativeTime } from '../../utils/dates';

const TYPE_META = {
  'budget-exceeded': { icon: 'alert',      tone: 'danger'  },
  'budget-warning':  { icon: 'alert',      tone: 'warning' },
  payment:           { icon: 'repeat',     tone: 'primary' },
  goal:              { icon: 'target',     tone: 'success' },
  summary:           { icon: 'chart',      tone: 'primary' },
};

export default function NotificationPanel() {
  const { notifications, actions, status } = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const go = (n) => { actions.markNotificationRead(n.id); setOpen(false); navigate(n.to); };

  return (
    <div className="notif" ref={ref}>
      <button className="btn btn-icon notif__btn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
        <Icon name="bell" size={19} />
        {unread > 0 && <span className="notif__count" aria-hidden="true">{unread}</span>}
      </button>

      {open && (
        <div className="notif__panel" role="dialog" aria-label="Notifications">
          <div className="notif__head">
            <h2>Notifications</h2>
            {unread > 0 && <button className="notif__mark" onClick={actions.markAllNotificationsRead}>Mark all as read</button>}
          </div>
          <div className="notif__list">
            {status.loading ? null : notifications.length === 0 ? (
              <EmptyState compact icon="bell" title="You're all caught up" text="Budget alerts and payment reminders will show up here." />
            ) : notifications.map(n => {
              const meta = TYPE_META[n.type] ?? TYPE_META.summary;
              return (
                <button key={n.id} className={`notif__item${n.read ? '' : ' is-unread'}`} onClick={() => go(n)}>
                  <span className={`notif__icon notif__icon--${meta.tone}`}><Icon name={meta.icon} size={16} /></span>
                  <span className="notif__text">
                    <strong>{n.title}</strong>
                    <span>{n.body}</span>
                    <time>{relativeTime(new Date(n.createdAt))}</time>
                  </span>
                  {!n.read && <span className="notif__dot" aria-label="Unread" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
