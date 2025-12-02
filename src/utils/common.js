export const focusDispatch = (e, ifDoubleClick = false,value=null) => {
  let focusEvent = new Event('focus', { bubbles: true, cancelable: true});
  let mouseenterEvent = new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window });
  let mouseoverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window });
  let mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
  let mouseupEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
  let keyupEvent = new KeyboardEvent('keyup', {
    key: 'ArrowDown'
  });
  let inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true
  });
  e.dispatchEvent(mouseenterEvent);
  e.dispatchEvent(mouseoverEvent);
  e.dispatchEvent(mousedownEvent);
  e.dispatchEvent(focusEvent);
  if(value){
    e.value = value;
  }
  e.dispatchEvent(inputEvent);
  e.dispatchEvent(keyupEvent);
  e.dispatchEvent(inputEvent);
  e.dispatchEvent(mouseupEvent);
  if (ifDoubleClick) {
    console.log("双击")
    e.dispatchEvent(mousedownEvent);
    e.dispatchEvent(mouseupEvent);
  }


}

export const clickDispath = (e) => {

  var mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
  var mouseupEvent = new MouseEvent('mouseup', { bubbles: true });
  e.dispatchEvent(mousedownEvent);
  e.dispatchEvent(mouseupEvent);
  e.click();

}


export const waitForElementToDisplay = (querySelector, doc = null) => {

  return new Promise(function (resolve) {
    var maxWaitTime =3000; // 3秒
    var startTime = new Date().getTime();


    var interval = setInterval(function () {
      // 检查是否达到最大等待时间
      var currentTime = new Date().getTime();
      if (currentTime - startTime >= maxWaitTime) {

        // 达到最大等待时间，显示超时，清除定时器
        clearInterval(interval);
        console.log('超时，元素未显示,选择器：' + querySelector);
        resolve(false);
      }
      var element;
      if (doc == null) {
        element = document.querySelector(querySelector)
      } else {
        element = doc.querySelector(querySelector)
      }
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
    }, 200);
  });
}



export const waitForElementToDisplayByXpath = (xpath) => {

  return new Promise(function (resolve) {
    var maxWaitTime = 2000; // 2秒
    var startTime = new Date().getTime();


    var interval = setInterval(function () {
      // 检查是否达到最大等待时间
      var currentTime = new Date().getTime();
      if (currentTime - startTime >= maxWaitTime) {
        // 达到最大等待时间，显示超时，清除定时器
        clearInterval(interval);
        console.log('超时，元素未显示,xpath：' + xpath);
        resolve(false);
      }

      var element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
    }, 100);
  });
}