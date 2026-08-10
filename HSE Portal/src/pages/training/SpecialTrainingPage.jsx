import PageHeader from '../../components/PageHeader';
import { SPECIAL_TRAININGS } from '../../data/trainingData';

export default function SpecialTrainingPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Special & Job-Specific Training"
        subtitle="High-risk work competency training"
      />

      <div className="info-card-grid">
        {SPECIAL_TRAININGS.map((s) => (
          <div
            key={s.key}
            className="info-card"
            role="button"
            tabIndex={0}
            onClick={() => pushToast(`${s.title}: ${s.trained} employees trained, ${s.pct}% competent.`, 'info')}
          >
            <div className="info-card-emoji">{s.emoji}</div>
            <div className="info-card-title">{s.title}</div>
            <div className="info-card-desc">{s.desc}</div>
            <div className="info-card-foot">
              <span className="foot-count">{s.trained} trained</span>
              <span className="foot-pct">{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
