import { Message } from '@arco-design/web-vue';
import uploadOaFileApi from '@/api/common/file';

export default function useFileTransfer() {
  /**
   * 通用网络文件下载方法 (Fetch Blob 并生成 ObjectURL 下载)，
   * 解决跨域图片、PDF 或普通文档在现代浏览器中直接展示而不下载的问题。
   *
   * @param url 文件的 url 网络地址
   * @param fileName 下载后的保存文件名（如果不传则尽量尝试从链接解析或使用默认名字）
   */
  const downloadFile = async (url: string, fileName?: string) => {
    if (!url) return;

    // 尝试解析文件名
    let finalName = fileName;
    if (!finalName) {
      finalName = url.split('?')[0].split('/').pop() || 'download';
    }

    const msg = Message.loading({
      content: '正在准备下载，请稍候...',
      duration: 0,
    });
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('网络请求异常');

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = objectUrl;
      link.setAttribute('download', finalName);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);

      msg.close();
      Message.success('下载成功');
    } catch (e) {
      console.error('Fetch下载失败，降级为新窗口打开:', e);
      msg.close();
      // 降级使用原本浏览器自带的下载机制
      window.open(url, '_blank');
    }
  };

  /**
   * 通用 OA 文件上传辅助方法
   * @param file 原生 File 对象
   * @param path MinIO或者后台存储的路径前缀 (如 /documents/xx分类)
   */
  const uploadFile = async (file: File, path?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadOaFileApi(formData, path);
  };

  return {
    downloadFile,
    uploadFile,
  };
}
