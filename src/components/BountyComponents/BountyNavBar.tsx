import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import MaterialIcon from '@material/react-material-icon';
import { useHistory, useLocation } from 'react-router-dom';
import StartUpModal from '../../people/utils/StartUpModal';
import { getHost } from '../../config';
import { useStores } from '../../store';
import { Modal } from '../../components/common';
import SignIn from '../../components/auth/SignIn';
import IconButton from '../../components/common/IconButton2';

interface ImageProps {
  readonly src: string;
}

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Nav = styled.nav`
  background: #1a242e;
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 12px 16px;
    ${ButtonGroup} {
      display: none;
    }
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 12px;
    img {
      height: 28px;
    }
  }
`;

const Img = styled.div`
  background-image: url('/static/people_logo.svg');
  background-position: center;
  background-size: cover;
  height: 37px;
  width: 232px;

  position: relative;

  @media (max-width: 768px) {
    width: 190px;
    height: 32px;
  }
`;

const Corner = styled.div`
  display: flex;
  align-items: center;
`;

const LoginBtn = styled.button<{ isMobile?: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  width: ${(props: any) => (props.isMobile ? '100%' : '120px')};
  align-items: center;
  justify-content: ${(props: any) => (props.isMobile ? 'center' : 'flex-start')};
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  line-height: 17px;
  margin: ${(props: any) => (props.isMobile ? '0' : '0 0 0 18px')};
  padding: ${(props: any) => (props.isMobile ? '10px 0' : '0')};
  background: transparent;
  border: none;

  span {
    margin-right: 8px;
  }

  &:hover {
    color: #a3c1ff;
  }

  &:active {
    color: #82b4ff;
  }
`;

const Imgg = styled.div<ImageProps>`
  background-image: url('${(p: any) => p.src}');
  background-position: center;
  background-size: cover;
  width: 90px;
  height: 90px;
  border-radius: 50%;
`;

const Alias = styled.span<{ isMobile?: boolean }>`
  max-width: ${(props: any) => (props.isMobile ? '200px' : '300px')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${(props: any) => (props.isMobile ? '14px' : 'inherit')};
  margin-left: ${(props: any) => (props.isMobile ? '5px' : '0')};
`;

const LoggedInBtn = styled.button<{ isMobile?: boolean }>`
  all: unset;
  max-width: ${(props: any) => (props.isMobile ? '50%' : '130px')};
  height: 40px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.07);
  white-space: nowrap;
  padding: ${(props: any) => (props.isMobile ? '0 12px 0 45px' : '0 24px 0 50px')};
  display: flex;
  align-items: center;
  position: relative;
  color: white;
  width: ${(props: any) => (props.isMobile ? '100%' : 'auto')};
  margin: ${(props: any) => (props.isMobile ? '0' : '0 20px 0 0')};

  ${Imgg} {
    width: ${(props: any) => (props.isMobile ? '32px' : '40px')};
    height: ${(props: any) => (props.isMobile ? '32px' : '40px')};
    position: absolute;
    left: ${(props: any) => (props.isMobile ? '6px' : '0')};
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.13);
    ${Imgg} {
      height: ${(props: any) => (props.isMobile ? '28px' : '34px')};
      width: ${(props: any) => (props.isMobile ? '28px' : '34px')};
      left: ${(props: any) => (props.isMobile ? '8px' : '3px')};
    }
  }
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 10px 15px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  white-space: nowrap;
  height: 40px;

  ${({ variant }: { variant: 'primary' | 'secondary' }) =>
    variant === 'primary'
      ? `
   background: #608AFF;
   color: white;
   border: none;
   &:hover {
     background: #4A6FE5;
   }
 `
      : `
   background: transparent;
   color: #608AFF;
   border: 1px solid #608AFF;
   &:hover {
     background: rgba(96, 138, 255, 0.1);
   }
 `}
`;

const Column = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 25px;
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 69px;
  left: 0;
  right: 0;
  background: #1a242e;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  ${ButtonGroup} {
    flex-direction: column;
    width: 100%;

    ${Button} {
      width: 100%;
    }

    ${Corner} {
      margin-top: 12px;
      justify-content: center;
    }
  }

  &.open {
    display: block;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  margin: 0;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
  }
`;

const Welcome = styled.div`
  font-size: 15px;
  line-height: 24px;
  margin: 20px 0 50px;
  text-align: center;

  /* Text 2 */

  color: #3c3f41;
`;

const T = styled.div`
  display: flex;
  font-size: 26px;
  line-height: 19px;
`;

const Name = styled.span`
  font-style: normal;
  font-weight: 500;
  font-size: 26px;
  line-height: 19px;
  /* or 73% */

  /* Text 2 */

  color: #292c33;
`;

const StyledModal = styled(Modal)`
  z-index: 2001;
  .modal-content {
    position: relative;
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    max-width: 90%;
    margin: 0 auto;
  }
`;

