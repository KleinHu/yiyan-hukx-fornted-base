import { DirectiveBinding } from 'vue';
import { useUserStore } from '@/store';

function createEmpty() {
  const emptyElem = document.createElement('span');
  emptyElem.style.textAlign = 'center';
  emptyElem.style.display = 'block';
  emptyElem.style.width = '100%';
  emptyElem.setAttribute('disabled', 'true');
  emptyElem.style.color = 'var(--color-link-light-3)';
  emptyElem.style.cursor = 'not-allowed';
  emptyElem.innerText = '无';
  return emptyElem;
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value } = binding;
  const userStore = useUserStore();
  const { permissions } = userStore;

  if (Array.isArray(value)) {
    if (value.length > 0) {
      const permissionValues = value;

      let hasPermission = false;
      permissions?.forEach((p) => {
        hasPermission = hasPermission || permissionValues.includes(p);
      });
      if (!hasPermission && el.parentNode) {
        let parent = el.parentNode.parentElement;
        el.parentNode.removeChild(el);

        // 删除元素后针对表格内部的按钮或链接进行处理
        while (parent?.nodeName !== 'BODY' && parent?.parentElement) {
          if (parent.nodeName === 'TD') {
            break;
          }
          parent = parent?.parentElement;
        }
        if (parent?.nodeName === 'TD') {
          // 表格中的操作
          const btnNum: number =
            parent.getElementsByTagName('a').length +
            parent.getElementsByTagName('button').length;
          if (btnNum === 0) {
            // 表格内无任何可用操作
            const emptyElem = createEmpty();
            let childNode = parent.lastChild;
            while (childNode) {
              const prevNode = childNode.previousSibling;
              parent.removeChild(childNode);
              childNode = prevNode;
            }
            parent.appendChild(emptyElem);
          }
        }
      }
    }
  } else {
    throw new Error(
      `need permissions! Like v-permission="['menu:add','menu:edit']"`
    );
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
};
