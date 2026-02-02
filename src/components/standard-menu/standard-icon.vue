<!-- 把icon从名称转成组件 -->
<script lang="tsx">
  import { defineComponent, h, compile } from 'vue';

  export default defineComponent({
    name: 'StandardIcon',
    props: {
      element: {
        type: Object,
        default: null,
      },
    },
    setup(props) {
      return props.element?.meta?.icon
        ? () => h(compile(`<${props.element?.meta?.icon}/>`))
        : () => null;
    },
  });
</script>
