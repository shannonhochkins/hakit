import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { configsQueryOptions } from '@client/src/lib/api/configuration';

export const Route = createFileRoute('/_authenticated/editor/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const configurations = useQuery(configsQueryOptions);

  const data = configurations.data;

  if (configurations.isLoading || !data) {
    return <div>Loading...</div>
  }
  if (configurations.isError) {
    return <div>Error: {configurations.error.message}</div>
  }
  return <>
    {data.map((config) => {
      return <div key={config.id}>
        <span>name: {config.name}-{config.id}</span>
        {config.pageConfigurationIds?.map((pageId) => {
          return <button key={pageId} onClick={() => {
            navigate({
              to: '/editor/$configId/$pageId',
              params: {
                configId: String(config.id),
                pageId: pageId,
              }
            });
          }
          }>View</button>
        })}
        
        
      </div>
    })}
  </>
}
