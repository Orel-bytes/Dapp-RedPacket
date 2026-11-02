import ClipboardJS from 'clipboard';

export default function handleClipboardElement(text, domElm) {
  const clipboard =  new ClipboardJS(domElm, {
    text:() => text
  })
  clipboard.on('success',() => {
    clipboard.destroy()
  })
  clipboard.on('error',() =>{
    clipboard.destroy()
  })
  domElm.click();
}


