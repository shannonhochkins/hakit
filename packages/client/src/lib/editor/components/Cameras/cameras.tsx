import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/editor/components/Cameras/cameras')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/editor/components/Cameras/cameras"!</div>
}
