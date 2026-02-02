<!-- 把icon从名称转成组件 -->
<!-- 基于standard-menu组件改造，属于menu-select-modal组件专用 -->
<!--created by yuyupeng-->
<!--2023/11/15-->
<script lang="tsx">
  import { defineComponent, h, compile } from 'vue';

  export default defineComponent({
    name: 'MenuIcon',
    props: {
      element: {
        type: Object,
        default: null,
      },
      size: { type: Number },
    },
    setup(props) {
      if (props.size !== null && props.size !== undefined) {
        return props.element?.meta?.icon
          ? () =>
              h(
                compile(
                  `<${props.element?.meta?.icon} style="color: rgb(36, 103, 255, 0.8)" :size="${props.size}" />`
                )
              )
          : () => null;
      }
      return props.element?.meta?.icon
        ? () =>
            h(
              compile(
                `<${props.element?.meta?.icon} style="color: rgb(36, 103, 255, 0.8)" />`
              )
            )
        : () => null;
    },
  });
</script>
