import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { InAppBrowser, ToolBarType } from '@capgo/capacitor-inappbrowser';

/** Minimal valid one-page PDF. */
const PDF_BASE64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMTIwXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAzOSA+PgpzdHJlYW0KQlQgL0YxIDE4IFRmIDIwIDU1IFRkIChSRVBSTyBQREYpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0MSAwMDAwMCBuIAowMDAwMDAwMzMwIDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNiAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKNDAwCiUlRU9GCg==';

const output = document.querySelector('#output');
const log = (message) => {
  output.textContent += `${message}\n`;
};

const run = async (presentModal) => {
  output.textContent = '';
  try {
    const { uri } = await Filesystem.writeFile({
      path: 'repro.pdf',
      data: PDF_BASE64,
      directory: Directory.Cache,
    });
    log(`wrote ${uri}`);

    if (presentModal) {
      await InAppBrowser.openWebView({
        url: 'https://example.com',
        toolbarType: ToolBarType.NAVIGATION,
      });
      log('in-app browser presented, waiting 2s');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const result = await FileOpener.openFile({ path: uri, mimeType: 'application/pdf' });
    log(`openFile() resolved: ${JSON.stringify(result ?? null)}`);
  } catch (error) {
    log(`openFile() rejected: ${error?.message ?? String(error)}`);
  }
};

document.querySelector('#control').addEventListener('click', () => void run(false));
document.querySelector('#repro').addEventListener('click', () => void run(true));
