import React, { ChangeEvent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { snippetStore } from '../../../store/snippetStore.ts';

const ModalContent = styled.div`
  background: #fff;
  padding: 2rem 0;
  border-radius: 10px;
  width: 100%;
  max-width: 95%;
  height: 100%;
`;

const ModalHeader = styled.h2`
  margin: 0 0 1rem;
  font-size: 1.7rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: ${(props: any) => (props.variant === 'danger' ? '#e74c3c' : '#3498db')};
  color: #fff;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const CreateButton = styled.button`
  display: block;
  margin: 1rem auto;
  padding: 0.5rem 2rem;
  background: linear-gradient(90deg, #8e44ad, #b705ff);
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  width: 100%;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #9b59b6, #8e44ad);
  }
`;

const ActionLink = styled.button`
  background: none;
  border: none;
  color: #8e44ad;
  font-size: 0.9rem;
  cursor: pointer;
  margin-right: 0.5rem;
  text-decoration: underline;
  width: 40px;

  &:hover {
    color: #6c3483;
  }
`;

const SnippetTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  max-height: 400px;
  overflow-y: auto;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ddd;
  background: #f3f3f3;
  font-weight: bold;
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
  &:last-child {
    display: flex;
    justify-content: flex-start;
  }
`;

const SnippetTableRow = styled.tr`
  &:hover {
    background-color: #f1f1f1;
  }
`;

interface TextSnippetModalProps {
  isVisible: boolean;
  workspaceUUID: string;
}

const TextSnippetModal: React.FC<TextSnippetModalProps> = observer(
  ({ isVisible, workspaceUUID }: TextSnippetModalProps) => {
    const [title, setTitle] = useState('');
    const [snippet, setSnippet] = useState('');
    const [snippetToEdit, setSnippetToEdit] = useState<{
      id: string;
      title: string;
      snippet: string;
    } | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
      snippetStore.loadSnippets(workspaceUUID);
    }, [workspaceUUID]);

    const handleSave = async () => {
      setLoadingStates({ ...loadingStates, [snippetToEdit?.id || '']: true });
      try {
        if (snippetToEdit) {
          await snippetStore.updateSnippet(snippetToEdit.id, title, snippet, workspaceUUID);
        } else {
          await snippetStore.createSnippet(workspaceUUID, title, snippet);
        }
        await snippetStore.loadSnippets(workspaceUUID);
        setSnippetToEdit(null);
        setTitle('');
        setSnippet('');
        setIsFormVisible(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStates({ ...loadingStates, [snippetToEdit?.id || '']: false });
      }
    };

    const handleDelete = async (id: string) => {
      setLoadingStates((prevState: { [p: string]: boolean }) => ({ ...prevState, [id]: true }));
      try {
        await snippetStore.deleteSnippet(id, workspaceUUID);
        await snippetStore.loadSnippets(workspaceUUID);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStates((prevState: { [p: string]: boolean }) => ({ ...prevState, [id]: false }));
      }
    };

    const handleEdit = (snippet: { id: string; title: string; snippet: string }) => {
      setSnippetToEdit(snippet);
      setTitle(snippet.title);
      setSnippet(snippet.snippet);
      setIsFormVisible(true);
    };

    const handleCreate = () => {
      setSnippetToEdit(null);
      setTitle('');
      setSnippet('');
      setIsFormVisible(true);
    };

    if (!isVisible) return null;

    return (
      <ModalContent>
        {!isFormVisible && <ModalHeader>Text Snippets</ModalHeader>}

        {!isFormVisible && (
          <>
            <CreateButton onClick={handleCreate}>Create a Text Snippet</CreateButton>
            <SnippetTable>
              <thead>
                <tr>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {snippetStore.snippets.map(
                  (snippet: { id: string; title: string; snippet: string }) => (
                    <SnippetTableRow key={snippet.id}>
                      <TableCell>{snippet.title}</TableCell>
                      <TableCell>{snippet.snippet}</TableCell>
                      <TableCell>
                        <ActionLink onClick={() => handleEdit(snippet)}>Edit</ActionLink>
                        <ActionLink
                          onClick={() => handleDelete(snippet.id)}
                          disabled={loadingStates[snippet.id]}
                          style={{ color: '#e74c3c' }}
                        >
                          {loadingStates[snippet.id] ? 'Deleting...' : 'Delete'}
                        </ActionLink>
                      </TableCell>
                    </SnippetTableRow>
                  )
                )}
              </tbody>
            </SnippetTable>
          </>
        )}

        {isFormVisible && (
          <div>
            <ModalHeader>{snippetToEdit ? 'Edit Snippet' : 'Create New Snippet'}</ModalHeader>
            <Input
              type="text"
              placeholder="Snippet Title"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
            <Textarea
              rows={4}
              placeholder="Snippet Description"
              value={snippet}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSnippet(e.target.value)}
            />
            <ButtonContainer>
              <Button
                onClick={() => {
                  setSnippetToEdit(null);
                  setTitle('');
                  setSnippet('');
                  setIsFormVisible(false);
                }}
                variant="danger"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                disabled={!title || !snippet || loadingStates[snippetToEdit?.id || '']}
              >
                {loadingStates[snippetToEdit?.id || '']
                  ? 'Saving...'
                  : snippetToEdit
                  ? 'Update Snippet'
                  : 'Create Snippet'}
              </Button>
            </ButtonContainer>
          </div>
        )}
      </ModalContent>
    );
  }
);

export default TextSnippetModal;
