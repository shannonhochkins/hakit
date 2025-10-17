import { useState } from 'react';
import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { PageField } from '@components/Form/Field/Page';
import { PageValue } from '@typings/fields';

export function StyleguidePageFields() {
  const [page, setPage] = useState<PageValue | undefined>(undefined);
  const [pages, setPages] = useState<PageValue[] | undefined>(undefined);
  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Page Fields'>
        <PageField value={page} onChange={setPage} id='page' />
        <PageField multiple value={pages} onChange={setPages} id='pages' />
        <hr />
        <p>Multiple</p>
        <ul>
          {pages?.map(p => (
            <li key={p.pageId}>
              Page: {p.pageId}, Dashboard: {p.dashboardId}
            </li>
          ))}
        </ul>
        <hr />
        <p>Single</p>
        <div>
          Page:{page?.pageId}, Dashboard:{page?.dashboardId}
        </div>
      </Group>
    </Column>
  );
}
