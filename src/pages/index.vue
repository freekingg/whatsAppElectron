<template>
  <div>home.

<webview id="foo" src="https://www.github.com/" style="display:inline-flex; width:640px; height:480px"></webview>


    <iframe width="100%" height="600" src="https://web.whatsapp.com/" frameborder="0"></iframe>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  name: 'home',
  created(){
    console.log(ipcRenderer)
  }
}
</script>

