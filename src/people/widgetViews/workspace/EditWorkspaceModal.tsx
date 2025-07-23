import React, { useRef, useState, ChangeEvent, DragEvent } from 'react';
import { useIsMobile } from 'hooks/uiHooks';
import styled from 'styled-components';
import { Formik } from 'formik';
import { validator } from 'components/form/utils';
import { widgetConfigs } from 'people/utils/Constants';
import { FormField } from 'components/form/utils';
import { useStores } from 'store';
import Input from '../../../components/form/inputs';
import { Button, Modal } from '../../../components/common';
import { colors } from '../../../config/colors';
import {
  ImgContainer,
  ImgDashContainer,
  ImgDetailInfo,
  ImgInstructionSpan,
  ImgInstructionText,
  ImgTextContainer,
  InputFile,
  ModalTitle,
  SelectedImg,
  UploadImageContainer
} from './style';
import { EditWorkspaceModalProps } from './interface';
import DeleteWorkspaceWindow from './DeleteWorkspaceWindow';

const color = colors['light'];

const EditWorkspaceWrapper = styled.div`
  padding: 2.375rem 3rem 3rem 3rem;
  display: flex;
  gap: 38px;
  flex-direction: column;
  position: relative;
  width: 100%;

  @media only screen and (max-width: 500px) {
    padding: 1rem 1.2rem 1.2rem 1.2rem;
    justify-content: center;
    gap: 0;
  }
`;

export const ImgText = styled.h3`
  color: #b0b7bc;
  text-align: center;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.0625rem;
  letter-spacing: 0.01875rem;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 0;
`;

const InputWrapper = styled.div`
  display: grid;
  grid-template-columns: 242px 256px;
  grid-template-rows: repeat(3, 61px);
  grid-column-gap: 32px;
  grid-row-gap: 26px;

  @media only screen and (max-width: 500px) {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
interface labelProps {
  nameColor?: boolean;
  name?: string;
  labelName?: string;
  descColor?: boolean;
}
const Label = styled.span<labelProps>`
  font-family: Barlow;
  font-size: 13px;
  font-weight: 500;
  line-height: 35px;
  letter-spacing: 0px;
  text-align: left;
  color: ${(p: any) => {
    if (p.nameColor) {
      return p.name === 'name' ? '#ff8f80' : '#5f6368';
    }
    if (p.descColor) {
      return p.name === 'description' ? '#ff8f80' : '#5f6368';
    }

    return '#5f6368';
  }};
`;
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const SecondaryText = styled.span<labelProps>`
  color: ${(p: any) => {
    if (p.nameColor) {
      return p.name === 'name' ? '#ff8f80' : '#5f6368';
    }
    if (p.descColor) {
      return p.name === 'description' ? '#ff8f80' : '#5f6368';
    }

    return '#5f6368';
  }};
  font-family: Roboto;
  font-size: 13px;
  font-weight: 400;
  line-height: 35px;
  letter-spacing: 0px;
  text-align: left;
  vertical-align: center;
`;
const EditWorkspaceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  height: max-content;
`;

const WorkspaceEditImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media only screen and (max-width: 500px) {
    margin: auto;
  }
`;

const EditWorkspaceTitle = styled(ModalTitle)`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.875rem;
  margin-bottom: 0;

  @media only screen and (max-width: 500px) {
    text-align: center;
    font-size: 1.4rem;
  }
