<script lang="tsx">
  import { defineComponent, ref, h, compile, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter, RouteRecordRaw } from 'vue-router';
  import type { RouteMeta } from 'vue-router';
  import { useAppStore } from '@/store';
  import { listenerRouteChange } from '@/utils/route-listener';
  import { openWindow, regexUrl } from '@/utils';
  import useMenuTree from './use-menu-tree';

  export default defineComponent({
    emit: ['collapse'],
    setup() {
      const { t } = useI18n();
      const appStore = useAppStore();
      const router = useRouter();
      const route = useRoute();
      const { menuTree } = useMenuTree();
      const collapsed = computed({
        get() {
          if (appStore.device === 'desktop') return appStore.menuCollapse;
          return false;
        },
        set(value: boolean) {
          appStore.updateSettings({ menuCollapse: value });
        },
      });

      const topMenu = computed(() => appStore.topMenu);
      const openKeys = ref<string[]>([]);
      const selectedKey = ref<string[]>([]);

      const goto = (item: RouteRecordRaw) => {
        // Open external link
        if (regexUrl.test(item.path)) {
          openWindow(item.path);
          selectedKey.value = [item.name as string];
          return;
        }
        // Eliminate external link side effects
        const { hideInMenu, activeMenu } = item.meta as RouteMeta;
        if (route.name === item.name && !hideInMenu && !activeMenu) {
          selectedKey.value = [item.name as string];
          return;
        }
        // Trigger router change
        router.push({
          name: item.name,
        });
      };
      const findMenuOpenKeys = (target: string) => {
        const result: string[] = [];
        let isFind = false;
        const backtrack = (item: RouteRecordRaw, keys: string[]) => {
          if (item.name === target) {
            isFind = true;
            result.push(...keys);
            return;
          }
          if (item.children?.length) {
            item.children.forEach((el) => {
              backtrack(el, [...keys, el.name as string]);
            });
          }
        };
        menuTree.value.forEach((el: RouteRecordRaw) => {
          if (isFind) return; // Performance optimization
          backtrack(el, [el.name as string]);
        });
        return result;
      };
      listenerRouteChange((newRoute) => {
        const { requiresAuth, activeMenu, hideInMenu } = newRoute.meta;
        if (requiresAuth && (!hideInMenu || activeMenu)) {
          const menuOpenKeys = findMenuOpenKeys(
            (activeMenu || newRoute.name) as string
          );

          const keySet = new Set([...menuOpenKeys, ...openKeys.value]);
          openKeys.value = [...keySet];

          selectedKey.value = [
            activeMenu || menuOpenKeys[menuOpenKeys.length - 1],
          ];
        }
      }, true);
      const setCollapse = (val: boolean) => {
        if (appStore.device === 'desktop')
          appStore.updateSettings({ menuCollapse: val });
      };

      const renderSubMenu = () => {
        function travel(_route: RouteRecordRaw[], nodes = []) {
          if (_route) {
            _route.forEach((element) => {
              // This is demo, modify nodes as needed
              const icon = element?.meta?.icon
                ? () => h(compile(`<${element?.meta?.icon}/>`))
                : null;
              const node =
                element?.children && element?.children.length !== 0 ? (
                  <a-sub-menu
                    key={element?.name}
                    v-slots={{
                      icon,
                      title: () =>
                        h(
                          compile(
                            element?.meta?.title ||
                              t(element?.meta?.locale || '')
                          )
                        ),
                    }}
                  >
                    {travel(element?.children)}
                  </a-sub-menu>
                ) : (
                  <a-menu-item
                    key={element?.name}
                    v-slots={{ icon }}
                    onClick={() => goto(element)}
                  >
                    {element?.meta?.title || t(element?.meta?.locale || '')}
                  </a-menu-item>
                );
              nodes.push(node as never);
            });
          }
          return nodes;
        }
        return travel(menuTree.value);
      };

      return () => (
        <a-menu
          mode={topMenu.value ? 'horizontal' : 'vertical'}
          v-model:collapsed={collapsed.value}
          v-model:open-keys={openKeys.value}
          show-collapse-button={appStore.device !== 'mobile'}
          auto-open={false}
          selected-keys={selectedKey.value}
          auto-open-selected={true}
          level-indent={34}
          style="height: 100%;width:100%;"
          onCollapse={setCollapse}
        >
          {renderSubMenu()}
        </a-menu>
      );
    },
  });
</script>

<style lang="less" scoped>
  :deep(.arco-menu-inner) {
    .arco-menu-vertical & {
      height: calc(100% - 48px);
      padding: 0;
      border-bottom: 1px solid var(--color-fill-3);

      .arco-menu-selected {
        color: var(--color-text-selected-avic);
      }

      .arco-menu-item.arco-menu-selected {
        background-color: var(--color-bg-selected-avic);
        border-left: 3px solid var(--color-text-selected-avic);
      }

      .arco-menu-pop-header {
        padding: 0 16px;
      }

      .arco-menu-pop-header.arco-menu-selected {
        padding: 0 13px;
        background-color: var(--color-bg-selected-avic);
        border-left: 3px solid var(--color-text-selected-avic);
      }

      .arco-menu-inline-header {
        display: flex;
        align-items: center;
        height: 38px;
        padding: 0 16px;
      }

      .arco-menu-inline-content {
        padding: 4px 0;
      }

      .arco-menu-indent {
        width: 16px !important;
      }
    }

    .arco-icon {
      &:not(.arco-icon-down) {
        font-size: 18px;
      }
    }

    .arco-menu-horizontal & {
      padding-left: 40px;
      overflow: hidden;
      background-color: var(--color-blue-avic);

      .arco-menu-selected-label {
        height: 3px;
        margin-bottom: 3px;
        background-color: #fff;
      }

      .arco-icon {
        color: #fff;
      }

      .arco-menu-pop-header {
        margin: 0 10px;
        padding: 0 10px;
        color: #fff;
        background-color: var(--color-blue-avic);

        &:hover {
          background-color: var(--color-blue-avic);
        }
      }

      .arco-menu-pop-header.arco-menu-selected {
        color: #fff;
      }
    }
  }

  :deep(.arco-menu-collapse-button) {
    left: 12px;
    background-color: #fff;

    &:hover {
      color: var(--color-text-avic-1);
      background-color: #fff;
    }
  }
</style>
