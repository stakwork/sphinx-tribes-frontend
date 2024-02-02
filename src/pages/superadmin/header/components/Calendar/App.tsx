import React, { ChangeEvent, useEffect, useState } from 'react';
import moment from 'moment';
import { set } from 'date-fns';
import {
  Section,
  MainContainer,
  HeaderDiv,
  FormDiv,
  Button,
  FormInput,
  Para,
  FlexDiv,
  Formator
} from './CalendarStyles';
import Calendar from './Calender';

interface Props {
  filterStartDate: (newDate: number) => void;
  filterEndDate: (newDate: number) => void;
  setShowCalendar: (show: boolean) => void;
}

const App = ({ filterStartDate, filterEndDate, setShowCalendar }: Props) => {
  const [from, setFrom] = useState(false);
  const [to, setTo] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [newDateFrom, setNewDateFrom] = useState('');
  const [newDateTo, setNewDateTo] = useState('');
  const [formInputFocused, setFormInputFocused] = useState(false);
  const [formInput2Focused, setFormInput2Focused] = useState(false);

  const handleInputFocus = (parameter: string) => {
    if (parameter === 'From') {
      setTo(false);
      setFrom(true);
    }
    if (parameter === 'To') {
      setFrom(false);
      setTo(!to);
    }
  };

  const isValidDate = (value: string) => (value.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) ? true : false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'start') {
      setNewDateFrom(e.target.value);
    } else {
      setNewDateTo(e.target.value);
    }
  };

  useEffect(() => {
    if (newDateFrom && isValidDate(newDateFrom)) {
      const date = new Date(newDateFrom);
      setStartDate(date);
    }
  }, [newDateFrom]);

  useEffect(() => {
    if (newDateTo && isValidDate(newDateTo)) {
      const date = new Date(newDateTo);
      setEndDate(date);
    }
  }, [newDateTo]);

  const handleClick = () => {
    if (startDate && endDate) {
      let startDt = startDate;
      let endDt = endDate;
      startDt = set(startDate, { hours: 0, minutes: 0, seconds: 0 });
      if (startDt > endDt) {
        const temp = startDt;
        startDt = endDt;
        endDt = temp;
      }
      const start = moment(startDt);
      const unixStart = start.unix();
      const end = moment(endDt);
      const unixEnd = end.unix();
      filterStartDate(unixStart);
      filterEndDate(unixEnd);
      setShowCalendar(false);
    }
  };

  return (
    <>
      <MainContainer>
        <HeaderDiv>
          <FlexDiv>
            <h1
              style={{
                color: '#3C3F41',
                fontSize: '18px',
                fontWeight: '500',
                paddingBottom: '15px'
              }}
            >
              Enter Dates
            </h1>
            <FormDiv>
              <Formator>
                <Para>From</Para>
                <FormInput
                  name={'start'}
                  placeholder="MM/DD/YY"
                  type="text"
                  value={newDateFrom || (startDate && moment(startDate).format('MM/DD/YY'))}
                  onChange={handleChange}
                  onFocus={() => {
                    handleInputFocus('From');
                    setFormInputFocused(true);
                    setFormInput2Focused(false);
                  }}
                  focused={formInputFocused}
                />
              </Formator>
              <Formator>
                <Para>To</Para>
                <FormInput
                  name={'end'}
                  placeholder="MM/DD/YY"
                  type="text"
                  value={newDateTo || (endDate && moment(endDate).format('MM/DD/YY'))}
                  onChange={handleChange}
                  onFocus={() => {
                    handleInputFocus('To');
                    setFormInput2Focused(true);
                    setFormInputFocused(false);
                  }}
                  focused={formInput2Focused}
                />
              </Formator>
            </FormDiv>
          </FlexDiv>
          {from && <Calendar value={startDate} onChange={setStartDate} />}
          {to && <Calendar value={endDate} onChange={setEndDate} />}
          <Section>
            <Button onClick={() => handleClick()} color="#618AFF">
              Save
            </Button>
            <Button color="#8E969C" onClick={() => setShowCalendar(false)}>
              Cancel
            </Button>
          </Section>
        </HeaderDiv>
      </MainContainer>
    </>
  );
};

export default App;
