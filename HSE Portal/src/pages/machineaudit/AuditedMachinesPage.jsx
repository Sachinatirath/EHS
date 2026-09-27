import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconTool } from '../../components/icons';
import { listAudits, summarizeMachines } from './store';
import AuditedMachines from './AuditedMachines';

/** Every machine that has been audited, across all departments. */
export default function AuditedMachinesPage({ pushToast }) {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listAudits()
      .then((list) => { if (!cancelled) setAudits(list); })
      .catch((err) => { if (!cancelled) pushToast(err.message, 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const count = summarizeMachines(audits).length;

  return (
    <div className="page-enter">
      <PageHeader title="Audited Machines" subtitle={loading ? ' ' : `${count} machine${count === 1 ? '' : 's'} audited · ${audits.length} audits in total`} />
      <Panel title="All Audited Machines" icon={<IconTool size={17} />}>
        <AuditedMachines audits={audits} loading={loading} />
      </Panel>
    </div>
  );
}
