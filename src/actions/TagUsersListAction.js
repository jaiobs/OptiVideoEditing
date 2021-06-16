import axios from 'axios';
import {TAG_ALL_USERS_LISTING, TAG_ALL_USERS_FETCH} from '../lib/Types';

export const getTagUsers = (baseURL, Auth, searchText) => {
  return (dispatch) => {
    const params = {
      searchKeyword: searchText,
    };
    axios.defaults.headers.common['Authorization'] = Auth;
    try {
      getAxios(baseURL + TAG_ALL_USERS_LISTING, params, {}, (resp) => {
        dispatch({
          type: TAG_ALL_USERS_FETCH,
          payload: resp,
        });
      });
    } catch (e) {
      console.log('error' + e);
    }
  };
};

export function getAxios(url, params, headers, onCompletionCallBack) {
  //get method
  axios
    .get(url, {params: params}, {headers: headers}, {timeout: 10000})
    .then(function (response) {
      var respObj = {success: true, rows: response.data.result.rows};
      onCompletionCallBack(respObj);
    })
    .catch(function (error) {
      var respObj = {success: false, response: error};
      onCompletionCallBack(respObj);
    });
}