`;

const EditWorkspaceModal = (props: EditWorkspaceModalProps) => {
  const { ui } = useStores();

  const isMobile = useIsMobile();
  const { isOpen, close, onDelete, org, addToast } = props;
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const { main } = useStores();
  const [loading, setLoading] = useState(false);
  const [nameCharacterCount, setNameCharacterCount] = useState(org?.name.length);
  const [nameColor, setNameColor] = useState();
  const [descColor, setDescColor] = useState();
  const [descriptionCharacterCount, setDescriptionCharacterCount] = useState(
    org?.description?.length || 0
  );

  const config = widgetConfigs.workspaces;
  const schema = [...config.schema];
  const formRef = useRef(null);
  const initValues = {
    name: org?.name,
    image: org?.img,
    description: org?.description,
    github: org?.github,
    website: org?.website,
    show: org?.show
  };
  const [selectedImage, setSelectedImage] = useState<string>(org?.img || '');
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleColor = (data: any, value: string) => {
    if (value === 'name') {
      setNameColor(data);
    }
    if (value === 'description') {
      setDescColor(data);
    }
  };
  const onSubmitEditWorkspace = async (body: any) => {
    if (!org) {
      addToast('Invalid workspace update', 'danger');
      return;
    }
    setLoading(true);
    try {
      let img = '';
      const formData = new FormData();
      if (rawSelectedFile) {
        console.log('rawSelectedFile: ' + JSON.stringify(rawSelectedFile));
        console.log('selectedImage: ' + JSON.stringify(selectedImage));
        formData.append('file', rawSelectedFile);
        console.log('Form Data: ' + JSON.stringify(formData));
        const file = await main.uploadFile(formData);
        console.log('File: ' + JSON.stringify(file));
        if (file && file.ok) {
          img = await file.json();
        } else {
          alert('Failed to upload file');
        }
      }

      const newWorkspace = {
        id: org.id,
        uuid: org.uuid,
        name: body.name || org.name,
        owner_pubkey: org.owner_pubkey,
        img: img || org.img,
        description: body.description !== undefined ? body.description : org?.description || null,
        github: body.github !== undefined ? body.github : org?.github || null,
        website: body.website !== undefined ? body.website : org?.website || null,
        created: org.created,
        updated: org.updated,
        show: body?.show !== undefined ? body.show : org.show,
        bounty_count: org.bounty_count,
        budget: org.budget
      };

      const res = await main.updateWorkspace(newWorkspace);
      if (res.status === 200) {
        addToast('Sucessfully updated workspace', 'success');
        // update the org ui
        props.resetWorkspace(newWorkspace);
        close();
      } else {
        addToast('Error: could not update workspace', 'danger');
      }
    } catch (error) {
      addToast('Error: could not update workspace', 'danger');
    }
    setLoading(false);
  };
  const isWorkspaceAdmin = props.org?.owner_pubkey === ui.meInfo?.owner_pubkey;

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      console.log('File: ' + JSON.stringify(file));
      // Display the selected image
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setRawSelectedFile(file);
    } else {
      // Handle the case where the user cancels the file dialog
      setSelectedImage('');
    }
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      console.log('File: ' + JSON.stringify(file));
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setRawSelectedFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <Modal
        visible={isOpen}
        style={{
          height: '100%',
          flexDirection: 'column'
        }}
        envStyle={{
          marginTop: isMobile ? 64 : 0,
          background: color.pureWhite,
          zIndex: 0,
          ...(config?.modalStyle ?? {}),
          maxHeight: '100%',
          borderRadius: '10px',
          minWidth: isMobile ? '100%' : '51.9375rem',
          minHeight: isMobile ? '100vh' : '29rem'
        }}
        overlayClick={close}
        bigCloseImage={close}
        bigCloseImageStyle={{
          top: isMobile ? '26px' : '-18px',
          right: isMobile ? '26px' : '-18px',
          background: '#000',
          borderRadius: '50%'
        }}
      >
        <EditWorkspaceWrapper>
          <EditWorkspaceRow>
            <EditWorkspaceTitle>Edit Workspace</EditWorkspaceTitle>
            <Button
              disabled={!isWorkspaceAdmin}
              onClick={() => {
                setShowDeleteModal(true);
              }}
              loading={false}
              style={{
                width: isMobile ? '100%' : '170px',
                height: '40px',
                borderRadius: '6px',
                padding: '8px, 16px, 8px, 16px',
                borderStyle: 'solid',
                alignSelf: 'flex-end',
                borderWidth: '1px',
                backgroundColor: 'white',
                borderColor: '#ED7474',
                color: '#ED7474',
                position: !isMobile ? 'initial' : 'absolute',
                bottom: '3px',
                maxWidth: 'calc(100% - 2.4rem)'
              }}
              color={'#ED7474'}
              text={'Delete Workspace'}
            />
          </EditWorkspaceRow>
          <EditWorkspaceRow>
            <WorkspaceEditImageWrapper>
              <ImgDashContainer onDragOver={handleDragOver} onDrop={handleDrop}>
                <UploadImageContainer onClick={openFileDialog}>
                  <img src="/static/badges/ResetWorkspaceProfile.svg" alt="upload" />
                </UploadImageContainer>
                <ImgContainer>
                  {selectedImage ? (
                    <SelectedImg src={selectedImage} alt="selected file" />
                  ) : (
                    <ImgText>LOGO</ImgText>
                  )}
                </ImgContainer>
              </ImgDashContainer>
              <ImgTextContainer>
                <InputFile
                  type="file"
                  id="file-input"
                  accept=".jpg, .jpeg, .png, .gif"
                  onChange={handleFileInputChange}
                  ref={fileInputRef}
                />
                <ImgInstructionText>
                  Drag and drop or{' '}
                  <ImgInstructionSpan onClick={openFileDialog}>Browse</ImgInstructionSpan>
                </ImgInstructionText>
                <ImgDetailInfo>PNG, JPG or GIF, Min. 300 x 300 px</ImgDetailInfo>
              </ImgTextContainer>
            </WorkspaceEditImageWrapper>
            <Formik
              initialValues={initValues || {}}
              onSubmit={onSubmitEditWorkspace}
              innerRef={formRef}
              validationSchema={validator(schema)}
              style={{ width: '100%' }}
            >
              {({
                setFieldTouched,
                handleSubmit,
                values,
                setFieldValue,
                errors,
                initialValues,
                isValid,
                dirty
              }: any) => (
                <InputWrapper>
                  {schema.map((item: FormField) => (
                    <InputContainer key={item.name} style={item.style}>
                      <LabelWrapper>
                        <Label nameColor={nameColor} descColor={descColor} name={item.name}>
                          {item.label}
                        </Label>
                        {item.maxCharacterLimit ? (
                          <SecondaryText
                            nameColor={nameColor}
                            descColor={descColor}
                            name={item.name}
                          >
                            {item.name === 'name' ? nameCharacterCount : descriptionCharacterCount}/
                            {item.maxCharacterLimit}
                          </SecondaryText>
                        ) : null}
                      </LabelWrapper>
                      <Input
                        {...item}
                        key={item.name}
                        name={item.name}
                        testId={item.name}
                        values={values}
                        errors={errors}
                        value={values[item.name]}
                        error={errors[item.name]}
                        initialValues={initialValues}
                        setColor={handleColor}
                        deleteErrors={() => {
                          if (errors[item.name]) delete errors[item.name];
                        }}
                        handleChange={(e: any) => {
                          setFieldValue(item.name, e);
                          if (item.name === 'name') {
                            setNameCharacterCount(e.length);
                          } else if (item.name === 'description') {
                            setDescriptionCharacterCount(e.length);
                          }
                        }}
                        setFieldValue={(e: any, f: any) => {
                          setFieldValue(e, f);
                        }}
                        setFieldTouched={setFieldTouched}
                        handleBlur={() => setFieldTouched(item.name, false)}
                        handleFocus={() => setFieldTouched(item.name, true)}
                        borderType={'bottom'}
                        imageIcon={true}
                        style={{
                          width: '100%',
                          ...item.style,
                          maxHeight: isMobile ? '145px' : 'auto'
                        }}
                        newDesign
                      />
                    </InputContainer>
                  ))}
                  <Button
                    disabled={!values.name || !isValid || !dirty}
                    onClick={() => handleSubmit()}
                    loading={loading}
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : '256px',
                      height: '50px',
                      borderRadius: '5px',
                      alignSelf: 'center',
                      position: isMobile ? 'initial' : 'absolute',
                      top: '390px',
                      left: '527px'
                    }}
                    color={!values.name || !isValid || !dirty ? 'gray' : 'primary'}
                    text={'Save changes'}
                  />
                </InputWrapper>
              )}
            </Formik>
          </EditWorkspaceRow>
          <EditWorkspaceRow>
            <SecondaryText>* Required fields</SecondaryText>
          </EditWorkspaceRow>
          {showDeleteModal ? (
            <DeleteWorkspaceWindow
              onDeleteWorkspace={onDelete}
              close={() => setShowDeleteModal(false)}
            />
          ) : (
            <></>
          )}
        </EditWorkspaceWrapper>
      </Modal>
    </>
  );
};

export default EditWorkspaceModal;
