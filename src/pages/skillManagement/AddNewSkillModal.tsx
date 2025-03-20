import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import styled, { createGlobalStyle } from 'styled-components';
import { useStores } from '../../store';
import { skillsStore } from '../../store/skillsStore';
import { ChargeModel, SkillStatus } from '../../store/interface';
import InvitePeopleSearch from '../../components/form/inputs/widgets/PeopleSearch';

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
  gap: 35px;
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

const PeopleSearchContainer = styled.div`
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 15px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 700;
  color: #878787;
  margin-bottom: 4px;
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

  &:invalid,
  &:required:invalid {
    color: #666;
  }
`;

const getLabelColor = (label: string) => {
  const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colors = [
    { bg: '#ffcdd2', text: '#c62828' },
    { bg: '#f8bbd0', text: '#ad1457' },
    { bg: '#e1bee7', text: '#6a1b9a' },
    { bg: '#d1c4e9', text: '#4527a0' },
    { bg: '#c5cae9', text: '#283593' },
    { bg: '#bbdefb', text: '#1565c0' },
    { bg: '#b3e5fc', text: '#0277bd' },
    { bg: '#b2ebf2', text: '#00838f' },
    { bg: '#b2dfdb', text: '#00695c' },
    { bg: '#c8e6c9', text: '#2e7d32' },
    { bg: '#dcedc8', text: '#558b2f' },
    { bg: '#f0f4c3', text: '#9e9d24' },
    { bg: '#fff9c4', text: '#f9a825' },
    { bg: '#ffecb3', text: '#ff8f00' },
    { bg: '#ffe0b2', text: '#ef6c00' },
    { bg: '#ffccbc', text: '#d84315' }
  ];

  return colors[hash % colors.length];
};

const InlineLabelBubble = styled.div<{ bgColor: string; textColor: string }>`
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.textColor};
  padding: 4px 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  font-size: 13px;
  margin: 3px 5px 3px 0;
  font-weight: 500;
`;

const InlineRemoveLabel = styled.span`
  margin-left: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
  &:hover {
    opacity: 0.8;
  }
`;

const InlineInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 5px;
  min-width: 100px;
  background: transparent;
`;

const StyledInputContainer = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 5px 8px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: white;
  min-height: 42px;

  &:focus-within {
    border-color: #82b4ff;
    outline: none;
  }

  &.focused ~ label,
  &:has(${InlineLabelBubble}) ~ label {
    transform: translateY(-24px) scale(0.8);
    color: #666;
    background: white;
    padding: 0 6px;
    font-weight: 500;
  }
`;

interface AddNewSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CustomPeopleListStyles = createGlobalStyle`
#custom-people-list-wrapper  .SearchSkillContainer{
  margin-left: 27% !important;
  margin-bottom: 0 !important;
  margin-top: 3% !important;
}

#custom-people-list-wrapper .OuterContainer {
    margin-left: 27% !important;
  }

  #custom-people-list-wrapper .OuterContainer .PeopleList {
    width: 320px !important;
    padding: 0 10px 16px !important;
    background: none !important;
    box-shadow: none !important;
  }

`;

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

const AddNewSkillModal: React.FC<AddNewSkillModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { main } = useStores();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [peopleList, setPeopleList] = useState<any[]>([]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const people = await main.getPeople();
        setPeopleList(people || []);
      } catch (error) {
        console.error('Failed to fetch people:', error);
      }
    };

    if (isOpen) {
      fetchPeople();
    }
  }, [isOpen, main]);

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
    <>
      <CustomPeopleListStyles />
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
            {({ isSubmitting, setFieldValue, errors, touched, values }) => (
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
                      <Field
                        as={StyledTextArea}
                        id="description"
                        name="description"
                        placeholder=""
                      />
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
                      <FloatingLabel htmlFor="iconUrl">
                        Icon URL - Paste Picture or URL
                      </FloatingLabel>
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
                      <PeopleSearchContainer>
                        <Label>Assign Owner</Label>
                        <div id="custom-people-list-wrapper">
                          <InvitePeopleSearch
                            peopleList={peopleList}
                            isProvidingHandler={true}
                            handleAssigneeDetails={(value) => {
                              setFieldValue('ownerPubkey', value.owner_pubkey);
                              setFieldValue('ownerAlias', value.owner_alias);
                            }}
                          />
                        </div>
                      </PeopleSearchContainer>
                      {errors.ownerPubkey && touched.ownerPubkey && (
                        <ErrorMessage>{errors.ownerPubkey}</ErrorMessage>
                      )}
                    </FormGroup>

                    <FormField>
                      <StyledInputContainer className="label-input-container">
                        {values.labels &&
                          values.labels.map((label: string) => {
                            const colorSet = getLabelColor(label);
                            return (
                              <InlineLabelBubble
                                key={label}
                                bgColor={colorSet.bg}
                                textColor={colorSet.text}
                              >
                                {label}
                                <InlineRemoveLabel
                                  onClick={() => {
                                    const currentLabels = values.labels || [];
                                    setFieldValue(
                                      'labels',
                                      currentLabels.filter((l: string) => l !== label)
                                    );
                                  }}
                                >
                                  ×
                                </InlineRemoveLabel>
                              </InlineLabelBubble>
                            );
                          })}
                        <InlineInput
                          id="labelInput"
                          name="labelInput"
                          placeholder=" "
                          onFocus={(e) => {
                            e.currentTarget.parentElement?.classList.add('focused');
                          }}
                          onBlur={(e) => {
                            if (!e.currentTarget.value) {
                              e.currentTarget.parentElement?.classList.remove('focused');
                            }
                          }}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (
                              (e.key === 'Tab' || e.key === 'Enter' || e.key === ',') &&
                              e.currentTarget.value.trim()
                            ) {
                              e.preventDefault();
                              const newLabel = e.currentTarget.value.trim().replace(/,+$/, '');
                              const currentLabels = values.labels || [];
                              if (newLabel && !currentLabels.includes(newLabel)) {
                                setFieldValue('labels', [...currentLabels, newLabel]);
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </StyledInputContainer>
                      <FloatingLabel htmlFor="labelInput">Labels</FloatingLabel>
                      {errors.labels && touched.labels && (
                        <ErrorMessage>{errors.labels}</ErrorMessage>
                      )}
                    </FormField>
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
    </>
  );
};

export default AddNewSkillModal;
