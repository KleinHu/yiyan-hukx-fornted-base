<!--对话框：修改密码-->
<template>
  <div>
    <a-modal
      :visible="visible"
      title="修改密码"
      :mask-closable="false"
      @before-ok="validate"
      @cancel="closeModal"
    >
      <div class="error-msg">{{ errorMessage }}</div>
      <a-form ref="formRef" :model="form" :rules="rules">
        <a-form-item field="password" label="当前密码">
          <a-input-password
            v-model="form.password"
            allow-clear
            autocomplete="off"
            placeholder="密码"
          />
        </a-form-item>
        <a-form-item field="newPassword" label="新密码">
          <a-input-password
            v-model="form.newPassword"
            allow-clear
            autocomplete="off"
            placeholder="新密码"
          />
        </a-form-item>
        <a-form-item field="checkPassword" label="确认密码">
          <a-input-password
            v-model="form.checkPassword"
            allow-clear
            autocomplete="off"
            placeholder="确认密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts" name="PasswordModal">
  import { ref } from 'vue';
  import { useUserStore } from '@/store';
  import { updatePassword } from '@/api/system/user';
  import { Modal } from '@arco-design/web-vue';

  defineProps({
    visible: { type: Boolean, default: false },
  });
  const emits = defineEmits(['update:visible']);

  const closeModal = () => {
    formRef.value.resetFields();
    errorMessage.value = '';
    emits('update:visible', false);
  };

  const errorMessage = ref('');
  const userStore = useUserStore();
  const changePassword = async (done: (closed: boolean) => void) => {
    // 提交表单
    try {
      await updatePassword({
        password: window.btoa(form.value.password),
        newPassword: window.btoa(form.value.newPassword),
        id: userStore.id || '',
      });
      await userStore.logout();
      Modal.success({
        title: '修改成功',
        content: '密码修改成功，请重新登录。',
        async onOk() {
          window.location.reload();
        },
      });
      closeModal();
    } catch (err) {
      formRef.value.resetFields();
      errorMessage.value = (err as Error).message;
    } finally {
      done(true);
    }
  };
  const formRef = ref<any>();
  const validate = async (done: (closed: boolean) => void) => {
    const errors = await formRef.value.validate();
    if (!errors) {
      changePassword(done);
    }
  };

  const checkValidator = (
    value: string,
    callback: (error?: string) => void
  ) => {
    if (form.value.newPassword !== value) {
      callback('确认密码需与新密码一致');
    }
  };
  const newPwdValidator = (
    value: string,
    callback: (error?: string) => void
  ) => {
    if (form.value.password === value) {
      callback('新密码不能与旧密码相同');
    }
  };
  const rules = {
    password: [{ required: true, message: '请输入当前密码' }],
    newPassword: [
      { required: true, message: '请输入新密码' },
      { validator: newPwdValidator },
    ],
    checkPassword: [
      { required: true, message: '请再次输入新密码' },
      { validator: checkValidator },
    ],
  };
  const generateForm = () => {
    return {
      password: '',
      newPassword: '',
      checkPassword: '',
    };
  };
  const form = ref(generateForm());
</script>

<style scoped lang="less">
  .error-msg {
    height: 32px;
    color: rgb(var(--red-6));
    line-height: 32px;
  }
</style>
