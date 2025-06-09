const HOSTNAME= 'http://localhost:8080';

export const API_CONFIG = {
  BASE_URL: HOSTNAME +'/v1',
  AUTH_TOKEN_KEY: 'free-shelf-token',
  OAUTH_ENDPOINT:HOSTNAME+'/oauth2/authorize',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/signin',
      REGISTER: '/auth/signup',
    },
    USER: {
      PROFILE: '/user',
      EDIT_PROFILE: '/user',
      ADD_ROLE: '/user/role',
      ADDRESS: {
        LIST: '/user/address',
        ADD: '/user/address',
        DELETE: `/user/address`,
        EDIT: `/user/address`,
      },
      UPDATE_PROFILE_PIC: '/user/profilepic'
    },
    STORAGE_SPACE: {
      ADD_SPACE: '/storagespace',
      GET_MY_SPACES: '/storagespace',
      PUBLISH_STORAGE_SPACE: '/storagespace',
      ADD_SPACE_IMAGES: (storageSpaceId: number) => `/storagespace/addImages/${storageSpaceId}`,
      SET_PRIMARY_IMAGE: (spaceId: number,imageId:number) => `/storagespace/${spaceId}/images/${imageId}`,
      FIND_NEAREST_SPACE: 'storagespace/find',
      UPDATE_SPACE_AVAILABILITY: '/storagespace/updateAvailability',
      GET_FEATURED_SPACES: '/storagespace/featured'
    }
  }
};


