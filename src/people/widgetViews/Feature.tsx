// import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
// import {
//   Body,
//   FeatureBody,
//   FeatureLabel,
//   FeatureName,
//   Leftheader,
//   Header,
//   HeaderWrap,
//   DataWrap,
//   FieldWrap,
//   Label,
//   Data,
//   OptionsWrap,
//   TextArea,
//   ButtonWrap,
//   ActionButton
// } from 'pages/tickets/style';
// import React, { useCallback, useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useStores } from 'store';
// import { Feature } from 'store/main';
// import MaterialIcon from '@material/react-material-icon';
//
// const WorkspaceFeature = () => {
//   const { main, ui } = useStores();
//   const { uuid } = useParams<{ feature_uuid: string }>();
//   const [featureData, setFeatureData] = useState<Feature>();
//   const [loading, setLoading] = useState(true);
//   const [displayArchitecture, setDidplayArchitecture] = useState(false);
//   const [editArchitecture, setEditArchitecture] = useState(false);
//   const [architecture, setArchitecture] = useState(featureData?.architecture);
//
//   const getFeatureData = useCallback(async () => {
//     if (!uuid) return;
//     const featureData = await main.getFeaturesByUuid(uuid);
//     if (!featureData) return;
//     setFeatureData(featureData);
//
//     setLoading(false);
//   }, [uuid, main]);
//
//   useEffect(() => {
//     getFeatureData();
//   }, [getFeatureData]);
//
//   const toastsEl = (
//     <EuiGlobalToastList
//       toasts={ui.toasts}
//       dismissToast={() => ui.setToasts([])}
//       toastLifeTimeMs={3000}
//     />
//   );
//
//   if (loading) {
//     return (
//       <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
//         <EuiLoadingSpinner size="xl" />
//       </Body>
//     );
//   }
//
//   const editArchitectureActions = () => {
//     setEditArchitecture(!editArchitecture);
//     setDidplayArchitecture(false);
//   };
//
//   const architectureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const newValue = e.target.value;
//     if (newValue.length) {
//       setArchitecture(newValue);
//     }
//   };
//
//   const submitArchitecture = async () => {
//     const body = {
//       architecture: architecture ?? '',
//       uuid: featureData?.uuid ?? '',
//       workspace_uuid: featureData?.workspace_uuid ?? ''
//     };
//     await main.addWorkspaceFeature(body);
//     await getFeatureData();
//     setEditArchitecture(false);
//   };
//
//   return (
//     !loading && (
//       <FeatureBody>
//         <HeaderWrap>
//           <Header>
//             <Leftheader>
//               <FeatureName>
//                 <FeatureLabel>{featureData?.name}</FeatureLabel>
//               </FeatureName>
//             </Leftheader>
//           </Header>
//         </HeaderWrap>
//         <DataWrap>
//           <FieldWrap>
//             <Label>Architecture</Label>
//             <Data>
//               <OptionsWrap>
//                 <MaterialIcon
//                   icon={'more_horiz'}
//                   className="MaterialIcon"
//                   onClick={() => setDidplayArchitecture(!displayArchitecture)}
//                   data-testid="architecture-option-btn"
//                 />
//                 <button
//                   style={{ display: displayArchitecture ? 'block' : 'none' }}
//                   onClick={editArchitectureActions}
//                   data-testid="architecture-edit-btn"
//                 >
//                   Edit
//                 </button>
//               </OptionsWrap>
//               {!editArchitecture && (
//                 <div
//                   dangerouslySetInnerHTML={{
//                     __html: featureData?.architecture
//                       ? featureData.architecture.replace(/\n/g, '<br/>')
//                       : 'No architecture yet'
//                   }}
//                 />
//               )}
//
//               {editArchitecture && (
//                 <>
//                   <TextArea
//                     placeholder="Enter architecture"
//                     onChange={architectureChange}
//                     value={architecture ?? featureData?.architecture}
//                     data-testid="architecture-textarea"
//                     rows={10}
//                     cols={50}
//                   />
//                   <ButtonWrap>
//                     <ActionButton
//                       onClick={() => setEditArchitecture(!editArchitecture)}
//                       data-testid="architecture-cancel-btn"
//                     >
//                       Cancel
//                     </ActionButton>
//                     <ActionButton
//                       color="primary"
//                       onClick={submitArchitecture}
//                       data-testid="architecture-update-btn"
//                     >
//                       Update
//                     </ActionButton>
//                   </ButtonWrap>
//                 </>
//               )}
//             </Data>
//           </FieldWrap>
//         </DataWrap>
//         {toastsEl}
//       </FeatureBody>
//     )
//   );
// };
//
// export default WorkspaceFeature;
