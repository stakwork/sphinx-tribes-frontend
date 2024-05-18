import React, { useEffect, useState } from 'react';
import { mainStore } from 'store/main';
import styled from 'styled-components';
import { Button } from 'components/common';
import threeDotsIcon from '../Icons/threeDotsIcon.svg';
import { AddRepoModal } from './AddRepoModal';

const AddRepos = () => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentuuid, setCurrentuuid] = useState('');
  const [modalType, setModalType] = useState('add'); // add this line

  const AddRepos = async () => {
    const workspace_uuid = 'cmrrbatm098te8m1rvd0';
    try {
      await mainStore.createOrUpdateRepository({ workspace_uuid, name, url });
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (type: string, repository?: any) => {
    if (type === 'add') {
      setName('');
      setCurrentuuid('');
      setUrl('');
      setIsModalVisible(true);
      setModalType(type);
      AddRepos();
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

  const DeleteRepository = async (workspace_uuid: string, repository_uuid: string) => {
    try {
      const resp = await mainStore.deleteRepository(workspace_uuid, repository_uuid);
      console.log('DeleteRepository', resp);
      closeModal();
    } catch (error) {
      console.error('Error deleteRepository', error);
    }
  };

  const handleSave = () => {
    closeModal();
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

  const Container = styled.div`
    font-family: 'Barlow', sans-serif;
    color: #3f3f3f;
    text-align: left;
    margin: 10px 120px;
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
    height: 200px;
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
    margin: 0;
  `;

  const FlexSection = styled.div`
    display: flex;
    flex-direction: row;
  `;
  const RightContainer = styled.div`
    width: 570px;
    height: 450px;
    border: 1px solid #3f3f3f;
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: center;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
  `;
  const TopContainer = styled.div`
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
  `;
  const BottomContainer = styled.div``;

  return (
    <>
      <TopContainer>
        <Container>
          <Button text={'Add Repository'} onClick={() => openModal('add')} />
        </Container>

        <Container>
          <h2>Bounties Platform</h2>
        </Container>
      </TopContainer>

      <BottomContainer>
        <FlexSection>
          <div>
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
                    <h6>{repository.name}</h6>:
                    <a href={repository.url} target="_blank" rel="noreferrer">
                      {repository.url}
                    </a>
                  </StyledListElement>
                ))}
              </StyledList>
            </Container>
          </div>
          <RightContainer>
            <h5>Schematics</h5>
            <h5>Test-Coverage</h5>
            <h5>Knowledge Graph</h5>
            <h5>People</h5>
          </RightContainer>
        </FlexSection>
      </BottomContainer>
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
