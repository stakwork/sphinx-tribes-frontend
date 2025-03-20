import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { skillsStore } from '../../store/skillsStore.ts';
import AdminAccessDenied from '../superadmin/accessDenied';
import { useStores } from '../../store';
import AddNewSkillModal from './AddNewSkillModal';

const Container = styled.div`
  padding: 20px 60px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 25px;
  font-weight: bold;
`;

const AddButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  margin-top: 40px;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Table = styled.table`
  width: 90%;
  border-collapse: collapse;
  border: none;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  border: none;
`;

const Td = styled.td`
  padding: 10px;
  border: none;
`;

const ActionMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const Ellipsis = styled.div`
  cursor: pointer;
  font-size: 20px;
  transform: rotate(90deg);
  margin-left: 10px;
`;

const Dropdown = styled.div`
  position: absolute;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  left: 25px;
  min-width: 100px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background: #e9e9e9;
  }
`;

const DropdownItemDelete = styled(DropdownItem)`
  color: red;
  font-weight: bold;
`;

const ManageSkillsPage: React.FC = observer(() => {
  const [skills, setSkills] = useState(Array.from(skillsStore.skills.values()));
  const { main } = useStores();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const getIsSuperAdmin = useCallback(async () => {
    const isSuperAdmin = await main.getSuperAdmin();
    setIsSuperAdmin(isSuperAdmin);
  }, [main]);

  useEffect(() => {
    getIsSuperAdmin().finally(() => {
      setPermissionsChecked(true);
    });
  }, [getIsSuperAdmin]);

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoading(true);
      try {
        await skillsStore.loadAllSkills();
        setSkills(Array.from(skillsStore.skills.values()));
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await main.getPeople();
        setUsers(usersList || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    fetchUsers();
  }, [main]);

  const handleDelete = async (id: string) => {
    await skillsStore.deleteSkill(id);
    setSkills(Array.from(skillsStore.skills.values()));
  };

  const handleToggleMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSkillCreated = async () => {
    try {
      await skillsStore.loadAllSkills();
      setSkills(Array.from(skillsStore.skills.values()));
    } catch (error) {
      console.error('Failed to refresh skills:', error);
    }
  };

  return (
    <>
      {!permissionsChecked ? (
        <Container>Loading permissions...</Container>
      ) : !isSuperAdmin ? (
        <AdminAccessDenied />
      ) : (
        <Container>
          <Header>
            <Title>Manage Skills Page</Title>
            <AddButton onClick={handleOpenModal}>Add new skill</AddButton>
          </Header>
          {isLoading ? (
            <div>Loading skills data...</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Skill Name</Th>
                  <Th>Owner</Th>
                  <Th>Type</Th>
                  <Th>Labels</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {skills.length === 0 ? (
                  <tr>
                    <Td colSpan={6} style={{ textAlign: 'center' }}>
                      No skills found. Add a new skill to get started.
                    </Td>
                  </tr>
                ) : (
                  skills.map((skill) => (
                    <tr key={skill.id}>
                      <Td>{skill.name}</Td>
                      <Td>{skill.ownerAlias}</Td>
                      <Td>{skill.type}</Td>
                      <Td>{skill.labels.join(', ')}</Td>
                      <Td>{skill.status}</Td>
                      <Td>
                        <ActionMenu>
                          <Ellipsis onClick={() => handleToggleMenu(skill.id)}>⋮</Ellipsis>
                          {openMenu === skill.id && (
                            <Dropdown>
                              <DropdownItem>Edit</DropdownItem>
                              <DropdownItemDelete onClick={() => handleDelete(skill.id)}>
                                Delete
                              </DropdownItemDelete>
                            </Dropdown>
                          )}
                        </ActionMenu>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}

          <AddNewSkillModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSuccess={handleSkillCreated}
            users={users}
          />
        </Container>
      )}
    </>
  );
});

export default ManageSkillsPage;
