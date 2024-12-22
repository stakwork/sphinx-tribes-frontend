import styled from 'styled-components';
import { colors } from '../../config/colors';

const color = colors['light'];

export const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 30px auto;
  width: 100%;
  padding: 40px 30px;
  background: white;
`;

export const Title = styled.h1`
  text-align: center;
  color: ${color.text1};
  margin-bottom: 40px;
  font-size: 28px;
  font-weight: 500;
`;
