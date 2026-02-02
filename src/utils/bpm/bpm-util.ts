import { Message } from '@arco-design/web-vue';
import { getBpmInstEncrypt } from '@/api/bpm/bpm-instance';

// const baseUrl = window.location.origin;

export const encryptInstId = async (
  instId: string,
  callback: (id: string) => void
) => {
  try {
    const { data } = (await getBpmInstEncrypt(instId)) as any;
    if (!data.success) {
      Message.warning(data.message);
      return;
    }
    callback(data.data.instId);
  } finally {
    // epmty
  }
};

// 打开明细
export async function openDetail(
  appId: string,
  instId: string,
  _from?: string
) {
  if (appId) {
    // XXX: 先不管appId了
  }
  const rootUrl = `${window.location.origin}/bpm/bpm-instance-detail?instId=${instId}`;
  window.open(rootUrl, '_blank');
}

// 打开流程启动页
export async function openDraft(defKey: string) {
  const rootUrl = `${window.location.origin}/bpm/bpm-instance-start?defKey=${defKey}`;
  window.open(rootUrl, '_blank');
}

// 打开草稿页
export async function loadDraft(instId: string) {
  encryptInstId(instId, (encryptedId) => {
    const rootUrl = `${window.location.origin}/bpm/bpm-instance-start?instId=${encryptedId}`;
    window.open(rootUrl, '_blank');
    // }
  });
}

// 在流程启动页保存后，重新载入表单成为草稿页
export async function reloadDraft(instId: string) {
  encryptInstId(instId, (encryptedId) => {
    const rootUrl = `${window.location.origin}/bpm/bpm-instance-start?instId=${encryptedId}`;
    window.open(rootUrl, '_self');
  });
}

// 在流程启动后，重新载入表单成为详情页
export async function loadDetail(instId: string) {
  const rootUrl = `${window.location.origin}/bpm/bpm-instance-detail?instId=${instId}`;
  window.open(rootUrl, '_self');
}

// 打开流程启动页
export async function startProcess(defKey: string) {
  // let appKey = this.getAppKey();
  const rootUrl = `${window.location.origin}/bpm/bpm-instance-start?defKey=${defKey}`;
  window.open(rootUrl, '_blank');
}

// 打开任务详情页
export async function openTask(instId: string, taskId: string) {
  encryptInstId(instId, (encryptedId) => {
    const rootUrl = `${window.location.origin}/bpm/bpm-task-detail?instId=${encryptedId}&taskId=${taskId}`;
    window.open(rootUrl, '_blank');
  });
}
