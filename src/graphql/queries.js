import { gql } from "apollo-boost";

export const CHECK_IF_USERNAME_TAKEN = gql`
  query checkIfUsernameTaken($username: String!) {
    default_users(where: { username: { _eq: $username } }) {
      username
    }
  }
`;

export const GET_USER_EMAIL = gql`
  query getUserEmail($input: String!) {
    default_users(
      where: {
        _or: [{ username: { _eq: $input } }, { phone_number: { _eq: $input } }]
      }
    ) {
      email
    }
  }
`;

export const GET_EDIT_USER_PROFILE = gql`
  query getEditUserProfile($id: uuid!) {
    default_users_by_pk(id: $id) {
      id
      username
      name
      email
      bio
      profile_image
      website
      phone_number
    }
  }
`;

export const SEARCH_USERS = gql`
  query searchUsers($query: String) {
    default_users(
      where: {
        _or: [{ username: { _like: $query } }, { name: { _like: $query } }]
      }
    ) {
      id
      username
      name
      profile_image
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query getUserProfile($username: String!) {
    default_users(where: { username: { _eq: $username } }) {
      id
      name
      username
      website
      bio
      profile_image
      posts_aggregate {
        aggregate {
          count
        }
      }
      followers_aggregate {
        aggregate {
          count
        }
      }
      following_aggregate {
        aggregate {
          count
        }
      }
      saved_posts(order_by: { created_at: desc }) {
        post {
          id
          media
          likes_aggregate {
            aggregate {
              count
            }
          }
          comments_aggregate {
            aggregate {
              count
            }
          }
        }
      }
      posts(order_by: { created_at: desc }) {
        id
        media
        likes_aggregate {
          aggregate {
            count
          }
        }
        comments_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`;
// suggest user from followers and also users created around the same time
export const SUGGEST_USER = gql`
  query suggestUsers(
    $limit: Int!
    $followerIds: [uuid!]!
    $createdAt: timestamptz!
  ) {
    default_users(
      limit: $limit
      where: {
        _or: [
          { id: { _in: $followerIds } }
          { created_at: { _gt: $createdAt } }
        ]
      }
    ) {
      id
      username
      name
      profile_image
    }
  }
`;
//posts with the most likes and comments at the top, newest to oldest where the
//posts are not from users we are following

export const EXPLORE_POSTS = gql`
  query explorePosts($feedIds: [uuid!]!) {
    default_posts(
      order_by: {
        created_at: desc
        likes_aggregate: { count: desc }
        comments_aggregate: { count: desc }
      }
      where: { user_id: { _nin: $feedIds } }
    ) {
      id
      media
      likes_aggregate {
        aggregate {
          count
        }
      }
      comments_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_MORE_POSTS_FROM_USER = gql`
  query getMorePostsFromUser($userId: uuid!, $postId: uuid!) {
    default_posts(
      limit: 6
      where: { user_id: { _eq: $userId }, _not: { id: { _eq: $postId } } }
    ) {
      id
      media
      likes_aggregate {
        aggregate {
          count
        }
      }
      comments_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_POST = gql`
  query getPost($postId: uuid!) {
    default_posts_by_pk(id: $postId) {
      id
      default_user {
        id
        username
      }
    }
  }
`;
// user_id: { _in: $feedIds } original GET_FEED condition
export const GET_FEED = gql`
  query getFeed($limit: Int!, $feedIds: [uuid!]!, $lastTimestamp: timestamptz) {
    default_posts(
      limit: $limit
      where: {
        user_id: { _nin: $feedIds }
        created_at: { _lte: $lastTimestamp }
      }
      order_by: { created_at: desc }
    ) {
      id
      caption
      created_at
      media
      location
      default_user {
        id
        username
        name
        profile_image
      }
      likes_aggregate {
        aggregate {
          count
        }
      }
      likes {
        id
        user_id
      }
      saved_posts {
        id
        user_id
      }
      comments_aggregate {
        aggregate {
          count
        }
      }
      comments(order_by: { created_at: desc }, limit: 2) {
        id
        content
        created_at
        user {
          username
        }
      }
    }
  }
`;
