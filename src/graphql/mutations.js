import { gql } from "apollo-boost";

export const CREATE_USER = gql`
  mutation MyMutation(
    $userId: String!
    $name: String!
    $username: String!
    $email: String!
    $bio: String!
    $website: String!
    $profileImage: String!
    $phoneNumber: String!
  ) {
    insert_default_users(
      objects: {
        user_id: $userId
        username: $username
        website: $website
        profile_image: $profileImage
        phone_number: $phoneNumber
        name: $name
        email: $email
        bio: $bio
      }
    ) {
      affected_rows
    }
  }
`;

export const EDIT_USER = gql`
  mutation editUser(
    $id: uuid!
    $name: String!
    $username: String!
    $website: String!
    $bio: String!
    $email: String!
    $phoneNumber: String!
  ) {
    update_default_users(
      where: { id: { _eq: $id } }
      _set: {
        name: $name
        username: $username
        website: $website
        bio: $bio
        email: $email
        phone_number: $phoneNumber
      }
    ) {
      affected_rows
    }
  }
`;
export const EDIT_USER_AVATAR = gql`
  mutation editUserAvatar($id: uuid!, $profileImage: String!) {
    update_default_users(
      where: { id: { _eq: $id } }
      _set: { profile_image: $profileImage }
    ) {
      affected_rows
    }
  }
`;

export const CREATE_POST = gql`
  mutation createPost(
    $userId: uuid!
    $media: String!
    $location: String!
    $caption: String!
  ) {
    insert_default_posts(
      objects: {
        user_id: $userId
        media: $media
        location: $location
        caption: $caption
      }
    ) {
      affected_rows
    }
  }
`;

export const LIKE_POST = gql`
  mutation likePost($postId: uuid!, $userId: uuid!, $profileId: uuid!) {
    insert_default_likes(objects: { post_id: $postId, user_id: $userId }) {
      __typename
    }
    insert_default_notifications(
      objects: {
        post_id: $postId
        user_id: $userId
        profile_id: $profileId
        type: "like"
      }
    ) {
      affected_rows
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation unLikePost($postId: uuid!, $userId: uuid!, $profileId: uuid!) {
    delete_default_likes(
      where: { post_id: { _eq: $postId }, user_id: { _eq: $userId } }
    ) {
      affected_rows
    }

    delete_default_notifications(
      where: {
        post_id: { _eq: $postId }
        profile_id: { _eq: $profileId }
        user_id: { _eq: $userId }
        type: { _eq: "like" }
      }
    ) {
      affected_rows
    }
  }
`;

export const SAVE_POST = gql`
  mutation savePost($postId: uuid!, $userId: uuid!) {
    insert_default_saved_posts(
      objects: { post_id: $postId, user_id: $userId }
    ) {
      affected_rows
    }
  }
`;

export const UNSAVE_POST = gql`
  mutation unSavePost($postId: uuid!, $userId: uuid!) {
    delete_default_saved_posts(
      where: { post_id: { _eq: $postId }, user_id: { _eq: $userId } }
    ) {
      affected_rows
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation createComment($postId: uuid!, $userId: uuid!, $content: String!) {
    insert_default_comments(
      objects: { post_id: $postId, user_id: $userId, content: $content }
    ) {
      returning {
        id
        created_at
        post_id
        user_id
        content
        user {
          username
        }
      }
    }
  }
`;
export const CHECK_NOTIFICATIONS = gql`
  mutation checkNotifications($userId: uuid!, $lastChecked: String!) {
    update_default_users(
      where: { id: { _eq: $userId } }
      _set: { last_checked: $lastChecked }
    ) {
      affected_rows
    }
  }
`;

export const FOLLOW_USER = gql`
  mutation followUser($userIdToFollow: uuid!, $currentUserId: uuid!) {
    insert_default_followers(
      objects: { user_id: $userIdToFollow, profile_id: $currentUserId }
    ) {
      affected_rows
    }
    insert_default_following(
      objects: { user_id: $currentUserId, profile_id: $userIdToFollow }
    ) {
      affected_rows
    }
    insert_default_notifications(
      objects: {
        user_id: $currentUserId
        profile_id: $userIdToFollow
        type: "follow"
      }
    ) {
      affected_rows
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation unFollowUser($userIdToFollow: uuid!, $currentUserId: uuid!) {
    delete_default_followers(
      where: {
        user_id: { _eq: $userIdToFollow }
        profile_id: { _eq: $currentUserId }
      }
    ) {
      affected_rows
    }
    delete_default_following(
      where: {
        user_id: { _eq: $currentUserId }
        profile_id: { _eq: $userIdToFollow }
      }
    ) {
      affected_rows
    }
    delete_default_notifications(
      where: {
        user_id: { _eq: $currentUserId }
        profile_id: { _eq: $userIdToFollow }
        type: { _eq: "follow" }
      }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_POST = gql`
  mutation deletePost($postId: uuid!, $userId: uuid!) {
    delete_default_posts(
      where: { id: { _eq: $postId }, user_id: { _eq: $userId } }
    ) {
      affected_rows
    }
    delete_default_likes(where: { post_id: { _eq: $postId } }) {
      affected_rows
    }
    delete_default_saved_posts(where: { post_id: { _eq: $postId } }) {
      affected_rows
    }
    delete_default_notifications(where: { post_id: { _eq: $postId } }) {
      affected_rows
    }
  }
`;
