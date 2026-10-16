import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { InAppBrowser, ToolBarType } from '@capgo/capacitor-inappbrowser';

/** Minimal valid one-page PDF. */
const PDF_BASE64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMTIwXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAzOSA+PgpzdHJlYW0KQlQgL0YxIDE4IFRmIDIwIDU1IFRkIChSRVBSTyBQREYpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0MSAwMDAwMCBuIAowMDAwMDAwMzMwIDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNiAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKNDAwCiUlRU9GCg==';

const output = document.querySelector('#output');
const log = (message) => {
  output.textContent += `${message}\n`;
};

const writePdf = async (path) => {
  const { uri } = await Filesystem.writeFile({ path, data: PDF_BASE64, directory: Directory.Cache });
  log(`wrote ${uri}`);
  return uri;
};

const run = async (presentModal) => {
  output.textContent = '';
  try {
    const uri = await writePdf('repro.pdf');

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

const runDoubleOpen = async () => {
  output.textContent = '';
  try {
    const firstUri = await writePdf('first.pdf');
    const secondUri = await writePdf('second.pdf');
    const start = performance.now();
    const elapsed = () => `+${Math.round(performance.now() - start)} ms`;

    log(`${elapsed()} openFile(first.pdf) called`);
    await FileOpener.openFile({ path: firstUri, mimeType: 'application/pdf' });
    log(`${elapsed()} openFile(first.pdf) resolved, waiting 300 ms`);
    await new Promise((resolve) => setTimeout(resolve, 300));

    log(`${elapsed()} openFile(second.pdf) called`);
    await FileOpener.openFile({ path: secondUri, mimeType: 'application/pdf' });
    log(`${elapsed()} openFile(second.pdf) resolved`);
  } catch (error) {
    log(`openFile() rejected: ${error?.message ?? String(error)}`);
  }
};

document.querySelector('#control').addEventListener('click', () => void run(false));
document.querySelector('#repro').addEventListener('click', () => void run(true));
document.querySelector('#double').addEventListener('click', () => void runDoubleOpen());
