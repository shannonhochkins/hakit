import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/me/logout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/me/logout/"!</div>
}
