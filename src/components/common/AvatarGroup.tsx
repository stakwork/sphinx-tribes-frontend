import { EuiAvatar, EuiAvatarProps } from '@elastic/eui';
import styled from '@emotion/styled';
import { EuiAvatarSize } from '@elastic/eui/src/components/avatar/avatar';
import React from 'react';
import { colors } from 'config';

interface AvatarGroupProps {
  maxGroupSize?: number;
  avatarList: EuiAvatarProps[];
  avatarSize?: EuiAvatarSize;
}

export const AvatarGroup = (props: AvatarGroupProps) => {
  const DEFAULT_AVATAR_GROUP_MAX = 5;
  const { maxGroupSize = DEFAULT_AVATAR_GROUP_MAX, avatarList, avatarSize = 'm' } = props;

  const numExtra = avatarList.length - maxGroupSize;

  const Wrapper = styled.div`
    display: inline-flex;
    flex-direction: row-reverse;
    cursor: pointer;

    > .euiAvatar {
      margin-left: 0px;
      box-shadow: 0px 0px 0 2px ${colors['light'].grayish};
    }

    &:hover > .euiAvatar {
      transition: margin-left 200ms ease-in-out;
    }
  `;

  return (
    <Wrapper>
      {numExtra > 0 && (
        <EuiAvatar
          name={`Plus ${numExtra} more`}
          initials={`+${numExtra}`}
          size={avatarSize}
          initialsLength={2}
        />
      )}
      {avatarList
        .slice(0, maxGroupSize)
        .reverse()
        .map((avatar: EuiAvatarProps, i: number) => (
          <EuiAvatar size={avatarSize} key={i} {...avatar} />
        ))}
    </Wrapper>
  );
};
