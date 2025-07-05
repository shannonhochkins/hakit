// // THIS TYPE DOES NOT EXIST< IT"S CLEARLY BEEN MOVED/RENAMED
// import { ComponentFactoryData } from '@typings/puck';
// import { getFirstEntityByDomainPreference } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/entities';
// import { getDefaultServiceByEntity } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/services';
// import { ComponentData } from '@measured/puck';

// interface TapBehaviorProps {
//   tapType: 'action' | 'url' | 'navigate' | 'more_info' | 'custom' | 'nothing';
//   tapService?: string;
//   tapUrl?: string;
//   tapNavigationPath?: DashboardItem['id'];
//   tapCustom?: string;
// }

// export interface Actions {
//   actions: {
//     tapAction: TapBehaviorProps;
//   };
// }

// export async function resolveActionFields(
//   actionData: Omit<ComponentData<Actions>, 'type'>,
//   fields: CustomFieldsConfiguration<Actions, true>
// ) {
//   if (!actionData?.props?.actions?.tapAction) return;

//   const actionField = fields?.actions;

//   const { tapAction } = actionData.props.actions;
//   const tapActionType = tapAction.tapType ?? 'action';
//   if (actionField._field.type === 'object') {
//     const { tapAction } = actionField._field.objectFields;
//     if (tapAction._field.type === 'object') {
//       const actionFields = tapAction._field.objectFields;
//       const { tapCustom, tapNavigationPath, tapService, tapUrl } = actionFields;
//       if (tapCustom && tapNavigationPath && tapService && tapUrl) {
//         tapCustom._field.type = 'hidden';
//         tapNavigationPath._field.type = 'hidden';
//         tapService._field.type = 'hidden';
//         tapUrl._field.type = 'hidden';

//         if (tapActionType === 'action') {
//           tapService._field.type = 'service';
//         } else if (tapActionType === 'url') {
//           tapUrl._field.type = 'text';
//         } else if (tapActionType === 'navigate') {
//           tapNavigationPath._field.type = 'navigate';
//         } else if (tapActionType === 'custom') {
//           tapCustom._field.type = 'hidden';
//         } else {
//           // do nothing
//         }
//       }
//     }
//   }
// }

// export const getActionFields = async ({
//   getAllEntities,
//   getAllServices,
// }: ComponentFactoryData): Promise<CustomFieldsConfiguration<Actions>> => {
//   const entities = getAllEntities();
//   const services = await getAllServices();
//   const defaultEntity = getFirstEntityByDomainPreference(Object.values(entities), 'light', 'switch');
//   const defaultService = getDefaultServiceByEntity(defaultEntity.entity_id, services);
//   return {
//     actions: {
//       type: 'object',
//       label: 'Actions',
//       description: 'Actions for the components',
//       default: {},
//       disableBreakpoints: true,
//       collapsible: {
//         open: true,
//       },
//       objectFields: {
//         tapAction: {
//           type: 'object',
//           label: 'Tap Action',
//           description: 'The action to perform when the component is tapped',
//           default: {},
//           disableBreakpoints: true,
//           collapsible: {
//             open: true,
//           },
//           objectFields: {
//             tapType: {
//               type: 'select',
//               label: 'Tap Behavior',
//               description: 'The behavior when the component is tapped',
//               default: 'action',
//               options: [
//                 { label: 'Action', value: 'action' },
//                 { label: 'URL', value: 'url' },
//                 { label: 'Navigate', value: 'navigate' },
//                 { label: 'More Info', value: 'more_info' },
//                 { label: 'Custom', value: 'custom' },
//                 { label: 'Nothing', value: 'nothing' },
//               ],
//             },
//             tapService: {
//               type: 'service',
//               default: defaultService,
//               label: 'Service',
//               description: 'The service to call when the component is tapped',
//             },
//             tapUrl: {
//               type: 'text',
//               label: 'URL',
//               default: '',
//               description: 'The URL to open when the component is tapped',
//             },
//             tapNavigationPath: {
//               type: 'navigate',
//               label: 'Navigation Path',
//               default: undefined,
//               description: 'The navigation path to navigate to when the component is tapped',
//             },
//             tapCustom: {
//               type: 'text',
//               label: 'Custom',
//               default: '',
//               description: 'The custom action to perform when the component is tapped',
//             },
//           },
//         },
//       },
//     },
//   };
// };
