<!--对话框：流程图预览-->
<template>
  <div>
    <a-button v-if="type === 'button'" type="outline" @click="open">
      流程图
    </a-button>
    <a-link v-if="type === 'link'" @click="open">流程图</a-link>
    <a-modal v-model:visible="visible" width="100vw" title="流程图">
      <a-spin :loading="loading" style="width: 100%">
        <div ref="canvasRef" style="width: 100%; height: calc(90vh - 180px)" />
      </a-spin>
      <div style="color: var(--color-text-3)">点击节点可查看操作详情</div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref } from 'vue';
  import BpmnJs from 'bpmn-js/lib/Modeler';
  import '@/assets/style/bpm-image.less';
  import {
    getBpmnXmlFromParam,
    getBpmnImageNodeInfo,
  } from '@/api/bpm/bpm-image';

  const props = defineProps({
    instId: { type: String },
    defId: { type: String },
    type: { type: String as PropType<'button' | 'link'>, default: 'button' },
  });

  const STATUS_NODES = [
    { type: 'SKIP', stroke: '#2e9eef' }, // 跳过
    { type: 'REFUSE', stroke: '#ff8484' }, // 不同意
    { type: 'AGREE', stroke: '#83cd6c' }, // 同意
    { type: 'BACK', stroke: '#b095f5' }, // 驳回
    { type: 'UNHANDLE', stroke: '#ff3737' }, // 未处理
    { type: 'HANDLE', stroke: '#ff3737' }, // 正在处理（当前节点）；
    // { type: 'OVERTIME_AUTO_AGREE', stroke: '#' }, // 超时审批
    { type: 'RECOVER', stroke: '#fcbc0d' }, // 撤回
    // { type: 'ABSTAIN', stroke: '#' }, // 弃权
    { type: 'INTERPOSE', stroke: '#fa894b' }, // 干预
  ];
  const transNodeStyle = (status: string) => {
    const node = STATUS_NODES.find((elem) => elem.type === status);
    return node?.stroke;
  };

  const visible = ref(false);
  const open = () => {
    visible.value = true;
    initViewer();
  };

  const canvasRef = ref();
  const viewer = ref();
  const bpmXML = ref('');
  const bpmNodes = ref<any[]>([]);

  const loading = ref(false);
  const fetchBpmXml = async () => {
    try {
      loading.value = true;
      const { data } = await getBpmnXmlFromParam({
        instId: props.instId,
        defId: props.defId,
        preview: false,
        showHis: true,
      });
      const { bpmnXml, histories, pathMap } = data;
      bpmXML.value = bpmnXml;
      bpmNodes.value = histories;

      // 获取流程节点实例
      const elementRegistry = viewer.value.get('elementRegistry');
      // 用于为节点添加颜色
      const modelings = viewer.value.get('modeling');
      if (histories) {
        // 在查看流程实例/流程任务对应实例的审批历史
        // 需根据状态设置节点颜色
        histories.forEach((node: any) => {
          setTimeout(() => {
            modelings.setColor(elementRegistry.get(node.nodeId), {
              stroke: transNodeStyle(node.checkStatus),
            });
          });
        });
        setTimeout(() => {
          const nodeIds = histories.map((elem: any) => elem.nodeId);
          setLineColor(pathMap, nodeIds);
        });
      }

      // 获取节点事件
      const eventBus = viewer.value.get('eventBus');
      const overlays = viewer.value.get('overlays');
      let ishovers = false;
      let idx = '';
      eventBus.on('element.click', async (e: any) => {
        const { element } = e;
        if (element.type !== 'bpmn:UserTask') {
          overlays.clear();
          ishovers = false;
          return;
        }
        if (element.id && idx !== element.id) {
          if (overlays) {
            overlays.clear();
          }
          overlays.clear();
          ishovers = false;
          idx = element.id;
        }
        if (ishovers) {
          return;
        }

        const res = await getBpmnImageNodeInfo({
          instId: props.instId,
          defId: props.defId,
          nodeId: element.id,
        });
        if (!res.data.taskNodeUser) {
          return;
        }
        const $overlayHtml = createHtml(res.data);
        overlays.add(element.id, {
          position: { top: 80, left: 0 },
          html: $overlayHtml,
        });
        // itemClick(overlays);
        ishovers = true;
      });
    } finally {
      loading.value = false;
    }
  };

  const setLineColor = (pathMap: any[], nodeIds?: string[]) => {
    if (!nodeIds || nodeIds.length === 0) {
      return;
    }
    const elementRegistry = viewer.value.get('elementRegistry');
    const elementRegistryAll = elementRegistry.getAll();
    const lines: any[] = [];
    // 网关节点
    const exclusiveGateway: any[] = [];

    elementRegistryAll.forEach((elm: any) => {
      const isLine = elm.source || elm.target;
      if (isLine) {
        // 是否是线条 ；
        const firstId = elm.source.id;
        const lastId = elm.target.id;
        if (firstId.indexOf('ExclusiveGateway') > -1) {
          exclusiveGateway.push(elm.source);
        }
        if (pathMap[firstId] && pathMap[firstId].includes(lastId)) {
          lines.push(elm);
        }
      }
    });
    // 删选 线条走过的网关节点
    const concatLine: any[] = [];
    lines.forEach((node: any) => {
      if (
        node &&
        node.type === 'bpmn:SequenceFlow' &&
        node.target &&
        node.target.type === 'bpmn:ExclusiveGateway'
      ) {
        const exclusiveGatewayId = node.target.id;
        const findExclusiveGateway = exclusiveGateway.find(
          (exclus: any) => exclus.id === exclusiveGatewayId
        );
        const hasConcatLine = concatLine.find(
          (item) => item.id === exclusiveGatewayId
        );
        if (findExclusiveGateway && !hasConcatLine) {
          concatLine.push(findExclusiveGateway);
        }
      }
    });
    const modeling = viewer.value.get('modeling');
    modeling.setColor([...lines, ...concatLine], {
      stroke: '#83cd6c',
    });
  };

  const createHtml = (json: any) => {
    const { taskNodeUser, histories } = json;
    const outerElem = document.createElement('div');
    const divElem = document.createElement('div');
    divElem.className = 'bpm-image-tooltip';
    const containerElem = document.createElement('div');
    containerElem.className = 'bpm-image-container';
    const wrapperElem = document.createElement('div');
    wrapperElem.className = 'bpm-image-wrapper';
    const headElem = document.createElement('div');
    headElem.innerText = taskNodeUser.nodeText;

    wrapperElem.appendChild(headElem);

    if (taskNodeUser.multiInstance === 'parallel') {
      const typeEle = document.createElement('div');
      typeEle.innerText = '并行';
      wrapperElem.appendChild(typeEle);
    } else if (taskNodeUser.multiInstance === 'sequential') {
      const typeEle = document.createElement('div');
      typeEle.innerText = '串行';
      wrapperElem.appendChild(typeEle);
    }

    if ((histories || []).length === 0) {
      const titleElem = document.createElement('div');
      taskNodeUser.configExecutors.forEach((user: any) => {
        const userElem = document.createElement('span');
        userElem.innerText = user.name;
        titleElem.appendChild(userElem);
      });
      wrapperElem.appendChild(titleElem);
    }
    const contentElem = document.createElement('div');
    histories.forEach((elem: any) => {
      const { createTime, jumpTypeName, updateTime, remark, handlerUserName } =
        elem;
      const detailElem = document.createElement('div');
      const dlElem = document.createElement('dl');

      dlElem.appendChild(createDdElem('审批人', handlerUserName));
      dlElem.appendChild(createDdElem('到达时间', createTime));
      dlElem.appendChild(createDdElem('审批动作', jumpTypeName));
      dlElem.appendChild(createDdElem('审批时间', updateTime));
      dlElem.appendChild(createDdElem('审批意见', remark));

      detailElem.appendChild(dlElem);
      contentElem.appendChild(detailElem);
    });
    if ((histories || []).length === 0) {
      const emptyElem = document.createElement('div');
      emptyElem.innerText = '暂无操作';
      contentElem.appendChild(emptyElem);
    }
    wrapperElem.appendChild(contentElem);
    outerElem.appendChild(divElem);
    divElem.appendChild(containerElem);
    containerElem.appendChild(wrapperElem);
    return outerElem.innerHTML;
  };

  // 创建dd节点（包含一对label:value元素）
  const createDdElem = (label: string, value: string) => {
    const ddElem = document.createElement('dd');
    const labelElem = document.createElement('span');
    const textElem = document.createElement('span');
    labelElem.innerText = label;
    textElem.innerText = value;
    labelElem.className = 'bpm-image-content-label';
    textElem.className = 'bpm-image-content-text';
    ddElem.appendChild(labelElem).appendChild(textElem);
    return ddElem;
  };

  const initViewer = async () => {
    if (viewer.value) {
      viewer.value.clear();
    } else {
      viewer.value = new BpmnJs({
        container: canvasRef.value,
        additionalModules: [
          {
            bendpoints: ['value', {}],
            labelEditingProvider: ['value', ''],
            paletteProvider: ['value', ''],
            contextPadProvider: ['value', ''],
            move: ['value', ''],
            // __init__: ['customRenderer'],
            // customRenderer: ['type', CustomRenderer],
          },
        ],
      });
    }
    try {
      await fetchBpmXml();
      await viewer.value.importXML(bpmXML.value);
    } catch (err) {
      // empty
    }
  };
</script>

<style scoped lang="less">
  :deep(.bjs-powered-by) {
    display: none;
  }
</style>
