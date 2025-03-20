import React, { useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { useStores } from '../../store';
import { skillsStore } from '../../store/skillsStore';
import { ChargeModel, SkillStatus } from '../../store/interface';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #333;
  }
`;

const FormLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 20px;
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const UserList = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const AssignButton = styled.button<{ assigned?: boolean }>`
  padding: 6px 12px;
  border-radius: 16px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  background-color: ${(props) => (props.assigned ? '#E8F0FE' : '#f1f1f1')};
  color: ${(props) => (props.assigned ? '#1967D2' : '#666')};
  &:hover {
    background-color: ${(props) => (props.assigned ? '#D2E3FC' : '#e1e1e1')};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: white;
  border: 1px solid #ddd;
  color: #666;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #1a73e8;
  border: none;
  color: white;
  &:hover {
    background-color: #1557b0;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-top: 5px;
`;

const ImagePreview = styled.div`
  margin-top: 10px;
  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
  }
`;

const FormField = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: transparent;

  &:focus {
    outline: none;
    border-color: #82b4ff;
  }

  &:focus ~ label,
  &:not(:placeholder-shown) ~ label {
    transform: translateY(-24px) scale(0.8);
    color: #666;
    background: white;
    padding: 6px;
    font-weight: 500;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 14px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 150px;
  resize: vertical;
  background: transparent;

  &:focus {
    outline: none;
    border-color: #82b4ff;
  }

  &:focus ~ label,
  &:not(:placeholder-shown) ~ label {
    transform: translateY(-24px) scale(0.8);
    color: #666;
    background: white;
    padding: 6px;
    font-size: 15px;
    font-weight: 500;
  }
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: 12px;
  top: 12px;
  color: #999;
  font-size: 14px;
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.2s ease;
  background: transparent;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  appearance: auto;
  color: black;

  &:focus {
    outline: none;
    border-color: #82b4ff;
  }

  &:focus + label,
  &:not([value='']):not([value='undefined']) + label {
    transform: translateY(-20px) scale(0.85);
    color: #666;
    background: white;
    padding: 4px;
    font-weight: 500;
  }

  /* Apply color to the select when showing placeholder */
  &:invalid,
  &:required:invalid {
    color: #666;
  }
`;

interface User {
  id: string;
  pubkey: string;
  alias: string;
  img?: string;
}

interface AddNewSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: User[];
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Skill name is required'),
  tagline: Yup.string().required('Tag line is required'),
  description: Yup.string().required('Description is required'),
  ownerPubkey: Yup.string().required('Owner assignment is required'),
  iconUrl: Yup.string().required('Icon URL is required'),
  chargeModel: Yup.string().required('Charging model is required'),
  status: Yup.string().required('Status is required'),
  labels: Yup.array().min(1, 'At least one label is required')
});

const initialValues = {
  name: '',
  tagline: '',
  description: '',
  ownerPubkey: '',
  ownerAlias: '',
  iconUrl: '',
  chargeModel: '' as unknown as ChargeModel,
  status: '' as unknown as SkillStatus,
  type: 'skill',
  labels: [] as string[]
};

