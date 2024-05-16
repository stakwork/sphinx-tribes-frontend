import React, { useEffect, useState } from 'react';
import { mainStore } from 'store/main';
import styled from 'styled-components';
import threeDotsIcon from '../Icons/threeDotsIcon.svg';
import { AddRepoModal } from './AddRepoModal';

const AddRepos = () => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentuuid, setCurrentuuid] = useState('');
  const [modalType, setModalType] = useState('add'); // add this line

  const openModal = (type: string, repository?: any) => {
    if (type === 'add') {
      setName('');
      setCurrentuuid('');
      setUrl('');
      setIsModalVisible(true);
      setModalType(type);
    } else if (type === 'edit') {
      setName(repository.name);
      setCurrentuuid(repository.uuid);
      setUrl(repository.url);
      setIsModalVisible(true);
      setModalType(type);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleSave = () => {
    // handle save logic here
    closeModal();
  };

  const DeleteRepository = async (workspace_uuid: string, repository_uuid: string) => {
    try {
      const resp = await mainStore.deleteRepository(workspace_uuid, repository_uuid);
      console.log('DeleteRepository', resp);
      closeModal();
    } catch (error) {
      console.error('Error deleteRepository', error);
    }
  };

  const handleDelete = () => {
    // handle delete logic here
    closeModal();
    console.log('Delete', currentuuid);
    DeleteRepository('cmrrbatm098te8m1rvd0', currentuuid);
  };

  useEffect(() => {
    const fetchRepositories = async () => {
      const workspace_uuid = 'cmrrbatm098te8m1rvd0';
      try {
        const data = await mainStore.getRepositories(workspace_uuid);
        setRepositories(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRepositories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const workspace_uuid = 'cmrrbatm098te8m1rvd0';
    try {
      await mainStore.createOrUpdateRepository({ workspace_uuid, name, url });
    } catch (error) {
      console.error(error);
    }
  };

  const StyledTitle = styled.h1`
    font-family: 'Barlow', sans-serif;
    color: #3f3f3f;
    text-align: left;
    margin: 20px 60px;
  `;

  const Container = styled.div`
    font-family: 'Barlow', sans-serif;
    color: #3f3f3f;
    text-align: left;
    margin: 10px 60px;
  `;

  const StyledInput = styled.input`
    width: 500px;
    padding: 5px;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    border: 2px solid #3f3f3f;
  `;
  const StyledTextArea = styled.textarea`
    width: 500px;
    height: 300px;
    padding: 5px;
    margin: 10px 0;
    font-weight: 500;
    border: 2px solid #3f3f3f;
    resize: none;
    overflow: auto;
  `;
  const StyledListElement = styled.li`
    display: flex;
  `;

  const StyledList = styled.ul`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0;
  `;

  return (
    <>
      <Container>
        <button onClick={() => openModal('add')}>Add Repository</button>
      </Container>

      <div>
        <StyledTitle>Bounties Platform</StyledTitle>
      </div>

      <Container>
        <h5>Mission</h5>
        <StyledInput type="text" value={'Acesss the largest pool of human cognition'} />
      </Container>

      <Container>
        <h5>Tactics and Objectives</h5>
        <StyledTextArea />
      </Container>

      <Container>
        <h5>Repositories</h5>

        <StyledList>
          {repositories.map((repository: any) => (
            <StyledListElement key={repository.id}>
              <img
                width={20}
                height={20}
                src={threeDotsIcon}
                alt="Three dots icon"
                onClick={() => openModal('edit', repository)}
              />
              <p>{repository.name}</p>:
              <a href={repository.url} target="_blank" rel="noreferrer">
                {repository.url}
              </a>
            </StyledListElement>
          ))}
        </StyledList>
      </Container>
      {isModalVisible && (
        <AddRepoModal
          isModalVisible={isModalVisible}
          closeModal={() => setIsModalVisible(false)}
          handleSave={handleSave}
          handleDelete={handleDelete}
          name={name}
          setName={setName}
          url={url}
          setUrl={setUrl}
          modalType={modalType} // add this line
        />
      )}
    </>
  );
};

export default AddRepos;
