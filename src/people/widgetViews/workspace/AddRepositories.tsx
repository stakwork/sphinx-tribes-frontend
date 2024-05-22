import React, { useEffect, useState } from 'react';
import { mainStore } from 'store/main';
import styled from 'styled-components';

const AddRepos: React.FC = () => {

  const [repositories, setRepositories] = useState([]);

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

  const StyledTitle = styled.h1`
    font-family: 'Barlow', sans-serif;
    color: #3f3f3f; // replace with your preferred color
    text-align: left;
    margin: 20px 60px; // replace with your preferred margin
  `;

  const Container = styled.div`
    font-family: 'Barlow', sans-serif;
    color: #3f3f3f; // replace with your preferred color
    text-align: left;
    margin: 10px 60px; // replace with your preferred margin
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
  return (
    <>
      {/* <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e:any) => setName(e.target.value)} placeholder="Repository name" />
        <input type="text" value={url} onChange={(e:any) => setUrl(e.target.value)} placeholder="Repository url" />
        <button type="submit">Add Repository</button>
      </form>
    </div> */}

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

        <ul>
          {repositories.map((repository: any) => (
            <StyledListElement key={repository.id}>
              <input type="button" />
              <p>{repository.name}</p>:
              <a href={repository.url} target="_blank" rel="noreferrer">
                {repository.url}
              </a>
            </StyledListElement>
          ))}
        </ul>
      </Container>
    </>
  );
};

export default AddRepos;
