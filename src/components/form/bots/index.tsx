import { Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../../config/colors';
import { Button } from '../../common';
import Input from '../inputs';
import { BWrap, EditBountyText } from '../style';
import { FormField, validator } from '../utils';
import { FormProps } from '../interfaces';

const StyledFormWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

function Form(props: FormProps) {
  const { buttonsOnBottom, wrapStyle, smallForm, readOnly, initialValues, schema } = props;
  const [disableFormButtons, setDisableFormButtons] = useState(false);
  const refBody: any = useRef(null);
  const color = colors['light'];
  const [isFocused, setIsFocused] = useState({});

  const buttonAlignment = buttonsOnBottom
    ? { zIndex: 20, bottom: 0, height: 108, justifyContent: 'center' }
    : { top: 0 };
  const formPad = buttonsOnBottom ? { paddingTop: 30 } : {};

  const buttonStyle = buttonsOnBottom ? { width: '80%', height: 48 } : {};

  if (!schema) return <div />;

  return (
    <Formik
      initialValues={initialValues || {}}
      onSubmit={props.onSubmit}
      innerRef={props.formRef}
      validationSchema={validator(schema)}
    >
      {({ setFieldTouched, handleSubmit, values, setFieldValue, errors, initialValues }: any) => (
        <div
          ref={refBody}
          style={{
            ...formPad,
            ...wrapStyle,
            ...schema.outerContainerStyle
          }}
        >
          <StyledFormWrapper>
            {schema.map((item: FormField) => (
              <Input
                {...item}
                key={item.name}
                values={values}
                errors={errors}
                value={values[item.name]}
                error={errors[item.name]}
                initialValues={initialValues}
                deleteErrors={() => {
                  if (errors[item.name]) delete errors[item.name];
                }}
                handleChange={(e: any) => {
                  setFieldValue(item.name, e);
                }}
                setFieldValue={(e: any, f: any) => {
                  setFieldValue(e, f);
                }}
                setFieldTouched={setFieldTouched}
                isFocused={isFocused}
                handleBlur={() => {
                  setFieldTouched(item.name, false);
                  setIsFocused({ [item.label]: false });
                }}
                handleFocus={() => {
                  setFieldTouched(item.name, true);
                  setIsFocused({ [item.label]: true });
                }}
                setDisableFormButtons={setDisableFormButtons}
                extraHTML={(props.extraHTML && props.extraHTML[item.name]) || item.extraHTML}
              />
            ))}
          </StyledFormWrapper>
          {buttonsOnBottom && !smallForm && <div style={{ height: 48, minHeight: 48 }} />}
          <BWrap style={buttonAlignment} color={color}>
            <EditBountyText>Add Bot</EditBountyText>
            <Button
              disabled={disableFormButtons || props.loading}
              onClick={() => {
                if (props.close) props.close();
              }}
              color={'white'}
              width={100}
              text={'Cancel'}
              style={{ ...buttonStyle, marginRight: 10, marginLeft: 'auto', width: '140px' }}
            />
            {!readOnly && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  disabled={disableFormButtons || props.loading}
                  onClick={async () => {
                    await handleSubmit(true);
                    setTimeout(() => {
                      props.setLoading && props.setLoading(false);
                      props.onEditSuccess && props.onEditSuccess();
                    }, 500);
                  }}
                  loading={props.loading}
                  style={{ ...buttonStyle, width: '140px' }}
                  color={'primary'}
                  text={'Save'}
                />
              </div>
            )}
          </BWrap>
        </div>
      )}
    </Formik>
  );
}
export default observer(Form);
