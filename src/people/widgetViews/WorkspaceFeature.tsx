import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { Feature } from 'store/interface';

const WorkspaceFeature = () => {
  const { feature_uuid } = useParams<{ feature_uuid: string }>();
  const [feature, setFeature] = useState<Feature>();
  const { main, ui } = useStores();
  const getFeature = useCallback(async () => {
    if (!feature_uuid) return;
    const feature = await main.getFeaturesByUuid(feature_uuid);
    if (!feature) return;
    setFeature(feature);
  }, [feature_uuid, main]);

  useEffect(() => {
    getFeature();
  }, [getFeature]);
  return (
    <>
      <h1>{feature ? feature.name : ''}</h1>
    </>
  );
};

export default WorkspaceFeature;
