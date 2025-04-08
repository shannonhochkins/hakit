import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { type QueryClient } from "@tanstack/react-query";
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root,
});

// function NavBar() {
//   return (
//     <div className="p-2 flex justify-between max-w-2xl m-auto items-baseline">
//       <Link to="/"><h1 className="text-2xl font-bold">Index</h1></Link>
//       <div className="flex gap-2">
//         <Link to="/dashboards" className="[&.active]:font-bold">
//           Dashboards
//         </Link>
//       </div>
//     </div>
//   );
// }

function Root() {
  return (
    <>
      {/* <NavBar />
      <hr /> */}
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}