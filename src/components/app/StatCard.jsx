import Icon from './Icon';
import { formatChange } from '../../utils/format';

/* Summary tile. `change` is a percentage vs. the comparison period (or null).
   `invert` flips the colour logic for things where "up" is bad, like expenses. */
export default function StatCard({ title, value, change, changeLabel, icon, invert, hero, children }) {
  const hasChange = change !== null && change !== undefined && Number.isFinite(change);
  const up = hasChange && change > 0;
  const flat = hasChange && Math.abs(change) < 0.05;
  const good = flat ? null : invert ? !up : up;

  return (
    <article className={`stat${hero ? ' stat--hero' : ''}`}>
      <div className="stat__top">
        <span className="stat__title">{title}</span>
        <span className="stat__icon"><Icon name={icon} size={17} /></span>
      </div>
      <p className="stat__value tabular">{value}</p>
      {hasChange && (
        <p className="stat__change">
          <span className={`stat__pill${flat ? '' : good ? ' stat__pill--good' : ' stat__pill--bad'}`}>
            <Icon name={up ? 'trending-up' : 'trending-down'} size={13} strokeWidth={2.3} />{formatChange(change)}
          </span>
          <span className="stat__vs">{changeLabel}</span>
        </p>
      )}
      {!hasChange && changeLabel && <p className="stat__change"><span className="stat__vs">{changeLabel}</span></p>}
      {children}
    </article>
  );
}
