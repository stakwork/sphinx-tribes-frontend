import React from 'react';
import styled from 'styled-components';
// import { N } from 'people/utils/style';
import { useIsMobile } from '../../hooks';

const FooterContainer = styled.footer<{ isMobile: boolean }>`
  background: #f4f5f7;
  padding: ${(props: any) => (props.isMobile ? '32px 24px' : '48px 40px')};
  width: 100%;
`;

const FooterContent = styled.div<{ isMobile: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: ${(props: any) => (props.isMobile ? 'column' : 'row')};
  gap: ${(props: any) => (props.isMobile ? '10px' : '0')};
`;

const FooterNav = styled.nav`
  display: contents;
`;

const LogoSection = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  width: ${(props: any) => (props.isMobile ? '100%' : 'auto')};
`;

const Logo = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SphinxLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
`;

const BrandImage = styled.img`
  height: 100px;
  width: auto;
  margin-left: -20px;
`;

const LinksSection = styled.ul<{ isMobile: boolean }>`
  display: flex;
  margin-top: ${(props: any) => (props.isMobile ? '0' : '4%')};
  gap: ${(props: any) => (props.isMobile ? '20px' : '80px')};
  flex-direction: ${(props: any) => (props.isMobile ? 'column' : 'row')};
  align-items: flex-start;
  list-style: none;
`;

const LinkGroup = styled.ul<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  list-style: none;
`;

const Link = styled.a`
  font-family: 'Barlow';
  font-size: 15px;
  font-weight: 600;
  color: #16171c;
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 2px solid #005fcc;
    outline-offset: 1px;
    border-radius: 1px;
  }
`;

const Copyright = styled.p<{ isMobile: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #16171c;
  font-weight: 500;
  margin: ${(props: any) => (props.isMobile ? '10px 0 0 0' : '0')};
  opacity: 0.7;
  text-align: left;
  width: 100%;
  order: ${(props: any) => (props.isMobile ? '1' : '0')};
`;

const Footer: React.FC = () => {
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer isMobile={isMobile}>
      <FooterContent isMobile={isMobile}>
        {isMobile ? (
          <>
            <LogoSection isMobile={isMobile}>
              <Logo isMobile={isMobile}>
                <SphinxLogo
                  src="https://memes.sphinx.chat/public/WY01wMEoCsLHE_gwZDlRYhkE_kc7o0GNtjAQvrTK2Ys="
                  alt="Sphinx Logo"
                />
                <BrandImage
                  src="https://memes.sphinx.chat/public/KrAVeh7jO1ZOqMEdjlM4LJIU9tHnqDDztwba69r-iCw="
                  alt="Freedom to Earn"
                />
              </Logo>
            </LogoSection>

            <FooterNav aria-label="Footer Navigation">
              <LinksSection isMobile={isMobile}>
                <li>
                  <Link href="/bounties">Start Earning</Link>
                </li>
                <li>
                  <Link href="/bounties">View Bounties</Link>
                </li>
                <li>
                  <Link href="https://sphinx.chat">Get Sphinx</Link>
                </li>
                <li>
                  <Link href="https://www.stakwork.com">Stakwork</Link>
                </li>
                <li>
                  <Link href="mailto:support@stakwork.com">Support</Link>
                </li>
                <li>
                  <Link href="https://x.com/stakwork">X</Link>
                </li>
              </LinksSection>
            </FooterNav>

            <Copyright isMobile={isMobile}>Stakwork © Copyright {currentYear}</Copyright>
          </>
        ) : (
          <>
            <LogoSection isMobile={isMobile}>
              <Logo isMobile={isMobile}>
                <SphinxLogo
                  src="https://memes.sphinx.chat/public/WY01wMEoCsLHE_gwZDlRYhkE_kc7o0GNtjAQvrTK2Ys="
                  alt="Sphinx Logo"
                />
                <BrandImage
                  src="https://memes.sphinx.chat/public/KrAVeh7jO1ZOqMEdjlM4LJIU9tHnqDDztwba69r-iCw="
                  alt="Freedom to Earn"
                />
              </Logo>
              <Copyright isMobile={isMobile}>Stakwork © Copyright {currentYear}</Copyright>
            </LogoSection>

            <FooterNav aria-label="Footer Navigation">
              <LinksSection isMobile={isMobile}>
                <LinkGroup isMobile={isMobile}>
                  <li>
                    <Link href="/bounties">Start Earning</Link>
                  </li>
                  <li>
                    <Link href="/bounties">View Bounties</Link>
                  </li>
                  <li>
                    <Link href="https://sphinx.chat">Get Sphinx</Link>
                  </li>
                </LinkGroup>

                <LinkGroup isMobile={isMobile}>
                  <li>
                    <Link href="https://www.stakwork.com">Stakwork</Link>
                  </li>
                  <li>
                    <Link href="mailto:support@stakwork.com">Support</Link>
                  </li>
                  <li>
                    <Link href="https://x.com/stakwork">X</Link>
                  </li>
                </LinkGroup>
              </LinksSection>
            </FooterNav>
          </>
        )}
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
