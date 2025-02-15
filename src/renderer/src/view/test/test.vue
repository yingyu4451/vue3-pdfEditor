<template>
  <div>
    <input type="file" @change="handleFileUpload">
    <div v-if="result">识别结果: {{ result }}</div>
  </div>
</template>

<script>
import { createWorker } from 'tesseract.js';

export default {
  data() {
    return {
      result: null,
      worker: null,
    };
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.worker = createWorker({
        logger: m => console.log(m) // 可以选择不显示日志
      });
      await this.worker.load();
      await this.worker.loadLanguage('chi_sim'); // 加载简体中文语言包
      await this.worker.initialize('chi_sim'); // 初始化语言包
      const { data: { text } } = await this.worker.recognize(file); // 识别图片中的文字
      this.result = text;
      await this.worker.terminate(); // 结束工作线程
    }
  }
}
</script>
