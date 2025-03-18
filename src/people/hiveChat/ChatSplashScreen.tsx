import React from "react"
import { useState } from "react"
import styled, { keyframes } from "styled-components"

interface User {
  alias: string
}

interface SplashScreenProps {
  user: User
  onSendMessage: (message: string) => void
}

const ShapesContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  top: 0;
  left: 0;
  z-index: -1;
  border-radius: 16px;
`

const Circle1 = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a6cf7 0%, #7e3cf5 100%);
  top: -100px;
  left: -100px;
  filter: blur(60px);
  opacity: 0.2;
`

const Circle2 = styled.div`
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
  bottom: -80px;
  right: -80px;
  filter: blur(60px);
  opacity: 0.2;
`

const Circle3 = styled.div`
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  bottom: 100px;
  left: 30%;
  filter: blur(50px);
  opacity: 0.15;
`

const SplashScreenContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
`

const WelcomeTagline = styled.p`
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  max-width: 600px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
`

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.2rem;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.7);
  color: #334155;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.2rem 1.8rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 200px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: rgba(74, 108, 247, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const WelcomeHeader = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(270deg, #4a6cf7, #7e3cf5, #f43f5e, #ec4899);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientAnimation} 6s ease infinite;
`

const SplashScreen: React.FC<SplashScreenProps> = ({ user, onSendMessage }) => {
  const [visible, setVisible] = useState(true)

  const handleButtonClick = (message: string) => {
    onSendMessage(message)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <SplashScreenContainer>
      <ShapesContainer>
        <Circle1 />
        <Circle2 />
        <Circle3 />
      </ShapesContainer>
      <WelcomeHeader>Hello, {user.alias}</WelcomeHeader>
      <WelcomeTagline>Welcome to Hive Chat, AI Native Product Development. How can I help you today?</WelcomeTagline>
      <ButtonsContainer>
        <ActionButton onClick={() => handleButtonClick("Make a change to the leaderboard")}>
          Make a change to the leaderboard
        </ActionButton>
        <ActionButton onClick={() => handleButtonClick("Update the ticket editor component")}>
          Update the ticket editor component
        </ActionButton>
        <ActionButton onClick={() => handleButtonClick("Can you explain how to create a new feature?")}>
          Can you explain how to create a new feature?
        </ActionButton>
      </ButtonsContainer>
    </SplashScreenContainer>
  )
}

export default SplashScreen