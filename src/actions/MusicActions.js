import axios from 'axios';
import {SOUND_CLOUD_BASE_URL, TRACK_LIST_FETCH, GET_TRACKS} from '../lib/Types';

export const client_id = '3501a8ba5e28f5ef48b151bfdbdf7a49';

export const getTrendingSongs = (limit = 50) => {
  return (dispatch) => {
    const params = {
      genre: 'all-music',
      client_id: client_id,
      limit: limit,
    };
    try {
      getAxios(GET_TRACKS, params, {}, (resp) => {
        dispatch({
          type: TRACK_LIST_FETCH,
          payload: resp,
        });
      });
    } catch (e) {
      console.log('error' + e);
    }
  };
};

export function searchSongs(query) {
  return (dispatch) => {
    const params = {
      q: query,
      client_id: client_id,
    };
    try {
      getAxios(GET_TRACKS, params, {}, (resp) => {
        dispatch({
          type: TRACK_LIST_FETCH,
          payload: resp,
        });
      });
    } catch (e) {
      console.log('error->' + e);
    }
  };
}

export function getAxios(url_suffix, params, headers, onCompletionCallBack) {
  console.log('GET URL', SOUND_CLOUD_BASE_URL + url_suffix, params);
  //get method
  axios
    .get(
      SOUND_CLOUD_BASE_URL + url_suffix,
      {params: params},
      {headers: headers},
      {timeout: 10000},
    )
    .then(function (response) {
      console.log('success');
      var respObj = {success: true, tracks: response.data};
      onCompletionCallBack(respObj);
    })
    .catch(function (error) {
      console.log('GET URL ERROR', error);
      var respObj = {success: false, response: error};
      onCompletionCallBack(respObj);
    });
}
