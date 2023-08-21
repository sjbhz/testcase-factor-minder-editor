<!--
 * @Descripttion: 保存按钮
 * @LastEditors: qinjie
 * @LastEditTime: 2023-08-21
-->
<template lang="">
  <div class="expand-group">
    <i class="el-icon-folder expand" style="font-size: 23px;cursor: pointer;text-align: center"  @click="saveMind"></i>
    <div style='margin-top:-13px;color:#606266'>
      <span>保存</span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "saveBox",
  data() {
    return {};
  },
  computed: {
    ...mapGetters("caseEditorStore", {
      minder: "getMinder"
    }),
  },
  methods: {
    saveMind(index) {
      this.$emit("saveMind");
    }
  },
  created() {}
};
</script>
<style scoped>
</style>