const AddNewSkillModal: React.FC<AddNewSkillModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  users
}) => {
  const { main } = useStores();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = users.filter((user) => user.alias.toLowerCase().includes(query.toLowerCase()));
    setFilteredUsers(filtered);
  };

  const handleIconPaste = async (
    e: React.ClipboardEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const { items } = e.clipboardData;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();

        const blob = items[i].getAsFile();
        if (!blob) continue;

        try {
          const formData = new FormData();
          formData.append('image', blob);

          const response = await main.uploadFile(formData);
          if (!response) throw new Error('Upload failed');

          const data = await response.json();
          const imageUrl = data.url;

          setFieldValue('iconUrl', imageUrl);
          setPreviewImage(imageUrl);
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    }
  };

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      const result = await skillsStore.createSkill(values);
      if (result) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create skill:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>New Skill</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, errors, touched }) => (
            <Form>
              <FormLayout>
                <LeftSection>
                  <FormField>
                    <Field as={StyledInput} id="name" name="name" placeholder=" " />
                    <FloatingLabel htmlFor="name">Skill Name</FloatingLabel>
                    {errors.name && touched.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                  </FormField>

                  <FormField>
                    <Field as={StyledInput} id="tagline" name="tagline" placeholder=" " />
                    <FloatingLabel htmlFor="name">Tag line</FloatingLabel>
                    {errors.name && touched.name && <ErrorMessage>{errors.tagline}</ErrorMessage>}
                  </FormField>

                  <FormField>
                    <Field as={StyledTextArea} id="description" name="description" placeholder="" />
                    <FloatingLabel htmlFor="description">Description</FloatingLabel>
                    {errors.description && touched.description && (
                      <ErrorMessage>{errors.description}</ErrorMessage>
                    )}
                  </FormField>

                  <FormField>
                    <Field
                      as={StyledInput}
                      id="iconUrl"
                      name="iconUrl"
                      innerRef={iconInputRef}
                      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
                        handleIconPaste(e, setFieldValue)
                      }
                      placeholder=" "
                    />
                    {previewImage && (
                      <ImagePreview>
                        <img src={previewImage} alt="Icon preview" />
                      </ImagePreview>
                    )}
                    <FloatingLabel htmlFor="iconUrl">Icon URL - Paste Picture or URL</FloatingLabel>
                    {errors.iconUrl && touched.iconUrl && (
                      <ErrorMessage>{errors.iconUrl}</ErrorMessage>
                    )}
                  </FormField>

                  <FormField>
                    <Field as={StyledSelect} id="chargeModel" name="chargeModel" required>
                      <option value="" style={{ color: '#666' }}>
                        Select charging model
                      </option>
                      <option value="Free">Free</option>
                      <option value="PAYG">Paid</option>
                    </Field>
                    <FloatingLabel htmlFor="chargeModel">Charging</FloatingLabel>
                    {errors.chargeModel && touched.chargeModel && (
                      <ErrorMessage>{errors.chargeModel}</ErrorMessage>
                    )}
                  </FormField>

                  <FormField>
                    <Field as={StyledSelect} id="status" name="status" required>
                      <option value="" style={{ color: '#666' }}>
                        Select status
                      </option>
                      <option value="Draft">Draft</option>
                      <option value="Approved">Approved</option>
                      <option value="Archived">Archived</option>
                    </Field>
                    <FloatingLabel htmlFor="status">Status</FloatingLabel>
                    {errors.status && touched.status && (
                      <ErrorMessage>{errors.status}</ErrorMessage>
                    )}
                  </FormField>
                </LeftSection>

                <RightSection>
                  <FormGroup>
                    <Label>Assign Owner</Label>
                    <Input
                      type="text"
                      placeholder="Type to search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <UserList>
                      {filteredUsers.map((user) => (
                        <UserItem
                          key={user.id}
                          onClick={() => {
                            setFieldValue('ownerPubkey', user.pubkey);
                            setFieldValue('ownerAlias', user.alias);
                          }}
                        >
                          <UserAvatar src={user.img || '/default-avatar.png'} alt={user.alias} />
                          <UserInfo>
                            <UserName>{user.alias}</UserName>
                          </UserInfo>
                          <AssignButton
                            type="button"
                            assigned={user.pubkey === initialValues.ownerPubkey}
                          >
                            {user.pubkey === initialValues.ownerPubkey ? 'Assigned' : 'Assign'}
                          </AssignButton>
                        </UserItem>
                      ))}
                    </UserList>
                    {errors.ownerPubkey && touched.ownerPubkey && (
                      <ErrorMessage>{errors.ownerPubkey}</ErrorMessage>
                    )}
                  </FormGroup>
                </RightSection>
              </FormLayout>

              <ButtonContainer>
                <CancelButton type="button" onClick={onClose}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </SubmitButton>
              </ButtonContainer>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddNewSkillModal;
