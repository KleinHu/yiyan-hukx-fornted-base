<template>
  <div class="process-map-inline">
    <a-spin :loading="loading" style="width: 100%">
      <div ref="canvasRef" class="canvas-container" />
      <div class="tip">点击节点可查看操作详情</div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import BpmnJs from 'bpmn-js/lib/Modeler';
  import '@/assets/style/bpm-image.less';
  import {
    getBpmnXmlFromParam,
    getBpmnImageNodeInfo,
  } from '@/api/bpm/bpm-image';

  const props = defineProps({
    instId: { type: String },
    defId: { type: String },
  });

  const STATUS_NODES = [
    { type: 'SKIP', stroke: '#2e9eef' },
    { type: 'REFUSE', stroke: '#ff8484' },
    { type: 'AGREE', stroke: '#83cd6c' },
    { type: 'BACK', stroke: '#b095f5' },
    { type: 'UNHANDLE', stroke: '#ff3737' },
    { type: 'HANDLE', stroke: '#ff3737' },
    { type: 'RECOVER', stroke: '#fcbc0d' },
    { type: 'INTERPOSE', stroke: '#fa894b' },
  ];

  const transNodeStyle = (status: string) => {
    const node = STATUS_NODES.find((elem) => elem.type === status);
    return node?.stroke;
  };

  const canvasRef = ref();
  const viewer = ref();
  const bpmXML = ref('');
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

      await viewer.value.importXML(bpmnXml);

      const elementRegistry = viewer.value.get('elementRegistry');
      const modeling = viewer.value.get('modeling');

      if (histories) {
        histories.forEach((node: any) => {
          const element = elementRegistry.get(node.nodeId);
          if (element) {
            modeling.setColor(element, {
              stroke: transNodeStyle(node.checkStatus),
            });
          }
        });
        const nodeIds = histories.map((elem: any) => elem.nodeId);
        setLineColor(pathMap, nodeIds);
      }

      setupEvents();
    } catch (err) {
      // ignore
    } finally {
      loading.value = false;
    }
  };

  const setLineColor = (pathMap: any[], nodeIds?: string[]) => {
    if (!nodeIds || nodeIds.length === 0) return;
    const elementRegistry = viewer.value.get('elementRegistry');
    const allElements = elementRegistry.getAll();
    const lines: any[] = [];
    const exclusiveGateways: any[] = [];

    allElements.forEach((elm: any) => {
      if (elm.source || elm.target) {
        const firstId = elm.source.id;
        const lastId = elm.target.id;
        if (firstId.indexOf('ExclusiveGateway') > -1) {
          exclusiveGateways.push(elm.source);
        }
        if (pathMap[firstId] && pathMap[firstId].includes(lastId)) {
          lines.push(elm);
        }
      }
    });

    const modeling = viewer.value.get('modeling');
    modeling.setColor(lines, { stroke: '#83cd6c' });
  };

  const setupEvents = () => {
    const eventBus = viewer.value.get('eventBus');
    const overlays = viewer.value.get('overlays');
    let currentElementId = '';

    eventBus.on('element.click', async (e: any) => {
      const { element } = e;
      if (element.type !== 'bpmn:UserTask') {
        overlays.clear();
        return;
      }

      if (currentElementId === element.id) {
        overlays.clear();
        currentElementId = '';
        return;
      }

      currentElementId = element.id;
      overlays.clear();

      const res = await getBpmnImageNodeInfo({
        instId: props.instId,
        defId: props.defId,
        nodeId: element.id,
      });

      if (res.data.taskNodeUser) {
        const html = createTooltipHtml(res.data);
        overlays.add(element.id, {
          position: { top: 80, left: 0 },
          html,
        });
      }
    });
  };

  const createTooltipHtml = (json: any) => {
    // Simplified tooltip creator for internal use
    const { taskNodeUser, histories } = json;
    return `
      <div class="bpm-image-tooltip">
        <div class="bpm-image-container">
          <div class="bpm-image-wrapper">
            <div style="font-weight: bold; margin-bottom: 8px;">${
              taskNodeUser.nodeText
            }</div>
            ${histories
              .map(
                (h: any) => `
              <div style="font-size: 12px; margin-bottom: 8px; border-top: 1px solid #eee; padding-top: 4px;">
                <div>审批人: ${h.handlerUserName}</div>
                <div>时间: ${h.updateTime}</div>
                <div>动作: ${h.jumpTypeName}</div>
                <div>意见: ${h.remark || '无'}</div>
              </div>
            `
              )
              .join('')}
            ${
              histories.length === 0
                ? '<div style="font-size: 12px;">暂无操作</div>'
                : ''
            }
          </div>
        </div>
      </div>
    `;
  };

  onMounted(() => {
    viewer.value = new BpmnJs({
      container: canvasRef.value,
      additionalModules: [
        {
          bendpoints: ['value', {}],
          labelEditingProvider: ['value', ''],
          paletteProvider: ['value', ''],
          contextPadProvider: ['value', ''],
          move: ['value', ''],
        },
      ],
    });
    fetchBpmXml();
  });
</script>

<style scoped lang="less">
  .process-map-inline {
    padding: 20px;
    background: #fff;
    min-height: 500px;
  }
  .canvas-container {
    width: 100%;
    height: 600px;
    border: 1px solid var(--color-border-2);
  }
  .tip {
    margin-top: 12px;
    color: var(--color-text-3);
    font-size: 12px;
  }
  :deep(.bjs-powered-by) {
    display: none;
  }
</style>
