import { ChatStore } from '../store/chat';
import { UiStore } from '../store/ui';

export const createAndNavigateToHivechat = async (
  workspaceUuid: string,
  activityTitle: string,
  activityContent: string,
  chat: ChatStore,
  ui: UiStore,
  history: any
) => {
  try {
    const chatTitle = `Build from Hivechat: ${activityTitle || 'Untitled Activity'}`;
    const newChat = await chat.createChat(workspaceUuid, chatTitle);

    if (newChat && newChat.id) {
      sessionStorage.setItem('pending-hivechat-message', activityContent);
      history.push(`/workspace/${workspaceUuid}/hivechat/${newChat.id}`);
      return true;
    } else {
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to create new chat. Please try again.'
        }
      ]);
      return false;
    }
  } catch (error) {
    console.error('Error creating chat from activity:', error);
    ui.setToasts([
      {
        title: 'Error',
        color: 'danger',
        text: 'An error occurred while creating the chat.'
      }
    ]);
    return false;
  }
};
