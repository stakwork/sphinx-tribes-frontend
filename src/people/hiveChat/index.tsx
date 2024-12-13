import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { EuiLoadingSpinner } from '@elastic/eui';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 500;
  color: #5f6368;
  margin: 0;
`;

interface RouteParams {
  uuid: string;
  chatId: string;
}

export const HiveChatView: React.FC = () => {
  const { chatId } = useParams<RouteParams>();
  const { chat } = useStores();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadChat = async () => {
      try {
        if (!chatId) {
          setError('No chat ID provided');
          return;
        }
        const messages = await chat.loadChatHistory(chatId);
        console.log('Loaded chat messages:', messages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading chat:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    };
    loadChat();
  }, [chatId, chat]);

  if (loading) {
    return (
      <Container>
        <EuiLoadingSpinner size="l" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Error: {error}</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Talk to Hive - Chat {chatId}</Title>
    </Container>
  );
};
