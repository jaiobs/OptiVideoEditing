import {
  STICKER_CATEGORIES_FAILURE,
  STICKER_CATEGORIES_SUCCESS,
  STICKER_LIST_SUCCESS,
  STICKER_LIST_FAILURE,
  STICKER_CATOGORIES,
  FETCH_ALL_STICKERS,
} from '../lib/Types';
import axios from 'axios';
const GIPHY_DEVLOPMENT_API_KEY = 'C6B8fTySTLtDK8OxSEVsowj88TD1z9Nq';

export const getStickerCategories = (baseURL, token) => {
  return (dispatch) => {
    let url = baseURL + STICKER_CATOGORIES;
    axios.defaults.headers.common['Authorization'] = token;
    getAxios(
      url,
      {},
      {},
      () => {},
      (resp) => {
        if (resp.status === 200) {
          dispatch({
            type: STICKER_CATEGORIES_SUCCESS,
            payload: resp.data,
          });
        } else {
          dispatch({
            type: STICKER_CATEGORIES_FAILURE,
            payload: resp,
          });
        }
      },
    );
  };
};

export const getStickerList = (baseURL, id, skip, limit, searchText) => {
  return (dispatch) => {
    let url = '';
    if (searchText.trim() === '') {
      url =
        skip != null
          ? baseURL +
            FETCH_ALL_STICKERS +
            id +
            '&skip=' +
            skip +
            '&limit=' +
            limit
          : baseURL + FETCH_ALL_STICKERS + id;
    } else {
      url = baseURL + 'v0/post/sticker-listing?searchKeyword=' + searchText;
    }
    getAxios(
      url,
      {},
      {},
      () => {},
      (resp) => {
        if (resp.status === 200) {
          dispatch({
            type: STICKER_LIST_SUCCESS,
            payload: resp.data,
          });
        } else {
          dispatch({
            type: STICKER_LIST_FAILURE,
            payload: resp,
          });
        }
      },
    );
  };
};

export const getGiphyTrendingList = (
  limit,
  offset,
  initialCallback,
  onCompletionCallBack,
) => {
  let url =
    'https://api.giphy.com/v1/stickers/trending?api_key=' +
    GIPHY_DEVLOPMENT_API_KEY +
    '&offset=' +
    offset +
    '&limit=' +
    limit;
  getAxios(url, {}, {}, initialCallback, onCompletionCallBack);
};

export const getGiphySearchList = (
  searchText,
  limit,
  offset,
  initialCallback,
  onCompletionCallBack,
) => {
  let url =
    'https://api.giphy.com/v1/stickers/search?api_key=' +
    GIPHY_DEVLOPMENT_API_KEY +
    '&offset=' +
    offset +
    '&limit=' +
    limit +
    '&q=' +
    searchText;
  getAxios(url, {}, {}, initialCallback, onCompletionCallBack);
};

// GET METHOD
export function getAxios(
  url,
  params,
  headers,
  initialCallback,
  onCompletionCallBack,
) {
  if (initialCallback) {
    initialCallback();
  }

  var urlValue = `${url}`;
  axios
    .get(urlValue, params, {headers: headers}, {timeout: 10000})
    .then(function (response) {
      onCompletionCallBack(response);
    })
    .catch(function (error) {
      onCompletionCallBack(error.response);
    });
}
