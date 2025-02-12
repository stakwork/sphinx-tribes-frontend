import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const Text = styled.h1`
  color: #333;
  font-size: 24px;
  text-align: center;
`;

const Activities = () => (
  <Container>
    <Text>Activities View - Coming Soon!</Text>
  </Container>
);

export default Activities;
