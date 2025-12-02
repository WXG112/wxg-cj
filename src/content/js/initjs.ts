export const init = () => {
  const addIframe = (id, pagePath) => {
    const contentIframe = document.createElement("iframe");
    contentIframe.id = id;
    contentIframe.style.cssText = "width: 50%; height: 50%; position: fixed; insert 0px; top: 25%; right: 25%;top:0; z-index: 2147483647; border: none;";
    const getContentPage = chrome.runtime.getURL(pagePath);
    contentIframe.src = getContentPage;
    document.body.appendChild(contentIframe);
  }
  addIframe('content-start-iframe', 'contentPage/index.html')
}

export const removeIframe = () => {
  var iframe = document.querySelector('#content-start-iframe');
  if (iframe) {
    iframe.remove();
  }
}

export const initUserInfo = () => {

  const addIframe = (id, pagePath) => {
    const contentIframe = document.createElement("iframe");
    contentIframe.id = id;
    contentIframe.style.cssText = "width: 10%; height: 50%; position: fixed; insert 0px; left:0; top:50px; z-index: 2147483647; border: none;margin: 0;padding 0;";
    const getContentPage = chrome.runtime.getURL(pagePath);
    contentIframe.src = getContentPage;
    document.body.appendChild(contentIframe);
  }

  addIframe('user-info-page', 'contentPageUserInfo/index.html')

}



export const removeUserInfoIframe = () => {
  var iframe = document.querySelector('#user-info-page');
  if (iframe) {
    iframe.remove();
  }
}