const BountyNavBar: React.FC = () => {
  const { ui } = useStores();
  const location = useLocation();
  const history = useHistory();
  const [isOpenStartupModal, setIsOpenStartupModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleStartEarning = () => {
    setIsOpenStartupModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleViewBounties = () => {
    const host = getHost();
    window.location.href = `https://${host}/bounties`;
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    ui.setShowSignIn(true);
    setIsMobileMenuOpen(false);
  };

  function goToEditSelf() {
    if (ui.meInfo?.id && !location.pathname.includes(`/p/${ui.meInfo.uuid}`)) {
      history.push(`/p/${ui.meInfo.uuid}/workspaces`);
      ui.setSelectedPerson(ui.meInfo.id);
      ui.setSelectingPerson(ui.meInfo.id);
    }
  }

  const handleProfileClick = () => {
    goToEditSelf();
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <Nav>
        <Logo>
          <HamburgerButton
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <MaterialIcon icon="menu" style={{ fontSize: 28 }} />
          </HamburgerButton>
          <Img />
          <span>SPHINX COMMUNITY</span>
        </Logo>
        <ButtonGroup>
          <ul style={{ listStyle: 'none', display: 'flex', gap: '12px', padding: 0, margin: 0 }}>
            <li>
              <Button variant="primary" onClick={handleStartEarning}>
                Start Earning
              </Button>
            </li>
            <li>
              <Button variant="secondary" onClick={handleViewBounties}>
                View Bounties
              </Button>
            </li>
            <li>
              <Corner>
                {ui.meInfo ? (
                  <LoggedInBtn data-testid="loggedInUser" onClick={handleProfileClick}>
                    <Imgg
                      data-testid="userImg"
                      src={ui.meInfo?.img || '/static/person_placeholder.png'}
                    />
                    <Alias>{ui.meInfo?.owner_alias}</Alias>
                  </LoggedInBtn>
                ) : (
                  <LoginBtn onClick={handleLoginClick} style={{ marginTop: 12 }}>
                    <span>Sign in</span>
                    <MaterialIcon
                      icon={'login'}
                      style={{ fontSize: 18 }}
                      role="img"
                      aria-hidden="true"
                    />
                  </LoginBtn>
                )}
              </Corner>
            </li>
          </ul>
        </ButtonGroup>
      </Nav>

      <MobileMenu className={isMobileMenuOpen ? 'open' : ''}>
        <nav aria-label="Mobile Navigation">
          <ButtonGroup as="div" id="mobile-menu">
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <li>
                <Button variant="primary" onClick={handleStartEarning}>
                  Start Earning
                </Button>
              </li>
              <li>
                <Button variant="secondary" onClick={handleViewBounties}>
                  View Bounties
                </Button>
              </li>
              <li>
                <Corner style={{ width: '100%' }}>
                  {ui.meInfo ? (
                    <LoggedInBtn
                      data-testid="loggedInUser"
                      onClick={handleProfileClick}
                      isMobile={true}
                    >
                      <Imgg
                        data-testid="userImg"
                        src={ui.meInfo?.img || '/static/person_placeholder.png'}
                      />
                      <Alias isMobile={true}>{ui.meInfo?.owner_alias}</Alias>
                    </LoggedInBtn>
                  ) : (
                    <LoginBtn onClick={handleLoginClick} isMobile={true}>
                      <span>Sign in</span>
                      <MaterialIcon
                        icon={'login'}
                        style={{ fontSize: 18 }}
                        role="img"
                        aria-hidden="true"
                      />
                    </LoginBtn>
                  )}
                </Corner>
              </li>
            </ul>
          </ButtonGroup>
        </nav>
      </MobileMenu>

      <StyledModal
        visible={ui.showSignIn}
        close={() => ui.setShowSignIn(false)}
        overlayClick={() => ui.setShowSignIn(false)}
      >
        <SignIn
          onSuccess={() => {
            ui.setShowSignIn(false);
            setShowWelcome(true);
            window.location.reload();
          }}
        />
      </StyledModal>

      <StyledModal visible={ui.meInfo && showWelcome ? true : false}>
        <div>
          <Column>
            <Imgg
              style={{ height: 128, width: 128, marginBottom: 40 }}
              src={ui.meInfo?.img || '/static/person_placeholder.png'}
            />
            <div
              style={{
                position: 'absolute',
                top: '110px',
                right: '85px'
              }}
            >
              <img height={'32px'} width={'32px'} src="/static/badges/verfied_mark.png" alt="" />
            </div>

            <T>
              <div style={{ lineHeight: '26px' }}>
                Welcome <Name>{ui.meInfo?.owner_alias}</Name>
              </div>
            </T>

            <Welcome>
              Your profile is now public. Connect with other people, join tribes and listen your
              favorite podcast!
            </Welcome>

            <IconButton
              text={'Continue'}
              endingIcon={'arrow_forward'}
              height={48}
              width={'100%'}
              color={'primary'}
              onClick={() => setShowWelcome(false)}
              hovercolor={'#5881F8'}
              activecolor={'#5078F2'}
              shadowcolor={'rgba(97, 138, 255, 0.5)'}
            />
          </Column>
        </div>
      </StyledModal>

      {isOpenStartupModal && (
        <StartUpModal
          closeModal={() => setIsOpenStartupModal(false)}
          dataObject={'createWork'}
          buttonColor={'success'}
        />
      )}
    </>
  );
};

export default observer(BountyNavBar);
