import ClipboardJS from 'clipboard';

export default function handleClipboard(text, event) {
  const clipboard =  new ClipboardJS(event.target, {
      text:() => text
  })
  clipboard.on('success',() => {
      clipboard.destroy()
  })
  clipboard.on('error',() =>{
      clipboard.destroy()
  })
  clipboard.onClick(event)
}
